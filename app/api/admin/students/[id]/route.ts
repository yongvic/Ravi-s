import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json({ message: 'Non autorisé' }, { status: 403 });
    }

    const student = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        onboarding: {
          select: {
            englishLevel: true,
            professionGoal: true,
            airportCode: true,
            airportName: true,
          },
        },
      },
    });

    if (!student) {
      return Response.json({ message: 'Student not found' }, { status: 404 });
    }

    const [exerciseCount, videoCount, approvedCount, points] = await Promise.all([
      prisma.exercise.count({ where: { userId: params.id, completed: true } }),
      prisma.video.count({ where: { userId: params.id } }),
      prisma.video.count({ where: { userId: params.id, status: 'APPROVED' } }),
      prisma.kikiPoints.findUnique({ where: { userId: params.id }, select: { totalPoints: true } }),
    ]);

    return Response.json({
      ...student,
      stats: {
        exercisesCompleted: exerciseCount,
        videosSubmitted: videoCount,
        videosApproved: approvedCount,
        totalPoints: points?.totalPoints || 0,
      },
    });
  } catch (error) {
    console.error('Admin student detail error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

