import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const kikiPoints = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
      select: {
        totalPoints: true,
        weeklyPoints: true,
        monthlyPoints: true,
      },
    });

    // Count only completed exercises
    const completedExercises = await prisma.exercise.count({
      where: {
        userId: session.user.id,
        completed: true,
      },
    });

    return Response.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints: kikiPoints?.weeklyPoints || 0,
      monthlyPoints: kikiPoints?.monthlyPoints || 0,
      completedExercises,
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

