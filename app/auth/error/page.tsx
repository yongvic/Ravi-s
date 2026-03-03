'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Erreur d&apos;authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Une erreur est survenue pendant la connexion. Veuillez réessayer.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

