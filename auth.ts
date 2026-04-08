import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/shared/lib/prisma';

class InvalidCredentialsError extends CredentialsSignin {
  code = 'invalid_credentials';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) throw new InvalidCredentialsError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) throw new InvalidCredentialsError();

        // Lazy-import bcryptjs so it only loads in Node.js context
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new InvalidCredentialsError();

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
