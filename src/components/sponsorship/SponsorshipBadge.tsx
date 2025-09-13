import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap } from 'lucide-react';

interface SponsorshipBadgeProps {
  level: number;
  className?: string;
}

export const SponsorshipBadge: React.FC<SponsorshipBadgeProps> = ({
  level,
  className = ""
}) => {
  const getBadgeConfig = (level: number) => {
    switch (level) {
      case 1:
        return {
          icon: Zap,
          label: 'Boost',
          className: 'bg-blue-500 hover:bg-blue-600 text-white animate-pulse'
        };
      case 2:
        return {
          icon: Star,
          label: 'Premium',
          className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white animate-pulse'
        };
      case 3:
        return {
          icon: Crown,
          label: 'VIP',
          className: 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white animate-pulse'
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(level);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} font-semibold shadow-lg border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};