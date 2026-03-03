import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createWishSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  category: z.string().min(2).max(60),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const wishes = await prisma.wish.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(wishes);
  } catch (error) {
    console.error('Wishes fetch error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const data = createWishSchema.parse(body);

    const wish = await prisma.wish.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
      },
    });

    return Response.json(wish, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }

    console.error('Wish create error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

