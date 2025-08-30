import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Headset, 
  Eye, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3d,
  Maximize,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualTourProps {
  propertyId: string;
  images: string[];
  title: string;
  className?: string;
}

interface TourPoint {
  id: string;
  name: string;
  description: string;
  image: string;
  position: { x: number; y: number };
  connections: string[];
}

const VirtualTour: React.FC<VirtualTourProps> = ({
  propertyId,
  images,
  title,
  className
}) => {
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Simulate tour points based on available images
  const tourPoints: TourPoint[] = images.map((image, index) => ({
    id: `point-${index}`,
    name: getTourPointName(index),
    description: getTourPointDescription(index),
    image,
    position: { x: Math.random() * 100, y: Math.random() * 100 },
    connections: images.length > 1 ? [`point-${(index + 1) % images.length}`] : []
  }));

  function getTourPointName(index: number): string {
    const names = [
      'Entrée principale',
      'Salon',
      'Cuisine',
      'Chambre principale',
      'Salle de bain',
      'Balcon/Terrasse',
      'Chambre 2',
      'Bureau',
      'Garage',
      'Jardin'
    ];
    return names[index] || `Point ${index + 1}`;
  }

  function getTourPointDescription(index: number): string {
    const descriptions = [
      'Vue d\'ensemble de l\'entrée avec hall spacieux',
      'Espace de vie principal avec grande fenêtre',
      'Cuisine équipée moderne avec îlot central',
      'Chambre avec dressing et vue dégagée',
      'Salle de bain rénovée avec douche italienne',
      'Espace extérieur avec vue panoramique',
      'Chambre supplémentaire lumineuse',
      'Espace de travail calme et fonctionnel',
      'Parking couvert sécurisé',
      'Jardin paysagé avec terrasse'
    ];
    return descriptions[index] || `Description du point ${index + 1}`;
  }

  const startAutoTour = () => {
    setIsAutoTour(true);
    intervalRef.current = setInterval(() => {
      setCurrentPoint(prev => (prev + 1) % tourPoints.length);
    }, 4000);
  };

  const stopAutoTour = () => {
    setIsAutoTour(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
    if (!isVRMode) {
      // Request fullscreen for better VR experience
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentTourPoint = tourPoints[currentPoint];

  return (
    <div className={cn("", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Headset className="w-4 h-4 mr-2" />
            Visite Virtuelle 360°
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headset className="w-5 h-5" />
              Visite Virtuelle - {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
              <Button
                size="sm"
                variant={isVRMode ? "default" : "outline"}
                onClick={toggleVRMode}
              >
                <Headset className="w-4 h-4 mr-2" />
                Mode VR
              </Button>
              
              <Button
                size="sm"
                variant={isAutoTour ? "default" : "outline"}
                onClick={isAutoTour ? stopAutoTour : startAutoTour}
              >
                {isAutoTour ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Tour Auto
              </Button>

              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRotate}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                  <Move3d className="w-4 h-4" />
                </Button>
              </div>

              <Badge variant="secondary" className="ml-auto">
                Zoom: {(zoom * 100).toFixed(0)}%
              </Badge>
            </div>

            {/* Main Tour View */}
            <div className={cn(
              "relative bg-black rounded-lg overflow-hidden",
              isVRMode ? "h-[70vh]" : "h-[60vh]"
            )}>
              {currentTourPoint && (
                <div className="relative w-full h-full">
                  <img
                    src={currentTourPoint.image}
                    alt={currentTourPoint.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      filter: isVRMode ? 'brightness(1.1) contrast(1.1)' : 'none'
                    }}
                  />
                  
                  {/* Overlay Information */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Card className="p-4 bg-background/90 backdrop-blur-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{currentTourPoint.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentTourPoint.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {currentPoint + 1} / {tourPoints.length}
                        </Badge>
                      </div>
                    </Card>
                  </div>

                  {/* Navigation Hotspots */}
                  {currentTourPoint.connections.map((connectionId, index) => {
                    const connectionIndex = tourPoints.findIndex(p => p.id === connectionId);
                    if (connectionIndex === -1) return null;
                    
                    return (
                      <button
                        key={connectionId}
                        className="absolute w-12 h-12 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                        style={{
                          left: `${20 + index * 30}%`,
                          top: `${30 + index * 20}%`,
                        }}
                        onClick={() => setCurrentPoint(connectionIndex)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    );
                  })}

                  {/* VR Mode Overlay */}
                  {isVRMode && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full border-4 border-primary/50 rounded-lg">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-8 h-8 border-2 border-white rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tour Points Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {tourPoints.map((point, index) => (
                <button
                  key={point.id}
                  onClick={() => setCurrentPoint(index)}
                  className={cn(
                    "p-2 text-left rounded-lg border transition-all hover:shadow-md",
                    currentPoint === index 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card hover:bg-accent"
                  )}
                >
                  <div className="aspect-video mb-2 rounded overflow-hidden">
                    <img
                      src={point.image}
                      alt={point.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium truncate">{point.name}</p>
                </button>
              ))}
            </div>

            {/* VR Instructions */}
            {isVRMode && (
              <Card className="p-4 bg-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Headset className="w-4 h-4 text-primary" />
                  <h5 className="font-semibold text-primary">Mode VR Activé</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Utilisez les contrôles pour naviguer. Pour une expérience optimale, 
                  utilisez un casque VR compatible ou activez le mode gyroscope sur mobile.
                </p>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VirtualTour;