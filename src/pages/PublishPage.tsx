import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, Home, DollarSign, Upload, Plus, X, 
  Bed, Bath, Maximize, FileText, Clock, Wallet, Check,
  Loader2, AlertCircle, ChevronDown, Map, Image
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { filterMultipleFields, getContentViolationMessage } from '@/lib/contentFilter';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { z } from 'zod';
import { africanCountries } from '@/data/africanCountries';
import LocationMapPicker, { countryCoordinates } from '@/components/publish/LocationMapPicker';
import { useCamera, isNativePlatform } from '@/hooks/useNativePlugins';
import SectionTutorialButton from '@/components/tutorial/SectionTutorialButton';
import EmailVerificationRequired from '@/components/EmailVerificationRequired';
import heroBg3 from '@/assets/hero-bg-3.jpg';

type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';
type TransactionType = 'sale' | 'rent';

interface FormErrors {
  images?: string;
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  price?: string;
  area?: string;
  bedrooms?: string;
  bathrooms?: string;
}

const AMENITIES = [
  'Piscine', 'Jardin', 'Garage', 'Terrasse', 'Balcon', 'Cave',
  'Climatisation', 'Chauffage', 'Ascenseur', 'Gardien', 'Parking',
  'Cuisine équipée', 'Meublé', 'Internet', 'Eau chaude', 'Groupe électrogène'
];

const DOCUMENTS = [
  { id: 'acd', label: 'ACD (Attestation de Cession de Droits)' },
  { id: 'titre_foncier', label: 'Titre Foncier' },
  { id: 'permis_construire', label: 'Permis de construire' },
  { id: 'certificat_urbanisme', label: 'Certificat d\'urbanisme' },
  { id: 'plan_cadastral', label: 'Plan cadastral' },
  { id: 'attestation_propriete', label: 'Attestation de propriété' },
];

const LEASE_DURATIONS = [
  { value: '1', label: '1 mois' },
  { value: '3', label: '3 mois' },
  { value: '6', label: '6 mois' },
  { value: '12', label: '1 an' },
  { value: '24', label: '2 ans' },
  { value: '36', label: '3 ans' },
  { value: 'indefini', label: 'Indéfini' },
];

// Validation schema
const createValidationSchema = (propertyType: PropertyType, transactionType: TransactionType) => {
  const baseSchema = z.object({
    title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    address: z.string().min(3, 'L\'adresse doit contenir au moins 3 caractères'),
    city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
    price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Le prix doit être un nombre positif'),
    area: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'La superficie doit être un nombre positif'),
  });

  return baseSchema;
};

const PublishPage = () => {
  const navigate = useNavigate();
  const { user, profile, isEmailVerified } = useAuth();
  const { takePicture, pickMultiple, loading: cameraLoading } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Form state
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  
  // Country and city selection
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Map state
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 5.3600, lng: -4.0083 });
  
  // House/Apartment specific
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Documents (for land and sale)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  // Rent specific
  const [leaseDuration, setLeaseDuration] = useState('12');
  const [depositMonths, setDepositMonths] = useState('2');

  // Contact options
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  // Popover states
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  // Pre-fill country from user profile
  useEffect(() => {
    if (profile?.country) {
      const country = africanCountries.find(c => c.name === profile.country || c.code === profile.country);
      if (country) {
        setSelectedCountry(country.code);
        setAvailableCities(country.cities);
        
        // Set initial marker position based on country
        const coords = countryCoordinates[country.code];
        if (coords) {
          setMarkerPosition({ lat: coords.lat, lng: coords.lng });
        }
      }
    }
  }, [profile?.country]);

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = africanCountries.find(c => c.code === selectedCountry);
      if (country) {
        setAvailableCities(country.cities);
        // Reset city if not in new country's cities
        if (city && !country.cities.includes(city)) {
          setCity('');
        }
        
        // Update marker position to country center
        const coords = countryCoordinates[selectedCountry];
        if (coords) {
          setMarkerPosition({ lat: coords.lat, lng: coords.lng });
        }
      }
    }
  }, [selectedCountry]);

  const showBedroomsBathrooms = propertyType === 'house' || propertyType === 'apartment';
  const showAmenities = propertyType !== 'land';
  const showDocuments = propertyType === 'land' || transactionType === 'sale';
  const showRentDetails = transactionType === 'rent' && propertyType !== 'land';

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value || value.length < 5) {
          newErrors.title = 'Le titre doit contenir au moins 5 caractères';
        } else if (value.length > 100) {
          newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
        } else {
          delete newErrors.title;
        }
        break;
      case 'address':
        if (!value || value.length < 3) {
          newErrors.address = 'L\'adresse doit contenir au moins 3 caractères';
        } else {
          delete newErrors.address;
        }
        break;
      case 'city':
        if (!value || value.length < 2) {
          newErrors.city = 'La ville doit contenir au moins 2 caractères';
        } else {
          delete newErrors.city;
        }
        break;
      case 'price':
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.price = 'Veuillez entrer un prix valide';
        } else {
          delete newErrors.price;
        }
        break;
      case 'area':
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.area = 'Veuillez entrer une superficie valide';
        } else {
          delete newErrors.area;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 6 - images.length);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
    
    if (newFiles.length > 0) {
      setErrors(prev => {
        const { images, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTakePhoto = async () => {
    const photo = await takePicture();
    if (photo?.webPath) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const file = new File([blob], `property-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      if (images.length < 6) {
        const url = URL.createObjectURL(file);
        setImages(prev => [...prev, file]);
        setImageUrls(prev => [...prev, url]);
        setErrors(prev => {
          const { images, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handlePickMultiple = async () => {
    const photos = await pickMultiple(6 - images.length);
    if (photos && photos.length > 0) {
      const newFiles: File[] = [];
      const newUrls: string[] = [];
      
      for (const photo of photos) {
        if (photo.webPath) {
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          const file = new File([blob], `property-${Date.now()}-${newFiles.length}.jpg`, { type: 'image/jpeg' });
          const url = URL.createObjectURL(file);
          newFiles.push(file);
          newUrls.push(url);
        }
      }
      
      setImages(prev => [...prev, ...newFiles].slice(0, 6));
      setImageUrls(prev => [...prev, ...newUrls].slice(0, 6));
      
      if (newFiles.length > 0) {
        setErrors(prev => {
          const { images, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(d => d !== docId)
        : [...prev, docId]
    );
  };

  const handleMarkerPositionChange = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (images.length === 0) {
      newErrors.images = 'Veuillez ajouter au moins une photo';
    }
    
    if (!title || title.length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères';
    }
    
    if (!address || address.length < 3) {
      newErrors.address = 'L\'adresse doit contenir au moins 3 caractères';
    }
    
    if (!city || city.length < 2) {
      newErrors.city = 'La ville doit contenir au moins 2 caractères';
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Veuillez entrer un prix valide';
    }
    
    if (!area || isNaN(Number(area)) || Number(area) <= 0) {
      newErrors.area = 'Veuillez entrer une superficie valide';
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      address: true,
      city: true,
      price: true,
      area: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Veuillez vous connecter', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!validateForm()) {
      toast({ 
        title: 'Formulaire incomplet', 
        description: 'Veuillez corriger les erreurs avant de publier',
        variant: 'destructive' 
      });
      return;
    }

    // Content filtering check
    const contentCheck = filterMultipleFields({
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
    });

    if (!contentCheck.isClean) {
      toast({ 
        title: 'Contenu inapproprié détecté', 
        description: getContentViolationMessage(contentCheck.allFlaggedWords),
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Create property with coordinates and country code
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          address: address.trim(),
          city: city.trim(),
          postal_code: postalCode.trim(),
          price: parseFloat(price),
          area: parseFloat(area),
          property_type: propertyType,
          type: transactionType,
          bedrooms: showBedroomsBathrooms ? parseInt(bedrooms) || 0 : null,
          bathrooms: showBedroomsBathrooms ? parseInt(bathrooms) || 0 : null,
          features: [...selectedAmenities, ...selectedDocuments.map(d => DOCUMENTS.find(doc => doc.id === d)?.label || d)],
          whatsapp_enabled: whatsappEnabled,
          country: selectedCountry, // Use country code for filtering consistency
          lat: markerPosition.lat,
          lng: markerPosition.lng,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${property.id}/${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        await supabase
          .from('property_images')
          .insert({
            property_id: property.id,
            url: publicUrl,
            is_primary: i === 0,
            display_order: i,
          });
      }

      toast({ title: 'Annonce publiée avec succès!' });
      navigate('/profile');
    } catch (error) {
      console.error('Error publishing property:', error);
      toast({ title: 'Erreur lors de la publication', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="flex items-center gap-1 text-destructive text-sm mt-1">
        <AlertCircle className="w-3 h-3" />
        <span>{message}</span>
      </div>
    );
  };

  // Login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg3})` }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/70" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6">
          {/* Animated illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-8"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/10">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Home className="w-16 h-16 text-primary" strokeWidth={1.5} />
              </motion.div>
            </div>
            {/* Decorative elements */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/30 backdrop-blur-sm"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 -left-3 w-4 h-4 rounded-full bg-primary/20"
            />
          </motion.div>

          {/* Title and subtitle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl font-bold mb-2">Publiez votre bien</h2>
            <p className="text-muted-foreground">Connectez-vous pour créer votre annonce</p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 w-full max-w-sm mb-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Photos illimitées</p>
                  <p className="text-xs text-muted-foreground">Jusqu'à 6 photos par annonce</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Géolocalisation</p>
                  <p className="text-xs text-muted-foreground">Positionnez sur la carte</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">100% Gratuit</p>
                  <p className="text-xs text-muted-foreground">Aucun frais de publication</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-sm"
          >
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Se connecter
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Pas encore de compte ? <button onClick={() => navigate('/auth')} className="text-primary font-medium">Créer un compte</button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Email verification required
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg3})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/70" />
        <div className="relative z-10">
          <EmailVerificationRequired 
            title="Vérifiez votre email"
            description="Pour publier une annonce, vous devez d'abord vérifier votre adresse email."
            icon={<Home className="w-16 h-16 text-amber-500" strokeWidth={1.5} />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground px-4 py-6">
        <h1 className="font-display text-2xl font-bold">Publier une annonce</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">
          Vendez ou louez votre propriété
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Photo Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Photos <span className="text-destructive">*</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
            {images.length < 6 && (
              isNativePlatform() ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                      errors.images ? 'border-destructive text-destructive' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}>
                      {cameraLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Plus className="w-6 h-6" />
                      )}
                      <span className="text-xs">Ajouter</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={handleTakePhoto} className="gap-2">
                      <Camera className="w-4 h-4" />
                      Prendre une photo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePickMultiple} className="gap-2">
                      <Image className="w-4 h-4" />
                      Choisir de la galerie
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                  errors.images ? 'border-destructive text-destructive' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}>
                  <Plus className="w-6 h-6" />
                  <span className="text-xs">Ajouter</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )
            )}
            {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
              >
                <Upload className="w-5 h-5 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          <ErrorMessage message={errors.images} />
        </motion.div>

        {/* Property Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Type de propriété
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'house', icon: '🏠', label: 'Maison' },
              { value: 'apartment', icon: '🏢', label: 'Appartement' },
              { value: 'land', icon: '🌳', label: 'Terrain' },
              { value: 'commercial', icon: '🏪', label: 'Commercial' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setPropertyType(type.value as PropertyType)}
                className={`p-3 rounded-xl flex items-center gap-2 justify-center transition-all ${
                  propertyType === type.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transaction Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Type de transaction
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTransactionType('sale')}
              className={`p-3 rounded-xl font-medium transition-all ${
                transactionType === 'sale'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              À vendre
            </button>
            <button
              onClick={() => setTransactionType('rent')}
              className={`p-3 rounded-xl font-medium transition-all ${
                transactionType === 'rent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              À louer
            </button>
          </div>
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 shadow-sm space-y-3"
        >
          <div>
            <Label htmlFor="title">Titre de l'annonce <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) validateField('title', e.target.value);
              }}
              onBlur={() => {
                handleBlur('title');
                validateField('title', title);
              }}
              placeholder="Ex: Belle villa avec piscine"
              className={`mt-1 ${errors.title && touched.title ? 'border-destructive' : ''}`}
            />
            {touched.title && <ErrorMessage message={errors.title} />}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre propriété..."
              className="mt-1 min-h-[100px]"
            />
          </div>
        </motion.div>

        {/* Price - Moved up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Prix {transactionType === 'rent' ? 'du loyer mensuel' : ''} <span className="text-destructive">*</span>
          </h3>
          <div className="relative">
            <Input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (touched.price) validateField('price', e.target.value);
              }}
              onBlur={() => {
                handleBlur('price');
                validateField('price', price);
              }}
              placeholder="0"
              className={`pr-16 text-lg font-bold ${errors.price && touched.price ? 'border-destructive' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              FCFA
            </span>
          </div>
          {touched.price && <ErrorMessage message={errors.price} />}
          {transactionType === 'rent' && (
            <p className="text-xs text-muted-foreground mt-2">
              Prix par mois
            </p>
          )}
        </motion.div>

        {/* Location with Country and City Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localisation
          </h3>
          <div className="space-y-3">
            {/* Country Selector */}
            <div>
              <Label>Pays</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50 max-h-64">
                  {africanCountries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                          alt={country.name}
                          className="w-5 h-4 object-cover rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selector */}
            <div>
              <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
              <Select value={city} onValueChange={setCity} disabled={!selectedCountry}>
                <SelectTrigger className={`mt-1 ${errors.city && touched.city ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={selectedCountry ? "Sélectionner une ville" : "Sélectionnez d'abord un pays"} />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50 max-h-64">
                  {availableCities.map(cityName => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.city && <ErrorMessage message={errors.city} />}
            </div>

            <div>
              <Label htmlFor="address">Adresse <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (touched.address) validateField('address', e.target.value);
                }}
                onBlur={() => {
                  handleBlur('address');
                  validateField('address', address);
                }}
                placeholder="Quartier, rue..."
                className={`mt-1 ${errors.address && touched.address ? 'border-destructive' : ''}`}
              />
              {touched.address && <ErrorMessage message={errors.address} />}
            </div>
            
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Code postal"
                className="mt-1"
              />
            </div>

            {/* Map Toggle Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="w-full flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Masquer la carte' : 'Sélectionner sur la carte'}
            </Button>

            {/* Interactive Map */}
            {showMap && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Cliquez ou glissez le marqueur pour définir la position exacte
                </p>
                <LocationMapPicker
                  position={markerPosition}
                  onPositionChange={handleMarkerPositionChange}
                  countryCode={selectedCountry}
                />
                <p className="text-xs text-muted-foreground">
                  Position: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Surface Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Maximize className="w-5 h-5 text-primary" />
            Superficie <span className="text-destructive">*</span>
          </h3>
          <div className="relative">
            <Input
              type="number"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                if (touched.area) validateField('area', e.target.value);
              }}
              onBlur={() => {
                handleBlur('area');
                validateField('area', area);
              }}
              placeholder="0"
              className={`pr-12 ${errors.area && touched.area ? 'border-destructive' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">m²</span>
          </div>
          {touched.area && <ErrorMessage message={errors.area} />}
        </motion.div>

        {/* Bedrooms and Bathrooms - Only for house/apartment */}
        {showBedroomsBathrooms && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bed className="w-5 h-5 text-primary" />
              Chambres et Salles de bain
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms" className="flex items-center gap-2">
                  <Bed className="w-4 h-4" /> Chambres
                </Label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border shadow-lg z-50">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bathrooms" className="flex items-center gap-2">
                  <Bath className="w-4 h-4" /> Salles de bain
                </Label>
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border shadow-lg z-50">
                    {[0, 1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Amenities Dropdown - For house/apartment/commercial */}
        {showAmenities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              Commodités disponibles
            </h3>
            <Popover open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors">
                  <span className={selectedAmenities.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedAmenities.length > 0 
                      ? `${selectedAmenities.length} commodité(s) sélectionnée(s)`
                      : 'Sélectionner les commodités'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${amenitiesOpen ? 'rotate-180' : ''}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] max-w-md p-0 bg-card border shadow-lg z-50" align="start">
                <div className="max-h-64 overflow-y-auto p-2">
                  {AMENITIES.map(amenity => (
                    <label
                      key={amenity}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedAmenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {amenity}
                    <button onClick={() => toggleAmenity(amenity)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Documents Dropdown - For land or sale */}
        {showDocuments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents disponibles
            </h3>
            <Popover open={documentsOpen} onOpenChange={setDocumentsOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors">
                  <span className={selectedDocuments.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedDocuments.length > 0 
                      ? `${selectedDocuments.length} document(s) sélectionné(s)`
                      : 'Sélectionner les documents'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${documentsOpen ? 'rotate-180' : ''}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] max-w-md p-0 bg-card border shadow-lg z-50" align="start">
                <div className="max-h-64 overflow-y-auto p-2">
                  {DOCUMENTS.map(doc => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => toggleDocument(doc.id)}
                      />
                      <span className="text-sm">{doc.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedDocuments.map(docId => {
                  const doc = DOCUMENTS.find(d => d.id === docId);
                  return (
                    <span
                      key={docId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {doc?.label.split(' ')[0]}
                      <button onClick={() => toggleDocument(docId)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Rent Details - Only for rent (excluding land) */}
        {showRentDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-sm space-y-4"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Détails de la location
            </h3>
            
            <div>
              <Label>Durée du bail</Label>
              <Select value={leaseDuration} onValueChange={setLeaseDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50">
                  {LEASE_DURATIONS.map(duration => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Caution (nombre de mois)
              </Label>
              <Select value={depositMonths} onValueChange={setDepositMonths}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} mois de loyer
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-sm"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📱 Options de contact
          </h3>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-background cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-medium text-sm">Autoriser WhatsApp</p>
                <p className="text-xs text-muted-foreground">Les acheteurs pourront vous contacter via WhatsApp</p>
              </div>
            </div>
            <Checkbox
              checked={whatsappEnabled}
              onCheckedChange={(checked) => setWhatsappEnabled(checked === true)}
            />
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary py-4 rounded-2xl text-primary-foreground font-semibold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publication en cours...
            </>
          ) : (
            'Publier l\'annonce'
          )}
        </motion.button>
      </div>

      {user && <SectionTutorialButton section="publish" />}
    </div>
  );
};

export default PublishPage;
