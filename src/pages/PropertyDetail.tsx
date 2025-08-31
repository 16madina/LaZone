import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Heart, Share2, Phone, MessageCircle, Calendar,
  MapPin, Bed, Bath, Maximize, Car, Shield, Wifi, 
  Snowflake, Building, TreePine, Eye, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import VirtualTour from "@/components/vr/VirtualTour";
import AIRecommendations from "@/components/ai/AIRecommendations";
import ImageGallery from "@/components/ImageGallery";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/currency";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      // First try to fetch from Supabase (for real listings with UUIDs)
      if (id && id.length > 10) { // UUID-like format
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          // Convert Supabase data to Property format
          const convertedProperty: Property = {
            id: data.id,
            title: data.title,
            price: data.price,
            currency: data.currency,
            location: {
              city: data.city,
              neighborhood: data.neighborhood,
              coordinates: [data.longitude || 0, data.latitude || 0] as [number, number]
            },
            images: data.images && data.images.length > 0 ? data.images : ['/placeholder.svg'],
            videoUrl: data.video_url,
            type: data.property_type as 'apartment' | 'house' | 'land' | 'commercial',
            purpose: data.purpose as 'rent' | 'sale' | 'commercial',
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            area: data.area,
            landArea: data.land_area,
            amenities: data.amenities || [],
            isVerified: false,
            isNew: isNewListing(data.created_at),
            isFeatured: false,
            agent: {
              name: 'Agent LaZone',
              avatar: '/placeholder.svg',
              isVerified: false
            },
            createdAt: data.created_at
          };

          setProperty(convertedProperty);
          return;
        }
      }

      // Fallback to mock data (for demo purposes)
      const { extendedMockProperties } = await import('@/data/extendedMockProperties');
      const mockProperty = extendedMockProperties.find(p => p.id === id);
      
      if (mockProperty) {
        setProperty(mockProperty);
        return;
      }

      // Property not found in either source
      setProperty(null);
      
    } catch (error) {
      console.error('Error fetching property:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const isNewListing = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Propriété non trouvée</h1>
          <p className="text-muted-foreground mb-4">Cette annonce n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'land': return 'Terrain';
      case 'commercial': return 'Espace Commercial';
      default: return type;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'parking': return Car;
      case 'sécurité 24/7': return Shield;
      case 'fibre': return Wifi;
      case 'climatisation': return Snowflake;
      case 'ascenseur': return Building;
      case 'jardin': return TreePine;
      default: return Eye;
    }
  };

  // Get similar properties from the same data source
  const getSimilarProperties = async (): Promise<Property[]> => {
    if (!property) return [];
    
    const { extendedMockProperties } = await import('@/data/extendedMockProperties');
    return extendedMockProperties
      .filter(p => 
        p.id !== property.id && 
        p.location.city === property.location.city &&
        p.type === property.type
      )
      .slice(0, 3);
  };

  const SimilarProperties = ({ currentProperty }: { currentProperty: Property }) => {
    const [similarProps, setSimilarProps] = useState<Property[]>([]);

    useEffect(() => {
      getSimilarProperties().then(setSimilarProps);
    }, [currentProperty]);

    if (similarProps.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarProps.map((similar) => (
          <Card 
            key={similar.id} 
            className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow duration-normal"
            onClick={() => navigate(`/property/${similar.id}`)}
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={similar.images[0]}
                alt={similar.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 space-y-2">
              <div className="font-semibold text-primary">
                {formatPrice(similar.price, similar.currency)}
                {(similar.purpose === 'rent' || similar.purpose === 'commercial') && (
                  <span className="text-xs font-normal text-muted-foreground">/mois</span>
                )}
              </div>
              <h3 className="text-sm font-medium line-clamp-2">{similar.title}</h3>
              <div className="text-xs text-muted-foreground">
                {similar.location.neighborhood}, {similar.location.city}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorited(!isFavorited)}
                className={cn(isFavorited && "text-destructive")}
              >
                <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <ImageGallery 
                images={property.images}
                initialIndex={currentImageIndex}
                title={property.title}
                onImageChange={setCurrentImageIndex}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                {property.isNew && (
                  <Badge className="bg-success text-success-foreground">
                    Nouveau
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge className="bg-warning text-warning-foreground">
                    Exclusivité
                  </Badge>
                )}
                {property.isVerified && (
                  <Badge variant="secondary" className="bg-background/80 text-foreground">
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location.neighborhood}, {property.location.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(property.price, property.currency)}
                  {(property.purpose === 'rent' || property.purpose === 'commercial') && (
                    <span className="text-lg font-normal text-muted-foreground">/mois</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {getTypeLabel(property.type)}
                </div>
                </div>
              </div>

              {/* Property Details */}
              {property.type !== 'land' && (
                <div className="flex items-center gap-6">
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="text-muted-foreground text-sm">chambres</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="text-muted-foreground text-sm">
                        {property.type === 'commercial' ? 'SdB' : 'sdb'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{property.area}</span>
                    <span className="text-muted-foreground text-sm">m²</span>
                  </div>
                </div>
              )}

              {property.type === 'land' && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{property.area}</span>
                  <span className="text-muted-foreground text-sm">m² de terrain</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Video Section */}
            {property.videoUrl && (
              <>
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Vidéo</h2>
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                      poster={property.images[0]}
                    >
                      <source src={property.videoUrl} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.type === 'apartment' && 
                  `Magnifique ${getTypeLabel(property.type).toLowerCase()} situé dans le quartier recherché de ${property.location.neighborhood}. Cet appartement moderne dispose de ${property.bedrooms} chambres spacieuses et ${property.bathrooms} salles de bain. D'une surface de ${property.area}m², il offre un cadre de vie exceptionnel avec des finitions de qualité.`
                }
                {property.type === 'house' && 
                  `Superbe ${getTypeLabel(property.type).toLowerCase()} individuelle de ${property.bedrooms} chambres située à ${property.location.neighborhood}. Cette propriété de ${property.area}m² habitables sur un terrain de ${property.landArea}m² offre un cadre de vie privilégié dans un environnement calme et sécurisé.`
                }
                {property.type === 'land' && 
                  `Terrain à bâtir de ${property.area}m² parfaitement situé à ${property.location.neighborhood}. Idéal pour votre projet de construction, ce terrain bénéficie d'un excellent emplacement avec tous les raccordements nécessaires à proximité.`
                }
                {property.type === 'commercial' && 
                  `${getTypeLabel(property.type)} de ${property.area}m² parfaitement situé dans le quartier dynamique de ${property.location.neighborhood}. Cet espace offre une excellente visibilité et un emplacement stratégique pour votre activité commerciale. Idéal pour boutique, bureau, restaurant ou tout autre projet commercial.`
                }
              </p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Commodités</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Map */}
            <Separator />
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Localisation</h2>
              <div className="h-64 rounded-xl overflow-hidden">
                <PropertyMap
                  properties={[property]}
                  onPropertySelect={() => {}}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {property.location.neighborhood}, {property.location.city}
              </p>
            </div>

            {/* Similar Properties */}
            <Separator />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Biens similaires</h2>
              <SimilarProperties currentProperty={property} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card className="p-6 bg-gradient-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{property.agent.name}</h3>
                      {property.agent.isVerified && (
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Agent immobilier
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open('tel:+2250787123456', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      const message = `Bonjour, je suis intéressé(e) par la propriété "${property.title}" à ${property.location.neighborhood}. Pourrions-nous planifier une visite ? Merci.`;
                      window.open(`https://wa.me/2250787123456?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Planifier une visite
                  </Button>
                {/* Virtual Tour */}
                <VirtualTour
                  propertyId={property.id}
                  images={property.images}
                  title={property.title}
                />
              </div>
              </div>
            </Card>

            {/* Property Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Résumé</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{getTypeLabel(property.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objectif</span>
                  <span className="font-medium">
                    {property.purpose === 'rent' ? 'Location' : property.purpose === 'commercial' ? 'Location commerciale' : 'Vente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surface</span>
                  <span className="font-medium">{property.area} m²</span>
                </div>
                {property.bedrooms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chambres</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salles de bain</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                )}
                {property.landArea && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terrain</span>
                    <span className="font-medium">{property.landArea} m²</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publié</span>
                  <span className="font-medium">
                    {new Date(property.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-8">
          <AIRecommendations
            userPreferences={{
              budgetRange: [property.price * 0.8, property.price * 1.2],
              preferredAreas: [property.location.neighborhood],
              propertyTypes: [property.type],
              mustHaveAmenities: property.amenities.slice(0, 3)
            }}
            currentProperty={property}
          />
        </div>
      </div>
    </div>
  );
}