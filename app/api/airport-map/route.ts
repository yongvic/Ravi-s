import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const completedExercises = await prisma.exercise.count({
      where: { userId: session.user.id, completed: true },
    });

    const totalExercises = await prisma.exercise.count({
      where: { userId: session.user.id },
    });

    const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    const currentTerminal = Math.min(5, Math.max(1, Math.ceil(progressPercentage / 20)));

    const updated = await prisma.airportMap.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        progressPercentage,
        currentTerminal,
        completedAreas: [],
      },
      update: {
        progressPercentage,
        currentTerminal,
        lastProgressAt: new Date(),
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error('Airport map error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

