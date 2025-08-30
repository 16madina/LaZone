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
    <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border rounded-xl p-6 mb-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="w-full text-center">
          <img 
            src="/lovable-uploads/60a1c819-ca10-453c-9506-9107d58ed82e.png" 
            alt="LaZone" 
            className="h-16 mx-auto mb-2" 
          />
          <p className="text-lg text-muted-foreground font-poppins">Trouvez votre chez-vous dans votre Zone</p>
          <p className="text-sm text-muted-foreground mt-1">Découvrez des milliers de biens immobiliers à travers l'Afrique</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/stats')}
          className="shrink-0 absolute top-4 right-4"
        >
          Voir détails
        </Button>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 flex-shrink-0 min-w-[80px] hover:shadow-md transition-all duration-200">
          <CardContent className="p-3 text-center">
            <Globe className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-800">12</div>
            <p className="text-xs text-blue-600">Pays</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex-shrink-0 min-w-[80px] hover:shadow-md transition-all duration-200">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-800">70</div>
            <p className="text-xs text-green-600">Nouveau</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 flex-shrink-0 min-w-[80px] hover:shadow-md transition-all duration-200">
          <CardContent className="p-3 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-orange-800">53</div>
            <p className="text-xs text-orange-600">Premium</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 flex-shrink-0 min-w-[80px] hover:shadow-md transition-all duration-200">
          <CardContent className="p-3 text-center">
            <Award className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-800">198</div>
            <p className="text-xs text-purple-600">Certifiés</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
          150 locations
        </Badge>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
          155 ventes
        </Badge>
        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors">
          89 apparts
        </Badge>
        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
          98 maisons
        </Badge>
      </div>
    </div>
  );
};

export default WelcomeStats;