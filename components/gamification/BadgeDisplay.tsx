'use client';

import { Lock, Target, Star, Plane, Shield, Crown, BookOpen, Ear, CircleDotDashed } from 'lucide-react';

const badgeDefinitions: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; description: string; condition: string }> = {
  FIRST_EXERCISE: { icon: Target, title: 'Premier pas', description: 'Terminer votre premier exercice', condition: '1 exercice complété' },
  PRONUNCIATION_STAR: { icon: Star, title: 'Star prononciation', description: 'Maîtriser la prononciation sur 5 exercices', condition: '5 exercices accent (300 points)' },
  CABIN_MASTER: { icon: Plane, title: 'Cabin Master', description: 'Terminer 10 scénarios de service cabine', condition: '10 exercices passager' },
  SAFETY_GURU: { icon: Shield, title: 'Safety Guru', description: 'Pratiquer les procédures de sécurité', condition: '5 exercices urgence' },
  CONSISTENCY_KING: { icon: Crown, title: 'Régularité', description: 'Pratiquer 20 jours de suite', condition: '20 jours consécutifs' },
  GRAMMAR_CHAMPION: { icon: BookOpen, title: 'Grammar Champion', description: 'Renforcer la grammaire via role-play', condition: '3 exercices role-play' },
  LISTENING_LEGEND: { icon: Ear, title: 'Listening Legend', description: 'Améliorer la compréhension orale', condition: '3 exercices listening' },
  WHEEL_WINNER: { icon: CircleDotDashed, title: 'Wheel Winner', description: 'Réussir des défis Wheel of English', condition: '5 exercices wheel' },
};

interface BadgeDisplayProps {
  badgeType: string;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeDisplay({ badgeType, unlocked, size = 'md' }: BadgeDisplayProps) {
  const badge = badgeDefinitions[badgeType];
  if (!badge) return null;
  const Icon = badge.icon;

  const sizeClasses = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' };
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold transition-all ${
          unlocked ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-700 dark:text-yellow-400' : 'bg-gray-500/10 border-2 border-gray-500/30 text-gray-500 opacity-50'
        }`}
      >
        {unlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
      </div>
      <p className={`font-semibold mt-2 ${textSize[size]}`}>{badge.title}</p>
      <p className={`text-muted-foreground ${textSize[size]} max-w-xs`}>{badge.description}</p>
    </div>
  );
}

interface BadgeGridProps {
  badges: string[];
  unlockedBadges: string[];
}

export function BadgeGrid({ badges, unlockedBadges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {badges.map((badgeType) => (
        <div key={badgeType} className="flex justify-center">
          <BadgeDisplay badgeType={badgeType} unlocked={unlockedBadges.includes(badgeType)} size="md" />
        </div>
      ))}
    </div>
  );
}
