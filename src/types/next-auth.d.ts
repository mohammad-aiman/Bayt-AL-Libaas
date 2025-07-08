import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    userId: string;
    isActive: boolean;
  }
} 