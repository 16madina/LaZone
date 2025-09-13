import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Clock } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

export interface SponsorshipLevel {
  level: number;
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  prices: {
    7: number;
    15: number;
    30: number;
  };
  badgeColor: string;
  popular?: boolean;
}

export const SPONSORSHIP_LEVELS: SponsorshipLevel[] = [
  {
    level: 1,
    name: 'Boost',
    icon: Zap,
    description: 'Positionnez votre annonce en tête de liste',
    features: [
      'Position prioritaire dans les résultats',
      'Badge "Boost" sur votre annonce',
      'Visibilité augmentée'
    ],
    prices: { 7: 200000, 15: 350000, 30: 600000 },
    badgeColor: 'bg-blue-500'
  },
  {
    level: 2,
    name: 'Premium',
    icon: Star,
    description: 'Badge doré + position ultra-prioritaire',
    features: [
      'Badge Premium doré',
      'Position ultra-prioritaire',
      'Mise en avant dans les suggestions',
      'Support prioritaire'
    ],
    prices: { 7: 350000, 15: 600000, 30: 1000000 },
    badgeColor: 'bg-yellow-500',
    popular: true
  },
  {
    level: 3,
    name: 'VIP',
    icon: Crown,
    description: 'Le maximum de visibilité pour votre annonce',
    features: [
      'Badge VIP diamant',
      'Position ultra-prioritaire garantie',
      'Mise en avant spéciale',
      'Analytics détaillées',
      'Support VIP dédié'
    ],
    prices: { 7: 500000, 15: 850000, 30: 1500000 },
    badgeColor: 'bg-purple-500'
  }
];

interface SponsorshipLevelsProps {
  selectedLevel: number;
  selectedDuration: number;
  onLevelSelect: (level: number) => void;
  onDurationSelect: (duration: number) => void;
  onSponsor: () => void;
  loading: boolean;
}

export const SponsorshipLevels: React.FC<SponsorshipLevelsProps> = ({
  selectedLevel,
  selectedDuration,
  onLevelSelect,
  onDurationSelect,
  onSponsor,
  loading
}) => {
  const selectedLevelData = SPONSORSHIP_LEVELS.find(l => l.level === selectedLevel);

  return (
    <div className="space-y-6">
      {/* Level Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {SPONSORSHIP_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedLevel === level.level;
          
          return (
            <Card 
              key={level.level}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onLevelSelect(level.level)}
            >
              <CardHeader className="text-center relative">
                {level.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Populaire
                  </Badge>
                )}
                <div className={`w-12 h-12 rounded-full ${level.badgeColor} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{level.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {level.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                  <div className="text-xs text-muted-foreground">À partir de</div>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(level.prices[7], 'CFA')}
                  </div>
                  <div className="text-xs text-muted-foreground">pour 7 jours</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Duration Selection */}
      {selectedLevel > 0 && selectedLevelData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Choisissez la durée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[7, 15, 30].map((duration) => {
                const isSelected = selectedDuration === duration;
                const price = selectedLevelData.prices[duration as keyof typeof selectedLevelData.prices];
                const pricePerDay = Math.round(price / duration);
                
                return (
                  <Card 
                    key={duration}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => onDurationSelect(duration)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">{duration} jours</div>
                      <div className="text-xl font-bold text-primary mt-2">
                        {formatPrice(price, 'CFA')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(pricePerDay, 'CFA')}/jour
                      </div>
                      {duration === 30 && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Meilleur rapport
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {selectedLevel > 0 && selectedDuration > 0 && (
        <div className="text-center">
          <Button 
            onClick={onSponsor}
            size="lg"
            className="px-8"
            disabled={loading}
          >
            {loading ? 'Préparation...' : `Sponsoriser pour ${formatPrice(selectedLevelData!.prices[selectedDuration as keyof typeof selectedLevelData.prices], 'CFA')}`}
          </Button>
        </div>
      )}
    </div>
  );
};