import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seedDataStats, propertiesByCountry } from '@/data/comprehensiveSeedData';
import { Globe, Building2, Home, Map } from 'lucide-react';

const PropertyStats: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{seedDataStats.totalProperties}</div>
            <p className="text-sm text-muted-foreground">Annonces totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{Object.keys(propertiesByCountry).length}</div>
            <p className="text-sm text-muted-foreground">Pays couverts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Map className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{seedDataStats.verified}</div>
            <p className="text-sm text-muted-foreground">Agents vérifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{seedDataStats.new}</div>
            <p className="text-sm text-muted-foreground">Nouvelles annonces</p>
          </CardContent>
        </Card>
      </div>

      {/* By Purpose */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Location</Badge>
              <span className="text-2xl font-semibold">{seedDataStats.byPurpose.rent}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Vente</Badge>
              <span className="text-2xl font-semibold">{seedDataStats.byPurpose.sale}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{seedDataStats.byType.apartment}</div>
              <p className="text-sm text-muted-foreground">Appartements</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{seedDataStats.byType.house}</div>
              <p className="text-sm text-muted-foreground">Maisons</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{seedDataStats.byType.land}</div>
              <p className="text-sm text-muted-foreground">Terrains</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Country */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par pays</CardTitle>
          <CardDescription>
            Annonces disponibles dans {Object.keys(propertiesByCountry).length} pays africains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(seedDataStats.byCountry)
              .sort(([,a], [,b]) => b - a) // Sort by count descending
              .map(([country, count]) => (
                <div key={country} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{country}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyStats;