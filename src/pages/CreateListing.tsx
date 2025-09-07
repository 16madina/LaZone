import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, ArrowRight, Home, Building2, MapPin, 
  Upload, X, Camera, DollarSign, Bed, Bath, 
  Maximize, TreePine, Car, Shield, User, Users,
  Video, Rotate3D, Play, Pause, Volume2, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Autocomplete } from "@/components/ui/autocomplete";
import { searchCities, searchNeighborhoods, searchAllCities } from "@/data/africanCities";
import { getCityCoordinates } from "@/utils/geocoding";

interface ListingData {
  purpose: 'rent' | 'sale';
  propertyType: 'apartment' | 'house' | 'land' | 'commercial' | '';
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  landArea?: string;
  address: string;
  city: string;
  neighborhood: string;
  amenities: string[];
  images: File[];
  video?: File;
  virtualTour?: File;
  // Champs spécifiques aux espaces commerciaux
  commercialType?: string;
  yearBuilt?: string;
  floor?: string;
  parkingSpaces?: string;
  // Champs pour les prix
  isNegotiable: boolean;
  securityDeposit?: string; // en nombre de mois
  advancePayment?: string; // en nombre de mois
  // Champs spécifiques aux terrains
  landDocuments?: string[];
  additionalInfo?: string;
}

const AMENITIES = [
  'Piscine', 'Parking', 'Meublé', 'Sécurité 24/7', 
  'Fibre', 'Climatisation', 'Ascenseur', 'Balcon',
  'Jardin', 'Vue mer', 'Neuf', 'Générateur'
];

const COMMERCIAL_AMENITIES = [
  'Vitrine', 'Espace de stockage', 'Accès PMR', 'Climatisation commerciale',
  'Système d\'alarme', 'Sonorisation', 'Internet haut débit', 'Cuisine équipée',
  'Licence d\'exploitation', 'Parking clientèle', 'Zone de réception', 'Bureaux intégrés',
  'Toilettes publiques', 'Éclairage LED', 'Système de ventilation', 'Vestiaires',
  'Quai de chargement', 'Monte-charge', 'Espace extérieur', 'Terrasse commerciale'
];

const STEPS = [
  { id: 0, title: 'Type de poster', icon: User },
  { id: 1, title: 'Type & Purpose', icon: Home },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Détails', icon: Building2 },
  { id: 4, title: 'Prix', icon: DollarSign },
  { id: 5, title: 'Médias', icon: Camera },
  { id: 6, title: 'Aperçu', icon: Upload }
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedCountry, selectedCity, currency } = useLocation();
  const { profile } = useAuth();
  const { subscription, checkCanCreateListing } = useSubscription();
  const { toast } = useToast();
  
  // Déterminer l'étape de départ selon le type d'utilisateur
  const initialStep = profile?.user_type === 'agence' ? 1 : 0;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [posterType, setPosterType] = useState<'particulier' | 'demarcheur'>('particulier');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ListingData>({
    purpose: 'rent',
    propertyType: '',
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    landArea: '',
    address: '',
    city: selectedCity || '',
    neighborhood: '',
    amenities: [],
    images: [],
    video: undefined,
    virtualTour: undefined,
    commercialType: '',
    yearBuilt: '',
    floor: '',
    parkingSpaces: '',
    isNegotiable: false,
    securityDeposit: '',
    advancePayment: '',
    landDocuments: [],
    additionalInfo: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = (updates: Partial<ListingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 0:
        // Pas de validation nécessaire pour le choix du type de poster
        break;
      case 1:
        if (!formData.propertyType) newErrors.propertyType = 'Sélectionnez un type de bien';
        break;
      case 2:
        if (!formData.address) newErrors.address = 'L\'adresse est requise';
        if (!formData.city) newErrors.city = 'La ville est requise';
        if (!formData.neighborhood) newErrors.neighborhood = 'Le quartier est requis';
        break;
      case 3:
        if (!formData.title) newErrors.title = 'Le titre est requis';
        // La surface n'est requise que pour les terrains
        if (formData.propertyType === 'land' && (!formData.area || parseFloat(formData.area) <= 0 || isNaN(parseFloat(formData.area)))) {
          newErrors.area = 'La surface est requise et doit être un nombre valide';
        }
        if (formData.propertyType !== 'land' && formData.propertyType !== 'commercial') {
          if (!formData.bedrooms) newErrors.bedrooms = 'Nombre de chambres requis';
          if (!formData.bathrooms) newErrors.bathrooms = 'Nombre de salles de bain requis';
        }
        break;
      case 4:
        if (!formData.price) newErrors.price = 'Le prix est requis';
        break;
      case 5:
        if (formData.images.length === 0) newErrors.images = 'Au moins une photo est requise';
        if (formData.images.length > 20) newErrors.images = 'Maximum 20 photos autorisées';
        if (formData.video && formData.video.size > 100 * 1024 * 1024) newErrors.video = 'La vidéo ne doit pas dépasser 100 MB';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    console.log('NextStep clicked, current step:', currentStep);
    console.log('Current form data:', formData);
    
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to next step');
      const maxStep = profile?.user_type === 'agence' ? 6 : 7; // Ajuster selon le type d'utilisateur
      setCurrentStep(prev => Math.min(prev + 1, maxStep));
    } else {
      console.log('Validation failed, staying on current step');
      // Afficher une notification pour indiquer les erreurs
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir tous les champs obligatoires pour continuer.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    console.log('PrevStep clicked, current step:', currentStep);
    const minStep = profile?.user_type === 'agence' ? 1 : 0; // Ajuster selon le type d'utilisateur
    setCurrentStep(prev => Math.max(prev - 1, minStep));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = formData.images.length + files.length;
    
    if (totalImages > 20) {
      toast({
        title: 'Limite dépassée',
        description: 'Vous ne pouvez ajouter que 20 photos maximum.',
        variant: 'destructive',
      });
      return;
    }
    
    updateFormData({ images: [...formData.images, ...files] });
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (100 MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La vidéo ne doit pas dépasser 100 MB.',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier la durée (1 minute max)
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (video.duration > 60) {
        toast({
          title: 'Vidéo trop longue',
          description: 'La vidéo ne doit pas dépasser 1 minute.',
          variant: 'destructive',
        });
        return;
      }
      updateFormData({ video: file });
    };
    video.src = URL.createObjectURL(file);
  };

  const handleVirtualTourUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (50 MB max pour vue 360°)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La vue 360° ne doit pas dépasser 50 MB.',
        variant: 'destructive',
      });
      return;
    }

    updateFormData({ virtualTour: file });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    updateFormData({ amenities: newAmenities });
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return t('property.apartment');
      case 'house': return t('property.house');
      case 'land': return t('property.land');
      case 'commercial': return 'Espace Commercial';
      default: return type;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    console.log('Submitting listing:', formData);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour publier une annonce.',
          variant: 'destructive',
        });
        navigate('/auth?next=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // Check if user can create listing
      const canCreate = await checkCanCreateListing();
      if (!canCreate) {
        toast({
          title: 'Limite atteinte',
          description: 'Vous avez atteint votre limite d\'annonces gratuites. Souscrivez à un abonnement pour continuer.',
          variant: 'destructive',
        });
        navigate('/subscription');
        return;
      }

      // Upload images to Supabase Storage
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;
      let virtualTourUrl: string | null = null;
      
      if (formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue; // Skip this image but continue with others
          }
          
          // Get public URL
          const { data } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          
          imageUrls.push(data.publicUrl);
        }
      }
      
      // Upload video if present
      if (formData.video) {
        const fileExt = formData.video.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_video.${fileExt}`;
        
        const { error: videoUploadError } = await supabase.storage
          .from('listing-videos')
          .upload(fileName, formData.video);
        
        if (!videoUploadError) {
          const { data } = supabase.storage
            .from('listing-videos')
            .getPublicUrl(fileName);
          videoUrl = data.publicUrl;
        }
      }

      // Upload virtual tour if present
      if (formData.virtualTour) {
        const fileExt = formData.virtualTour.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_tour.${fileExt}`;
        
        const { error: tourUploadError } = await supabase.storage
          .from('virtual-tours')
          .upload(fileName, formData.virtualTour);
        
        if (!tourUploadError) {
          const { data } = supabase.storage
            .from('virtual-tours')
            .getPublicUrl(fileName);
          virtualTourUrl = data.publicUrl;
        }
      }
      
      // If no images were uploaded successfully, use placeholder
      if (imageUrls.length === 0) {
        imageUrls = ['/placeholder.svg'];
      }

      // Géocodage automatique pour obtenir les coordonnées GPS
      console.log('🌍 Géocodage automatique pour:', formData.city);
      
      // Extraire le nom de la ville et du pays du format "Ville, Pays"
      let cityName = formData.city;
      let countryName = selectedCountry;
      
      if (formData.city.includes(', ')) {
        const parts = formData.city.split(', ');
        cityName = parts[0];
        countryName = parts[1];
      }
      
      console.log('📍 Recherche coordonnées pour:', cityName, 'dans', countryName);
      const coordinates = getCityCoordinates(cityName, countryName || undefined);
      console.log('📍 Coordonnées trouvées:', coordinates);

      // Create the listing in database
      const { error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          purpose: formData.purpose,
          property_type: formData.propertyType,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: parseFloat(formData.area) || 1,
          land_area: formData.landArea ? parseFloat(formData.landArea) : null,
          address: formData.address,
          city: formData.city.includes(', ') ? formData.city.split(', ')[0] : formData.city,
          neighborhood: formData.neighborhood,
          country: formData.city.includes(', ') ? formData.city.split(', ')[1] : selectedCountry,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
          amenities: formData.amenities,
          images: imageUrls,
          video_url: videoUrl,
          virtual_tour_url: virtualTourUrl,
          land_documents: formData.landDocuments || null,
          additional_info: formData.additionalInfo || null,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "✅ Nouvelle annonce ajoutée !",
        description: "Votre annonce est maintenant visible sur LaZone.",
      });
      
      // Redirect to profile page
      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la publication.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = profile?.user_type === 'agence' 
    ? ((currentStep - 1) / 6) * 100  // 6 étapes pour les agences (1-6)
    : (currentStep / 6) * 100;       // 7 étapes pour les particuliers (0-6)

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
              {t('action.back')}
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold">Créer une annonce</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.user_type === 'agence' 
                  ? `Étape ${currentStep} sur 6`
                  : `Étape ${currentStep + 1} sur 7`
                }
              </p>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-2xl pb-32">
        {/* Step 0: Type de poster (seulement pour les particuliers) */}
        {currentStep === 0 && profile?.user_type !== 'agence' && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Comment souhaitez-vous poster cette annonce ?</h2>
              <p className="text-muted-foreground">
                Choisissez votre mode de publication
              </p>
            </div>

            <div className="space-y-4">
              <div 
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all",
                  posterType === 'particulier' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setPosterType('particulier')}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Poster comme particulier</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vous postez votre propre bien immobilier
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all",
                  posterType === 'demarcheur' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setPosterType('demarcheur')}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Poster comme démarcheur</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vous postez le bien d'un autre particulier qui n'a pas le temps
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Type & Purpose */}
        {currentStep === 1 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Quel type de bien proposez-vous ?</h2>
              <p className="text-muted-foreground">
                Choisissez le type de propriété et l'objectif
              </p>
            </div>

            {/* Purpose Selection */}
            <div className="space-y-4">
              <Label>Objectif</Label>
              <div className="grid grid-cols-2 gap-4">
                {(['rent', 'sale'] as const).map((purpose) => (
                  <Button
                    key={purpose}
                    variant={formData.purpose === purpose ? "default" : "outline"}
                    onClick={() => updateFormData({ purpose })}
                    className="h-14 text-base"
                  >
                    {purpose === 'rent' ? 'À louer' : 'À vendre'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Type Selection */}
            <div className="space-y-4">
              <Label>Type de bien</Label>
              <div className="grid grid-cols-2 gap-4">
                {(['apartment', 'house', 'land', 'commercial'] as const).map((type) => {
                  const Icon = type === 'apartment' ? Building2 : 
                              type === 'house' ? Home : 
                              type === 'land' ? MapPin : 
                              Building2; // commercial uses Building2 icon
                  return (
                    <Button
                      key={type}
                      variant={formData.propertyType === type ? "default" : "outline"}
                      onClick={() => updateFormData({ propertyType: type })}
                      className="h-24 flex-col gap-3 text-base"
                    >
                      <Icon className="w-7 h-7" />
                      <span>{getPropertyTypeLabel(type)}</span>
                    </Button>
                  );
                })}
              </div>
              {errors.propertyType && (
                <p className="text-sm text-destructive">{errors.propertyType}</p>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Où se trouve votre bien ?</h2>
              <p className="text-muted-foreground">
                Précisez la localisation de votre propriété
              </p>
            </div>

            <div className="space-y-4">
              {/* Pays automatiquement détecté */}
              {selectedCountry && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Pays (détecté automatiquement)
                  </Label>
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {selectedCountry}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Autocomplete
                    value={formData.city}
                    onValueChange={(value) => {
                      updateFormData({ 
                        city: value,
                        neighborhood: '' // Reset neighborhood when city changes
                      });
                    }}
                    options={searchAllCities('').map(city => `${city.name}, ${city.country}`)}
                    placeholder="Ex: Abidjan, Côte d'Ivoire"
                    searchPlaceholder="Rechercher une ville..."
                    emptyText="Aucune ville trouvée"
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Autocomplete
                    value={formData.neighborhood}
                    onValueChange={(value) => updateFormData({ neighborhood: value })}
                    options={formData.city 
                      ? (() => {
                          // Extraire le nom de la ville et du pays
                          const cityParts = formData.city.split(', ');
                          const cityName = cityParts[0];
                          const countryName = cityParts[1] || selectedCountry;
                          return countryName ? searchNeighborhoods(countryName, cityName, '') : [];
                        })()
                      : []
                    }
                    placeholder="Ex: Cocody"
                    searchPlaceholder="Rechercher un quartier..."
                    emptyText="Sélectionnez d'abord une ville"
                    disabled={!formData.city}
                  />
                  {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse complète</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="Rue, numéro, repères..."
                  rows={3}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Détails de la propriété</h2>
              <p className="text-muted-foreground">
                Décrivez les caractéristiques de votre bien
              </p>
            </div>

            <div className="space-y-4 px-2">
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Titre de l'annonce <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Ex: Appartement moderne 3 chambres"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive font-medium">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Décrivez votre bien en détail..."
                  rows={4}
                />
              </div>

              {/* Chambres et salles de bain pour les habitations */}
              {(formData.propertyType !== 'land' && formData.propertyType !== 'commercial') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Chambres
                    </Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => updateFormData({ bedrooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre" />
                      </SelectTrigger>
        <SelectContent className="bg-background border z-50">
          {[1,2,3,4,5,6,7,8].map(num => (
            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
          ))}
        </SelectContent>
                    </Select>
                    {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      Salles de bain
                    </Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => updateFormData({ bathrooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre" />
                      </SelectTrigger>
        <SelectContent className="bg-background border z-50">
          {[1,2,3,4,5,6].map(num => (
            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
          ))}
        </SelectContent>
                    </Select>
                    {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                  </div>
                </div>
              )}

              {/* Documents du terrain */}
              {formData.propertyType === 'land' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents disponibles
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez les documents que vous possédez pour ce terrain
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'acd', label: 'ACD (Arrêté de Concession Définitive)' },
                      { value: 'lettre_attribution', label: 'Lettre d\'attribution' },
                      { value: 'attestation_villageoise', label: 'Attestation villageoise' },
                      { value: 'titre_foncier', label: 'Titre foncier' },
                      { value: 'calque', label: 'Calque (plan technique)' },
                      { value: 'certificat_propriete', label: 'Certificat de propriété' },
                      { value: 'quitus_fiscal', label: 'Quitus fiscal' },
                      { value: 'pv_bornage', label: 'Procès-verbal de bornage' },
                      { value: 'certificat_non_hypotheque', label: 'Certificat de non-hypothèque' },
                      { value: 'attestation_mise_en_valeur', label: 'Attestation de mise en valeur' }
                    ].map((doc) => (
                      <div key={doc.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={doc.value}
                          checked={formData.landDocuments?.includes(doc.value) || false}
                          onCheckedChange={(checked) => {
                            const currentDocs = formData.landDocuments || [];
                            if (checked) {
                              updateFormData({ 
                                landDocuments: [...currentDocs, doc.value] 
                              });
                            } else {
                              updateFormData({ 
                                landDocuments: currentDocs.filter(d => d !== doc.value) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={doc.value} className="text-sm font-normal cursor-pointer">
                          {doc.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salles de bain pour les espaces commerciaux */}
              {formData.propertyType === 'commercial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Bath className="w-4 h-4" />
                        Salles de bain
                      </Label>
                      <Select value={formData.bathrooms} onValueChange={(value) => updateFormData({ bathrooms: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nombre" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {[0,1,2,3,4,5,6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Type d'activité</Label>
                      <Select value={formData.commercialType} onValueChange={(value) => updateFormData({ commercialType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="bureau">Bureau</SelectItem>
                          <SelectItem value="boutique">Boutique</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="entrepot">Entrepôt</SelectItem>
                          <SelectItem value="industrie">Industrie</SelectItem>
                          <SelectItem value="medical">Cabinet médical</SelectItem>
                          <SelectItem value="coiffure">Salon de coiffure</SelectItem>
                          <SelectItem value="pharmacie">Pharmacie</SelectItem>
                          <SelectItem value="superette">Superette</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Étage</Label>
                      <Select value={formData.floor} onValueChange={(value) => updateFormData({ floor: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="rdc">Rez-de-chaussée</SelectItem>
                          <SelectItem value="1">1er étage</SelectItem>
                          <SelectItem value="2">2ème étage</SelectItem>
                          <SelectItem value="3">3ème étage</SelectItem>
                          <SelectItem value="4">4ème étage</SelectItem>
                          <SelectItem value="5+">5ème étage ou plus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Places de parking</Label>
                      <Select value={formData.parkingSpaces} onValueChange={(value) => updateFormData({ parkingSpaces: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nombre" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {[0,1,2,3,4,5,10,15,20,30,50].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num === 0 ? 'Aucune' : num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Année de construction (optionnel)</Label>
                    <Input
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) => updateFormData({ yearBuilt: e.target.value })}
                      placeholder="Ex: 2015"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Maximize className="w-4 h-4" />
                      Surface {formData.propertyType === 'land' ? 'totale (obligatoire)' : formData.propertyType === 'commercial' ? 'commerciale (optionnelle)' : 'habitable (optionnelle)'} (m²)
                    </Label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => updateFormData({ area: e.target.value })}
                    placeholder="Ex: 85"
                  />
                  {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
                </div>

                {formData.propertyType === 'house' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <TreePine className="w-4 h-4" />
                      Surface terrain (m²)
                    </Label>
                    <Input
                      type="number"
                      value={formData.landArea}
                      onChange={(e) => updateFormData({ landArea: e.target.value })}
                      placeholder="Ex: 300"
                    />
                  </div>
                )}
              </div>

              {/* Commodités pour les propriétés non-terrains */}
              {formData.propertyType !== 'land' && (
                <div className="space-y-3">
                  <Label>Commodités</Label>
                  <div className="flex flex-wrap gap-2">
                    {(formData.propertyType === 'commercial' ? COMMERCIAL_AMENITIES : AMENITIES).map((amenity) => {
                      const isSelected = formData.amenities.includes(amenity);
                      return (
                        <Badge
                          key={amenity}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Informations supplémentaires pour les terrains */}
              {formData.propertyType === 'land' && (
                <div className="space-y-2">
                  <Label>Informations supplémentaires</Label>
                  <Textarea
                    value={formData.additionalInfo || ''}
                    onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
                    placeholder="Ex: Proche école, accès goudronné, terrain plat, zone résidentielle..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Décrivez les caractéristiques et avantages du terrain
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 4: Price */}
        {currentStep === 4 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Quel est le prix ?</h2>
              <p className="text-muted-foreground">
                Définissez le {(formData.purpose === 'rent' || formData.propertyType === 'commercial') ? 'loyer mensuel' : 'prix de vente'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {formData.purpose === 'rent' || formData.propertyType === 'commercial' ? 'Loyer mensuel' : 'Prix de vente'} ({currency})
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData({ price: e.target.value })}
                    placeholder={formData.purpose === 'rent' ? "Ex: 850000" : "Ex: 45000000"}
                    className="text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currency}
                  </span>
                </div>
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Aperçu du prix</p>
                <div className="text-2xl font-bold text-primary">
                  {formData.price ? parseInt(formData.price).toLocaleString() : '0'} {currency}
                  {(formData.purpose === 'rent' || formData.propertyType === 'commercial') && <span className="text-base font-normal text-muted-foreground">/mois</span>}
                  {formData.isNegotiable && <span className="text-sm text-orange-600 ml-2">(Négociable)</span>}
                </div>
              </div>

              {/* Prix négociable */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="negotiable"
                  checked={formData.isNegotiable}
                  onCheckedChange={(checked) => updateFormData({ isNegotiable: checked === true })}
                />
                <Label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">
                  Prix négociable
                </Label>
              </div>

              {/* Caution et mois d'avance pour les locations */}
              {(formData.purpose === 'rent' || formData.propertyType === 'commercial') && (
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-base">Conditions de location</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Caution</Label>
                      <Select value={formData.securityDeposit} onValueChange={(value) => updateFormData({ securityDeposit: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="1">1 mois</SelectItem>
                          <SelectItem value="2">2 mois</SelectItem>
                          <SelectItem value="3">3 mois</SelectItem>
                          <SelectItem value="4">4 mois</SelectItem>
                          <SelectItem value="5">5 mois</SelectItem>
                          <SelectItem value="6">6 mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Mois d'avance</Label>
                      <Select value={formData.advancePayment} onValueChange={(value) => updateFormData({ advancePayment: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="1">1 mois</SelectItem>
                          <SelectItem value="2">2 mois</SelectItem>
                          <SelectItem value="3">3 mois</SelectItem>
                          <SelectItem value="4">4 mois</SelectItem>
                          <SelectItem value="5">5 mois</SelectItem>
                          <SelectItem value="6">6 mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {formData.securityDeposit && formData.advancePayment && formData.price && (
                      <div className="mt-2 p-2 bg-background rounded border">
                        <p>Total à prévoir à la signature :</p>
                        <p className="font-semibold text-primary">
                          {(parseInt(formData.price) * (parseInt(formData.securityDeposit) + parseInt(formData.advancePayment))).toLocaleString()} {currency}
                        </p>
                        <p className="text-xs">
                          ({formData.securityDeposit} mois caution + {formData.advancePayment} mois d'avance)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 5: Médias */}
        {currentStep === 5 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Ajoutez vos médias</h2>
              <p className="text-muted-foreground">
                Photos, vidéo et vue 360° pour mettre en valeur votre bien
              </p>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photos ({formData.images.length}/20)
                </h3>
                <Badge variant="secondary">Obligatoire</Badge>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">
                  Ajoutez jusqu'à 20 photos de votre bien
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <Button asChild disabled={formData.images.length >= 20}>
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.images.length === 0 ? 'Choisir des photos' : 'Ajouter plus de photos'}
                  </label>
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Photo principale</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
            </div>

            <Separator />

            {/* Video Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vidéo (max 1 minute)
                </h3>
                <Badge variant="outline">Optionnel</Badge>
              </div>

              {!formData.video ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Ajoutez une vidéo de présentation (max 1 minute, 100 MB)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="videoUpload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="videoUpload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir une vidéo
                    </label>
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{formData.video.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(formData.video.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateFormData({ video: undefined })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {errors.video && <p className="text-sm text-destructive">{errors.video}</p>}
            </div>

            <Separator />

            {/* Virtual Tour Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Rotate3D className="w-5 h-5" />
                  Vue 360°
                </h3>
                <Badge variant="outline">Optionnel</Badge>
              </div>

              {!formData.virtualTour ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Rotate3D className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Ajoutez une visite virtuelle 360° (max 50 MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleVirtualTourUpload}
                    className="hidden"
                    id="virtualTourUpload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="virtualTourUpload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir une vue 360°
                    </label>
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Rotate3D className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{formData.virtualTour.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(formData.virtualTour.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateFormData({ virtualTour: undefined })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 6: Preview */}
        {currentStep === 6 && (
          <Card className="p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Aperçu de votre annonce</h2>
              <p className="text-muted-foreground">
                Vérifiez les informations avant publication
              </p>
            </div>

            <div className="space-y-6">
              {/* Preview Card */}
              <Card className="overflow-hidden">
                {formData.images.length > 0 && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={URL.createObjectURL(formData.images[0])}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4 space-y-3">
                  <div className="text-xl font-bold text-primary">
                    {formData.price ? parseInt(formData.price).toLocaleString() : '0'} {currency}
                  {(formData.purpose === 'rent' || formData.propertyType === 'commercial') && (
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  )}
                  </div>
                  
                  <h3 className="font-semibold">{formData.title}</h3>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {formData.neighborhood}, {formData.city}
                  </div>
                  
                  {(formData.propertyType !== 'land' && formData.propertyType !== 'commercial') && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {formData.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{formData.bedrooms}</span>
                        </div>
                      )}
                      {formData.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{formData.bathrooms}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>{formData.area} m²</span>
                      </div>
                    </div>
                  )}

                  {/* Details pour les espaces commerciaux */}
                  {formData.propertyType === 'commercial' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {formData.bathrooms && parseInt(formData.bathrooms) > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{formData.bathrooms} SdB</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>{formData.area} m²</span>
                      </div>
                    </div>
                  )}

                  {/* Details pour les terrains */}
                  {formData.propertyType === 'land' && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Maximize className="w-4 h-4" />
                      <span>{formData.area} m²</span>
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-accent-light rounded-lg p-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Prêt à publier
                </h4>
                <p className="text-sm text-muted-foreground">
                  Votre annonce sera vérifiée avant publication et apparaîtra sous 24h.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === (profile?.user_type === 'agence' ? 1 : 0)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          {currentStep < 6 ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? 'Publication...' : (
                <>
                  <Upload className="w-4 h-4" />
                  Publier l'annonce
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}