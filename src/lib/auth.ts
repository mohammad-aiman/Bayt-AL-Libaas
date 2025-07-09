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
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback:', {
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider
      });

      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
        token.provider = account?.provider;
        token.userId = user.id;
      }
      
      if (token.userId && !user) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.userId);
          console.log('Token Refresh:', {
            userId: token.userId,
            userFound: !!dbUser,
            isActive: dbUser?.isActive
          });
          
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
      console.log('Session Callback:', {
        hasToken: !!token,
        hasUser: !!session.user,
        provider: token?.provider
      });

      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback Details:', {
        userEmail: user?.email,
        accountType: account?.type,
        provider: account?.provider,
        hasProfile: !!profile,
        timestamp: new Date().toISOString(),
        env: {
          nodeEnv: process.env.NODE_ENV,
          nextAuthUrl: process.env.NEXTAUTH_URL,
          vercelUrl: process.env.VERCEL_URL,
        }
      });

      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          
          console.log('Google SignIn Check:', {
            email: user.email,
            userExists: !!existingUser,
            isActive: existingUser?.isActive
          });
          
          if (!existingUser) {
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: 'google',
              role: 'user',
              isActive: true,
            });
            
            console.log('Created new Google user:', {
              id: newUser._id,
              email: newUser.email
            });
            
            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.isActive = newUser.isActive;
          } else {
            if (!existingUser.isActive) {
              console.log(`Login attempt for deactivated Google user: ${existingUser.email}`);
              return false;
            }
            
            if (account.provider === 'google' && user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              existingUser.provider = 'google';
              await existingUser.save();
              console.log('Updated existing user image:', existingUser.email);
            }
            
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.isActive = existingUser.isActive;
          }
          return true;
        } catch (error) {
          console.error('Detailed Google SignIn Error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            email: user?.email
          });
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Add custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
}; 