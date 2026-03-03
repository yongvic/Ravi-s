'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoUploadSection } from '@/components/learning/VideoUploadSection';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  mode: string;
  title: string;
  description: string;
  content: string;
  pointsValue: number;
  completed: boolean;
}

const exerciseModeGuides: Record<string, { title: string; instructions: string[] }> = {
  PASSENGER: {
    title: 'Passenger Service',
    instructions: [
      'Read the passenger request in English.',
      'Record your response in English with a professional tone.',
      'Use cabin-service vocabulary.',
      'Keep your message clear and structured.',
    ],
  },
  ACCENT_TRAINING: {
    title: 'Accent Training',
    instructions: [
      'Listen to the model phrase.',
      'Record yourself repeating it clearly.',
      'Focus on stress and rhythm.',
      'Aim for intelligibility, not imitation.',
    ],
  },
  SECRET_CHALLENGE: {
    title: 'Secret Challenge',
    instructions: [
      'Read the random scenario in English.',
      'Respond naturally with confidence.',
      'Stay polite and solution-oriented.',
      'Use professional expressions.',
    ],
  },
  WHEEL_OF_ENGLISH: {
    title: 'Wheel of English',
    instructions: [
      'A random topic is selected.',
      'Speak for 60-120 seconds in English.',
      'Use aviation context when possible.',
      'Organize your response in short points.',
    ],
  },
  ROLE_PLAY: {
    title: 'Role Play',
    instructions: [
      'Follow the dialogue scenario in English.',
      'Play your role with realistic phrasing.',
      'Handle objections politely.',
      'Close the interaction professionally.',
    ],
  },
  LISTENING: {
    title: 'Listening',
    instructions: [
      'Listen attentively to the prompt.',
      'Extract key details.',
      'Answer in concise English.',
      'Re-check your response before submit.',
    ],
  },
  EMERGENCY: {
    title: 'Emergency Mode',
    instructions: [
      'Use exact safety wording.',
      'Speak slowly and clearly.',
      'Maintain authoritative tone.',
      'Avoid slang and ambiguity.',
    ],
  },
  CUSTOM: {
    title: 'Custom Exercise',
    instructions: [
      'Read the prompt carefully.',
      'Record a structured response in English.',
      'Keep answer relevant to scenario.',
      'Use professional vocabulary.',
    ],
  },
};

export default function ExercisePage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error('Échec de récupération de l\'exercice');
        }
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        toast.error('Impossible de charger cet exercice');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Chargement de l&apos;exercice...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Exercice introuvable</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const modeGuide = exerciseModeGuides[exercise.mode] || exerciseModeGuides.CUSTOM;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            Retour
          </Button>
          <h1 className="text-4xl font-bold mb-2">{exercise.title}</h1>
          <p className="text-lg text-muted-foreground">{exercise.mode.replace(/_/g, ' ')}</p>
        </div>

        <Tabs defaultValue="instructions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Consignes</TabsTrigger>
            <TabsTrigger value="scenario">Scénario</TabsTrigger>
            <TabsTrigger value="record">Enregistrer</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{modeGuide.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {modeGuide.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-muted-foreground pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-6">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Conseil: répondez de manière claire, polie et structurée en anglais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scénario (EN)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{exercise.content}</p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Rappelez-vous: l&apos;objectif est la qualité de communication professionnelle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="record" className="space-y-4">
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">Enregistrer votre réponse</p>
              <p className="text-muted-foreground">{exercise.pointsValue} points Kiki pour cette validation</p>
            </div>
            <VideoUploadSection exerciseId={exerciseId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
