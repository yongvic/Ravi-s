'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboarding?: {
    englishLevel: string;
    professionGoal: string;
    airportCode?: string;
    airportName?: string;
  };
  stats: {
    exercisesCompleted: number;
    videosSubmitted: number;
    videosApproved: number;
    totalPoints: number;
  };
}

export default function AdminStudentDetailPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentDetail | null>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  useEffect(() => {
    const fetchStudent = async () => {
      const response = await fetch(`/api/admin/students/${studentId}`);
      if (!response.ok) return;
      const data = await response.json();
      setStudent(data);
    };

    fetchStudent();
  }, [studentId]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
        <div className="max-w-4xl mx-auto">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Détail élève</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Nom:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Inscription:</strong> {new Date(student.createdAt).toLocaleDateString()}</p>
            <p><strong>Niveau:</strong> {student.onboarding?.englishLevel || 'N/A'}</p>
            <p><strong>Objectif:</strong> {student.onboarding?.professionGoal || 'N/A'}</p>
            <p><strong>Aéroport:</strong> {student.onboarding?.airportName || student.onboarding?.airportCode || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Exercices validés:</strong> {student.stats.exercisesCompleted}</p>
            <p><strong>Vidéos soumises:</strong> {student.stats.videosSubmitted}</p>
            <p><strong>Vidéos approuvées:</strong> {student.stats.videosApproved}</p>
            <p><strong>Points Kiki:</strong> {student.stats.totalPoints}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
