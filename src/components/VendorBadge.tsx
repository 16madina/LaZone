import { Award, Shield, Star, Crown, Gem } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface VendorBadgeProps {
  level: BadgeLevel;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const badgeConfig = {
  none: null,
  bronze: {
    name: 'Bronze',
    description: 'Vendeur débutant',
    icon: Award,
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
    borderColor: 'border-orange-300',
  },
  silver: {
    name: 'Argent',
    description: 'Vendeur confirmé',
    icon: Shield,
    color: 'text-slate-600',
    bgColor: 'bg-gradient-to-br from-slate-100 to-slate-200',
    borderColor: 'border-slate-300',
  },
  gold: {
    name: 'Or',
    description: 'Vendeur expérimenté',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    borderColor: 'border-yellow-400',
  },
  platinum: {
    name: 'Platine',
    description: 'Vendeur expert',
    icon: Crown,
    color: 'text-cyan-600',
    bgColor: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
    borderColor: 'border-cyan-400',
  },
  diamond: {
    name: 'Diamant',
    description: 'Vendeur élite',
    icon: Gem,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
    borderColor: 'border-purple-400',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-5 h-5',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'w-7 h-7',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'w-10 h-10',
    icon: 'w-6 h-6',
  },
};

export const VendorBadge = ({ 
  level, 
  size = 'md', 
  showTooltip = true,
  className = '' 
}: VendorBadgeProps) => {
  const config = badgeConfig[level];
  
  if (!config) return null;

  const Icon = config.icon;
  const sizes = sizeConfig[size];

  const badge = (
    <div 
      className={`${sizes.container} rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center ${className}`}
    >
      <Icon className={`${sizes.icon} ${config.color}`} />
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">Badge {config.name}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const getBadgeName = (level: BadgeLevel): string => {
  const config = badgeConfig[level];
  return config?.name || '';
};

export type { BadgeLevel };
