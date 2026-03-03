'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface AirportMapData {
  progressPercentage: number;
  currentTerminal: number;
  completedAreas: string[];
}

export default function AirportMapPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const [mapData, setMapData] = useState<AirportMapData | null>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchMap = async () => {
      const response = await fetch('/api/airport-map');
      if (!response.ok) return;
      const data = await response.json();
      setMapData(data);
    };

    fetchMap();
  }, []);

  const progress = mapData?.progressPercentage ?? 0;
  const terminal = mapData?.currentTerminal ?? 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Carte aéroport</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">Progression globale: {progress}%</p>
            <p className="text-sm text-muted-foreground">Terminal actuel: T{terminal}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
