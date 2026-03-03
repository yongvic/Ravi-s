import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const pendingVideos = await prisma.video.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { name: true },
        },
        exercise: {
          select: { title: true },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const formatted = pendingVideos.map(video => ({
      id: video.id,
      studentName: video.user.name,
      exerciseTitle: video.exercise.title,
      submittedAt: video.submittedAt.toISOString(),
      duration: video.duration,
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error('Pending videos error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

