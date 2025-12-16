import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, Home, DollarSign, Upload, Plus, X, 
  Bed, Bath, Maximize, FileText, Clock, Wallet, Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';
type TransactionType = 'sale' | 'rent';

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

const PublishPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
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
  
  // House/Apartment specific
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Documents (for land and sale)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  // Rent specific
  const [leaseDuration, setLeaseDuration] = useState('12');
  const [deposit, setDeposit] = useState('');
  const [depositMonths, setDepositMonths] = useState('2');

  const showBedroomsBathrooms = propertyType === 'house' || propertyType === 'apartment';
  const showAmenities = propertyType !== 'land';
  const showDocuments = propertyType === 'land' || transactionType === 'sale';
  const showRentDetails = transactionType === 'rent' && propertyType !== 'land';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 6 - images.length);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setImageUrls(prev => [...prev, ...newUrls]);
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

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Veuillez vous connecter', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!title || !address || !city || !price || !area) {
      toast({ title: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    if (images.length === 0) {
      toast({ title: 'Veuillez ajouter au moins une photo', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Create property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          title,
          description,
          address,
          city,
          postal_code: postalCode,
          price: parseFloat(price),
          area: parseFloat(area),
          property_type: propertyType,
          type: transactionType,
          bedrooms: showBedroomsBathrooms ? parseInt(bedrooms) || 0 : null,
          bathrooms: showBedroomsBathrooms ? parseInt(bathrooms) || 0 : null,
          features: [...selectedAmenities, ...selectedDocuments.map(d => DOCUMENTS.find(doc => doc.id === d)?.label || d)],
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
              <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                <Plus className="w-6 h-6" />
                <span className="text-xs">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Belle villa avec piscine"
              className="mt-1"
            />
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

        {/* Location */}
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
            <div>
              <Label htmlFor="address">Adresse <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quartier, rue..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ville"
                  className="mt-1"
                />
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
            </div>
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
              onChange={(e) => setArea(e.target.value)}
              placeholder="0"
              className="pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">m²</span>
          </div>
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

        {/* Amenities - For house/apartment/commercial */}
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
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedAmenities.includes(amenity)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Documents - For land or sale */}
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
            <div className="space-y-2">
              {DOCUMENTS.map(doc => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => toggleDocument(doc.id)}
                  />
                  <span className="text-sm">{doc.label}</span>
                </label>
              ))}
            </div>
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

        {/* Price */}
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
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="pr-16 text-lg font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              FCFA
            </span>
          </div>
          {transactionType === 'rent' && (
            <p className="text-xs text-muted-foreground mt-2">
              Prix par mois
            </p>
          )}
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
    </div>
  );
};

export default PublishPage;
