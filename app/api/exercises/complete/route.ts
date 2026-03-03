import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { awardPoints, checkAndUnlockBadges } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { exerciseId, points, mode, title, content } = await request.json();

    if (!exerciseId || !points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update existing exercise or create a lightweight standalone exercise entry.
    // This keeps legacy free-mode pages functional even without a pre-generated exercise row.
    const existingExercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, userId: session.user.id },
      select: { id: true, moduleId: true },
    });

    if (existingExercise) {
      await prisma.exercise.update({
        where: { id: existingExercise.id },
        data: { completed: true, completedAt: new Date() },
      });
    } else {
      let moduleId: string | null = null;
      const firstModule = await prisma.module.findFirst({
        where: { learningPlan: { userId: session.user.id } },
        orderBy: { week: 'asc' },
        select: { id: true },
      });

      if (firstModule) {
        moduleId = firstModule.id;
      } else {
        const plan = await prisma.learningPlan.create({
          data: {
            userId: session.user.id,
            weeklyFocus: ['English Foundations'],
            estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
          select: { id: true },
        });

        const module = await prisma.module.create({
          data: {
            planId: plan.id,
            week: 1,
            title: 'Week 1: Foundations',
            description: 'Auto-generated module for ad-hoc exercises',
            targetPoints: 300,
          },
          select: { id: true },
        });

        moduleId = module.id;
      }

      await prisma.exercise.create({
        data: {
          id: exerciseId,
          userId: session.user.id,
          moduleId: moduleId!,
          mode: normalizeMode(mode),
          title: title || `Exercise ${exerciseId}`,
          content: content || 'Ad-hoc exercise response',
          pointsValue: points,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    await awardPoints(session.user.id, points, 'exercise_complete');
    const badges = await checkAndUnlockBadges(session.user.id);
    await refreshAirportMap(session.user.id);

    const kikiPoints = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
      select: { totalPoints: true },
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      totalPoints: kikiPoints?.totalPoints || 0,
      newBadges: badges,
    });
  } catch (error) {
    console.error('Exercise completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete exercise' },
      { status: 500 }
    );
  }
}

function normalizeMode(mode?: string) {
  switch (mode) {
    case 'passenger':
    case 'lost-passenger':
      return 'PASSENGER' as const;
    case 'accent':
      return 'ACCENT_TRAINING' as const;
    case 'secret':
      return 'SECRET_CHALLENGE' as const;
    case 'wheel':
      return 'WHEEL_OF_ENGLISH' as const;
    case 'cabin-simulation':
      return 'CABIN_SIMULATION' as const;
    case 'company-interview':
      return 'INTERVIEW_COMPANY' as const;
    case 'love-english':
      return 'LOVE_AND_ENGLISH' as const;
    case 'reading':
      return 'READING' as const;
    case 'quiz':
      return 'QUIZ' as const;
    case 'vocabulary':
      return 'VOCABULARY' as const;
    case 'speaking':
      return 'SPEAKING' as const;
    case 'emergency':
      return 'EMERGENCY' as const;
    case 'listening':
      return 'LISTENING' as const;
    case 'role_play':
      return 'ROLE_PLAY' as const;
    default:
      return 'CUSTOM' as const;
  }
}

async function refreshAirportMap(userId: string) {
  const [completedExercises, totalExercises] = await Promise.all([
    prisma.exercise.count({ where: { userId, completed: true } }),
    prisma.exercise.count({ where: { userId } }),
  ]);

  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const currentTerminal = Math.min(5, Math.max(1, Math.ceil(progressPercentage / 20)));

  await prisma.airportMap.upsert({
    where: { userId },
    create: {
      userId,
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
}

