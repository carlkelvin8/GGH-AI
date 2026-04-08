import { prisma } from '@/shared/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const runtime = 'nodejs';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json({ 
        error: 'Invalid request format. Please check your input.' 
      }, { status: 400 });
    }
    
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ 
        error: 'Please enter a valid email address.' 
      }, { status: 400 });
    }

    const { email } = parsed.data;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to database
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // TODO: Send email with reset link
      // For now, we'll just log it (in production, use a proper email service)
      console.log(`Password reset requested for ${email}`);
      console.log(`Reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);
      
      // In production, you would send an email here:
      // await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success response
    return Response.json({ 
      message: 'If an account with that email exists, we\'ve sent a password reset link.' 
    }, { status: 200 });

  } catch (err) {
    console.error('[forgot-password] error:', err);
    return Response.json({ 
      error: 'Something went wrong. Please try again later.' 
    }, { status: 500 });
  }
}