import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            console.log(`Login attempt for deactivated user: ${user.email}`);
            return null;
          }

          // Check if user has a password (not a Google user)
          if (!user.password) {
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
        token.provider = account?.provider;
        token.userId = user.id; // Store the MongoDB ObjectId
      }
      
      // Verify user is still active on each token refresh
      if (token.userId && !user) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.userId);
          if (dbUser) {
            token.isActive = dbUser.isActive;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string; // Use MongoDB ObjectId instead of token.sub
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for Google sign-in
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: 'google',
              role: 'user',
              isActive: true,
            });
            
            // Update the user object with MongoDB ObjectId and role for session
            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.isActive = newUser.isActive;
          } else {
            // Check if existing user is active
            if (!existingUser.isActive) {
              console.log(`Login attempt for deactivated Google user: ${existingUser.email}`);
              return false;
            }
            
            // Update existing user's image if it's from Google
            if (account.provider === 'google' && user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              existingUser.provider = 'google';
              await existingUser.save();
            }
            
            // Set MongoDB ObjectId and role for session
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.isActive = existingUser.isActive;
          }
          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 