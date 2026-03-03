import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        learningPlan: {
          select: { userId: true },
        },
        exercises: {
          select: {
            id: true,
            mode: true,
            title: true,
            description: true,
            pointsValue: true,
            completed: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!module) {
      return Response.json(
        { message: 'Module introuvable' },
        { status: 404 }
      );
    }

    // Check if user owns this module
    if (module.learningPlan.userId !== session.user.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Block access to a module if any previous module has rejected/revision-needed videos.
    const previousModules = await prisma.module.findMany({
      where: {
        planId: module.planId,
        week: { lt: module.week },
      },
      include: {
        exercises: {
          where: { userId: session.user.id },
          include: {
            videoSubmissions: {
              select: { status: true },
            },
          },
        },
      },
    });

    const blocked = previousModules.some((m) =>
      m.exercises.some((exercise) =>
        exercise.videoSubmissions.some((video) => ['REJECTED', 'REVISION_NEEDED'].includes(video.status))
      )
    );

    if (blocked) {
      return Response.json(
        {
          message:
            'Module bloqué: une vidéo d’un module précédent a été refusée ou demande une révision.',
        },
        { status: 423 }
      );
    }

    const { learningPlan, ...moduleData } = module;

    return Response.json(moduleData);
  } catch (error) {
    console.error('Module fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

