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
  Maximize, TreePine, Car, Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "@/contexts/LocationContext";

interface ListingData {
  purpose: 'rent' | 'sale';
  propertyType: 'apartment' | 'house' | 'land' | '';
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
}

const AMENITIES = [
  'Piscine', 'Parking', 'Meublé', 'Sécurité 24/7', 
  'Fibre', 'Climatisation', 'Ascenseur', 'Balcon',
  'Jardin', 'Vue mer', 'Neuf', 'Générateur'
];

const STEPS = [
  { id: 1, title: 'Type & Purpose', icon: Home },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Détails', icon: Building2 },
  { id: 4, title: 'Prix', icon: DollarSign },
  { id: 5, title: 'Photos', icon: Camera },
  { id: 6, title: 'Aperçu', icon: Upload }
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedCountry, selectedCity, currency } = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
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
    images: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = (updates: Partial<ListingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
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
        if (!formData.area) newErrors.area = 'La surface est requise';
        if (formData.propertyType !== 'land') {
          if (!formData.bedrooms) newErrors.bedrooms = 'Nombre de chambres requis';
          if (!formData.bathrooms) newErrors.bathrooms = 'Nombre de salles de bain requis';
        }
        break;
      case 4:
        if (!formData.price) newErrors.price = 'Le prix est requis';
        break;
      case 5:
        if (formData.images.length === 0) newErrors.images = 'Au moins une photo est requise';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateFormData({ images: [...formData.images, ...files] });
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
      default: return type;
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Here would be the actual submission logic
      console.log('Submitting listing:', formData);
      
      // Simulate success and redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

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
                Étape {currentStep} sur {STEPS.length}
              </p>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Step 1: Type & Purpose */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Quel type de bien proposez-vous ?</h2>
              <p className="text-muted-foreground">
                Choisissez le type de propriété et l'objectif
              </p>
            </div>

            {/* Purpose Selection */}
            <div className="space-y-3">
              <Label>Objectif</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['rent', 'sale'] as const).map((purpose) => (
                  <Button
                    key={purpose}
                    variant={formData.purpose === purpose ? "default" : "outline"}
                    onClick={() => updateFormData({ purpose })}
                    className="h-12"
                  >
                    {purpose === 'rent' ? 'À louer' : 'À vendre'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Type Selection */}
            <div className="space-y-3">
              <Label>Type de bien</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['apartment', 'house', 'land'] as const).map((type) => {
                  const Icon = type === 'apartment' ? Building2 : type === 'house' ? Home : MapPin;
                  return (
                    <Button
                      key={type}
                      variant={formData.propertyType === type ? "default" : "outline"}
                      onClick={() => updateFormData({ propertyType: type })}
                      className="h-20 flex-col gap-2"
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{getPropertyTypeLabel(type)}</span>
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
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Où se trouve votre bien ?</h2>
              <p className="text-muted-foreground">
                Précisez la localisation de votre propriété
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Ex: Abidjan"
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => updateFormData({ neighborhood: e.target.value })}
                    placeholder="Ex: Cocody"
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
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Détails de la propriété</h2>
              <p className="text-muted-foreground">
                Décrivez les caractéristiques de votre bien
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titre de l'annonce</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Ex: Appartement moderne 3 chambres"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
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

              {formData.propertyType !== 'land' && (
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
                      <SelectContent>
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
                      <SelectContent>
                        {[1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    Surface {formData.propertyType === 'land' ? 'totale' : 'habitable'} (m²)
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

              {/* Amenities */}
              <div className="space-y-3">
                <Label>Commodités</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => {
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
            </div>
          </Card>
        )}

        {/* Step 4: Price */}
        {currentStep === 4 && (
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Quel est le prix ?</h2>
              <p className="text-muted-foreground">
                Définissez le {formData.purpose === 'rent' ? 'loyer mensuel' : 'prix de vente'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {formData.purpose === 'rent' ? 'Loyer mensuel' : 'Prix de vente'} ({currency})
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
                  {formData.purpose === 'rent' && <span className="text-base font-normal text-muted-foreground">/mois</span>}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Photos */}
        {currentStep === 5 && (
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Ajoutez des photos</h2>
              <p className="text-muted-foreground">
                Les photos attirent plus de visiteurs
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Glissez vos photos ici ou cliquez pour les sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <Button asChild>
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir des photos
                  </label>
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
            </div>
          </Card>
        )}

        {/* Step 6: Preview */}
        {currentStep === 6 && (
          <Card className="p-6 space-y-6">
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
                    {formData.purpose === 'rent' && (
                      <span className="text-sm font-normal text-muted-foreground">/mois</span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold">{formData.title}</h3>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {formData.neighborhood}, {formData.city}
                  </div>
                  
                  {formData.propertyType !== 'land' && (
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
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Publier l'annonce
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}