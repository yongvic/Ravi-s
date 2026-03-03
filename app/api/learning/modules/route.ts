import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const learningPlan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
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
        },
      },
    });

    if (!learningPlan) {
      return NextResponse.json({ error: "Aucun plan d'apprentissage trouvé" }, { status: 404 });
    }

    let blockedByPreviousRefusal = false;
    const modules = learningPlan.modules.map((module) => {
      const hasRefusedVideo = module.exercises.some((exercise) =>
        exercise.videoSubmissions.some((video) => ['REJECTED', 'REVISION_NEEDED'].includes(video.status))
      );

      const locked = blockedByPreviousRefusal;
      if (hasRefusedVideo) {
        blockedByPreviousRefusal = true;
      }

      return {
        ...module,
        locked,
        blockedReason: locked
          ? 'Un exercice vidéo précédent a été refusé. Corrigez-le avant de continuer.'
          : null,
      };
    });

    const currentIndex = modules.findIndex((m) => !m.locked && m.exercises.some((e) => !e.completed));
    const focusIndex = currentIndex >= 0 ? Math.min(currentIndex, learningPlan.weeklyFocus.length - 1) : 0;

    return NextResponse.json({
      weeklyFocus: learningPlan.weeklyFocus[focusIndex] || 'English Foundations',
      modules,
      totalModules: modules.length,
    });
  } catch (error) {
    console.error('Learning modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

