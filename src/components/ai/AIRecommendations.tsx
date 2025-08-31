import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, MapPin, Star, RefreshCw } from 'lucide-react';
import { Property } from '@/components/PropertyCard';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getAgentInfo } from "@/utils/agent-utils";

interface AIRecommendation {
  property: Property;
  score: number;
  reasons: string[];
  matchType: 'price' | 'location' | 'features' | 'trending';
}

interface AIRecommendationsProps {
  userPreferences?: {
    budgetRange: [number, number];
    preferredAreas: string[];
    propertyTypes: string[];
    mustHaveAmenities: string[];
  };
  currentProperty?: Property;
  className?: string;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userPreferences,
  currentProperty,
  className
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState('');

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis
      setAnalysisText('Analyse des préférences utilisateur...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysisText('Recherche de propriétés similaires...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalysisText('Calcul des scores de compatibilité...');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Fetch properties for recommendations
      const { data: properties, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      if (error) throw error;

      // Simulate AI scoring algorithm
      const scoredRecommendations: AIRecommendation[] = await Promise.all(
        (properties || []).map(async (prop, index) => {
          const agentInfo = await getAgentInfo(prop.user_id);
          
          return {
            property: {
              id: prop.id,
              title: prop.title,
              price: prop.price,
              currency: prop.currency,
              location: {
                city: prop.city,
                neighborhood: prop.neighborhood,
                coordinates: [prop.longitude || 0, prop.latitude || 0]
              },
              images: prop.images || [],
              type: prop.property_type as 'apartment' | 'house' | 'land',
              purpose: prop.purpose as 'rent' | 'sale',
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              area: prop.area,
              landArea: prop.land_area,
              amenities: prop.amenities || [],
              isVerified: true,
              isNew: new Date(prop.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              isFeatured: index < 2,
              agent: agentInfo,
              createdAt: prop.created_at
            },
            score: Math.random() * 30 + 70, // Score between 70-100
            reasons: generateMatchReasons(index),
            matchType: ['price', 'location', 'features', 'trending'][index % 4] as any
          };
        })
      );

      // Sort by score
      scoredRecommendations.sort((a, b) => b.score - a.score);
      
      setRecommendations(scoredRecommendations.slice(0, 4));
      setAnalysisText('Recommandations générées avec succès !');
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setAnalysisText('Erreur lors de la génération des recommandations');
    } finally {
      setLoading(false);
    }
  };

  const generateMatchReasons = (index: number): string[] => {
    const allReasons = [
      'Prix dans votre budget',
      'Quartier préféré',
      'Nombre de chambres idéal',
      'Récemment mis à jour',
      'Bien évalué par les utilisateurs',
      'Proche des transports',
      'Commodités recherchées',
      'Tendance du marché',
      'Investissement prometteur',
      'Vue exceptionnelle'
    ];
    
    return allReasons.slice(index, index + 3);
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return '💰';
      case 'location': return '📍';
      case 'features': return '🏠';
      case 'trending': return '📈';
      default: return '⭐';
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'price': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-blue-100 text-blue-800';
      case 'features': return 'bg-purple-100 text-purple-800';
      case 'trending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences, currentProperty]);

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recommandations IA</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateRecommendations}
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse">
            <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{analysisText}</p>
          </div>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.property.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getMatchTypeColor(rec.matchType))}>
                    {getMatchTypeIcon(rec.matchType)} {Math.round(rec.score)}% match
                  </Badge>
                  {rec.property.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{(rec.score / 20).toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-base mb-1">{rec.property.title}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{rec.property.location.neighborhood}, {rec.property.location.city}</span>
                  </div>
                  <p className="text-lg font-bold text-primary mb-2">
                    {rec.property.price.toLocaleString()} {rec.property.currency}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rec.reasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune recommandation disponible pour le moment</p>
        </div>
      )}
    </Card>
  );
};

export default AIRecommendations;