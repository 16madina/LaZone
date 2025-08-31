import React from 'react';
import { MobileTestPanel } from '@/components/mobile/MobileTestPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Tests des Fonctionnalités Mobile</h1>
        </div>

        <div className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Cette page permet de tester les fonctionnalités critiques de l'application 
              sur mobile pour s'assurer qu'elle fonctionne correctement sur tous les appareils.
            </p>
          </div>

          <MobileTestPanel />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">À propos des tests</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Touch Interactions:</strong> Vérification de la taille des boutons tactiles</li>
              <li>• <strong>Viewport Configuration:</strong> Configuration mobile et zones sécurisées</li>
              <li>• <strong>Image Loading:</strong> Optimisation du chargement des images</li>
              <li>• <strong>Network Connectivity:</strong> Adaptation à la qualité de connexion</li>
              <li>• <strong>Geolocation:</strong> Fonctionnalités de géolocalisation</li>
              <li>• <strong>Performance:</strong> Temps de chargement et utilisation mémoire</li>
              <li>• <strong>PWA Features:</strong> Fonctionnalités d'application web progressive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTest;