import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateResetToken, hashResetToken, passwordResetIdentifier } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/mailer';

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    // Always return generic success to avoid user enumeration.
    const genericResponse = Response.json(
      { message: 'Si ce compte existe, un email de réinitialisation a été envoyé.' },
      { status: 200 }
    );

    if (!parsed.success) {
      return genericResponse;
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      return genericResponse;
    }

    const identifier = passwordResetIdentifier(email);
    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier } });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
        expires,
      },
    });

    const origin = new URL(req.url).origin;
    const appUrl = process.env.NEXTAUTH_URL || origin;
    const resetUrl = `${appUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordResetEmail({ to: email, resetUrl });
    } catch (mailError) {
      console.error('Password reset email error:', mailError);
    }

    return genericResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json(
      { message: 'Si ce compte existe, un email de réinitialisation a été envoyé.' },
      { status: 200 }
    );
  }
}

