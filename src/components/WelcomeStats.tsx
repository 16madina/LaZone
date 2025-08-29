import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { seedDataStats } from '@/data/comprehensiveSeedData';
import { useNavigate } from 'react-router-dom';
import { Globe, TrendingUp, MapPin, Award } from 'lucide-react';

const WelcomeStats: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bienvenue sur LaZone</h2>
          <p className="text-sm text-muted-foreground">Découvrez {seedDataStats.totalProperties} biens immobiliers à travers l'Afrique</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/stats')}
          className="shrink-0"
        >
          Voir détails
        </Button>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-2">
        <Card className="bg-background/50 border-border/50 flex-shrink-0 min-w-[80px]">
          <CardContent className="p-3 text-center">
            <Globe className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{Object.keys(seedDataStats.byCountry).length}</div>
            <p className="text-xs text-muted-foreground">Pays</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/50 flex-shrink-0 min-w-[80px]">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{seedDataStats.new}</div>
            <p className="text-xs text-muted-foreground">Nouveau</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/50 flex-shrink-0 min-w-[80px]">
          <CardContent className="p-3 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{seedDataStats.featured}</div>
            <p className="text-xs text-muted-foreground">Premium</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/50 flex-shrink-0 min-w-[80px]">
          <CardContent className="p-3 text-center">
            <Award className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{seedDataStats.verified}</div>
            <p className="text-xs text-muted-foreground">Vérifiés</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="secondary" className="text-xs">
          {seedDataStats.byPurpose.rent} locations
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {seedDataStats.byPurpose.sale} ventes
        </Badge>
        <Badge variant="outline" className="text-xs">
          {seedDataStats.byType.apartment} apparts
        </Badge>
        <Badge variant="outline" className="text-xs">
          {seedDataStats.byType.house} maisons
        </Badge>
        <Badge variant="outline" className="text-xs">
          {seedDataStats.byType.land} terrains
        </Badge>
      </div>
    </div>
  );
};

export default WelcomeStats;