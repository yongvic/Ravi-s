import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const [recentVideos, recentBadges, revisionNeeded] = await Promise.all([
      prisma.video.findMany({
        where: { userId: session.user.id },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: { id: true, status: true, submittedAt: true },
      }),
      prisma.badge.findMany({
        where: { userId: session.user.id },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
        select: { badgeType: true, unlockedAt: true },
      }),
      prisma.video.count({
        where: { userId: session.user.id, status: { in: ['REJECTED', 'REVISION_NEEDED'] } },
      }),
    ]);

    const notifications = [
      ...recentBadges.map((b) => ({
        id: `badge-${b.badgeType}-${b.unlockedAt.toISOString()}`,
        type: 'success',
        title: 'Nouveau badge débloqué',
        message: b.badgeType,
        date: b.unlockedAt,
      })),
      ...recentVideos.map((v) => ({
        id: `video-${v.id}`,
        type: v.status === 'APPROVED' ? 'success' : v.status === 'PENDING' ? 'info' : 'warning',
        title: 'Mise à jour soumission vidéo',
        message: `Statut: ${v.status}`,
        date: v.submittedAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);

    return Response.json({
      items: notifications,
      hasBlockingReview: revisionNeeded > 0,
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

