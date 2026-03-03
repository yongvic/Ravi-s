import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePlanPDF, createPlanHTML } from '@/lib/pdf-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(_req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.name) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Get onboarding data
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

    // Get learning plan with modules
    const plan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
        },
      },
    });

    if (!plan) {
      return Response.json(
        { message: "Aucun plan d'apprentissage trouvé" },
        { status: 404 }
      );
    }

    // Transform modules for PDF
    const weeks = plan.modules.map(module => ({
      week: module.week,
      title: module.title,
      focus: [
        'Apprendre le vocabulaire et les phrases clés',
        'Travailler la prononciation',
        'Réaliser les exercices interactifs',
        'Gagner des points Kiki',
      ],
      targetPoints: module.targetPoints,
    }));

    // Generate HTML
    const htmlContent = createPlanHTML({
      name: session.user.name,
      level: onboarding?.englishLevel || 'Non défini',
      airport: onboarding?.airportName || onboarding?.airportCode || 'Non défini',
      professionGoal: onboarding?.professionGoal || 'Objectif professionnel à définir',
      dailyMinutes: onboarding?.dailyMinutes || 30,
      weeklyGoal: onboarding?.weeklyGoal || 5,
      weeks,
    });

    // Generate PDF
    const pdf = await generatePlanPDF(htmlContent);

    // Return PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="learning-plan.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

