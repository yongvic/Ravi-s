import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { hashResetToken, passwordResetIdentifier } from '@/lib/password-reset';

const bodySchema = z
  .object({
    email: z.string().email(),
    token: z.string().min(32),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ message: 'Données invalides.' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const identifier = passwordResetIdentifier(email);
    const tokenHash = hashResetToken(parsed.data.token);

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: tokenHash,
        expires: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return Response.json({ message: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ message: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({ where: { identifier } }),
    ]);

    return Response.json({ message: 'Mot de passe mis à jour avec succès.' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

