import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

const ALLOWED_VIDEO_TYPES = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const exerciseId = formData.get('exerciseId') as string;

    if (!file || !exerciseId) {
      return Response.json(
        { message: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return Response.json(
        {
          message: `Format vidéo non supporté. Formats autorisés: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return Response.json(
        {
          message: `Taille du fichier ${sizeMB}MB supérieure à 100MB`,
        },
        { status: 400 }
      );
    }

    // Validate file size minimum (at least 1KB)
    if (file.size < 1024) {
      return Response.json(
        { message: 'Le fichier est trop petit' },
        { status: 400 }
      );
    }

    // Check if exercise exists and belongs to user
    const exercise = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
    });

    if (!exercise) {
      return Response.json(
        { message: 'Exercice introuvable' },
        { status: 404 }
      );
    }

    // Check for duplicate submissions
    const existingVideo = await prisma.video.findFirst({
      where: {
        exerciseId,
        userId: session.user.id,
        status: { in: ['APPROVED', 'REVISION_NEEDED'] },
      },
    });

    if (existingVideo) {
      return Response.json(
        {
          message: 'Vous avez déjà une soumission pour cet exercice',
        },
        { status: 409 }
      );
    }

    // Upload to Vercel Blob with unique naming
    const timestamp = Date.now();
    const blobPath = `videos/${session.user.id}/${exerciseId}-${timestamp}.${file.type.split('/')[1] || 'webm'}`;

    let blob;
    try {
      blob = await put(blobPath, file, {
        access: 'private',
        contentType: file.type,
      });
    } catch (uploadError) {
      console.error('Blob upload error:', uploadError);
      return Response.json(
        { message: "Échec de l'envoi de la vidéo vers le stockage" },
        { status: 500 }
      );
    }

    // Create video record in database with pending status
    const video = await prisma.video.create({
      data: {
        userId: session.user.id,
        exerciseId,
        blobUrl: blob.url,
        duration: 0, // Will be extracted by admin during review
        status: 'PENDING',
      },
    });

    console.log(`[Video Upload] User ${session.user.id} uploaded video ${video.id} for exercise ${exerciseId}`);

    return Response.json(
      {
        message: 'Vidéo envoyée avec succès',
        videoId: video.id,
        url: blob.url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Video upload error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

