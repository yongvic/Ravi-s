import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const wish = await prisma.wish.findUnique({ where: { id: params.id } });
    if (!wish) {
      return Response.json({ message: 'Souhait introuvable' }, { status: 404 });
    }

    const updated = await prisma.wish.update({
      where: { id: params.id },
      data: { votes: { increment: 1 } },
    });

    return Response.json(updated);
  } catch (error) {
    console.error('Wish vote error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

