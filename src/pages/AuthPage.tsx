import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Phone, MapPin, ChevronDown, Check, Globe, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { africanCountries, Country } from '@/data/africanCountries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: null as Country | null,
    city: '',
    phone: '',
  });

  const availableCities = formData.country?.cities || [];

  const FlagImg = ({
    code,
    name,
    className = '',
  }: {
    code: string;
    name: string;
    className?: string;
  }) => (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={`Drapeau ${name}`}
      className={`h-4 w-6 rounded-sm object-cover ${className}`}
      loading="lazy"
    />
  );

  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'firstName':
        if (!value || value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) return 'Le prénom ne doit contenir que des lettres';
        break;
      case 'lastName':
        if (!value || value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) return 'Le nom ne doit contenir que des lettres';
        break;
      case 'email':
        if (!value) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format d\'email invalide';
        break;
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
        if (!/(?=.*[0-9])/.test(value)) return 'Le mot de passe doit contenir au moins un chiffre';
        break;
      case 'confirmPassword':
        if (!value) return 'Veuillez confirmer le mot de passe';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        break;
      case 'phone':
        if (!value) return 'Le numéro de téléphone est requis';
        if (value.length < 8) return 'Numéro de téléphone trop court';
        if (value.length > 15) return 'Numéro de téléphone trop long';
        break;
      case 'country':
        if (!value) return 'Veuillez sélectionner un pays';
        break;
      case 'city':
        if (!value) return 'Veuillez sélectionner une ville';
        break;
    }
    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!isLogin) {
      newErrors.firstName = validateField('firstName', formData.firstName);
      newErrors.lastName = validateField('lastName', formData.lastName);
      newErrors.country = validateField('country', formData.country);
      newErrors.city = validateField('city', formData.city);
      newErrors.phone = validateField('phone', formData.phone);
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
      if (!acceptedTerms) newErrors.terms = 'Veuillez accepter les conditions d\'utilisation';
    }
    
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      country: true,
      city: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Erreur', description: 'L\'image ne doit pas dépasser 5 Mo', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setFormData(prev => ({ ...prev, country, city: '' }));
    setShowCountryDropdown(false);
    if (touched.country) {
      setErrors(prev => ({ ...prev, country: undefined, city: 'Veuillez sélectionner une ville' }));
    }
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setShowCityDropdown(false);
    if (touched.city) {
      setErrors(prev => ({ ...prev, city: undefined }));
    }
  };

  const sendVerificationEmail = async (email: string, firstName: string, userId: string) => {
    try {
      await supabase.functions.invoke('send-verification-email', {
        body: { email, firstName, userId },
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ title: 'Erreur', description: 'Veuillez corriger les erreurs du formulaire', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast({ title: 'Connexion réussie', description: 'Bienvenue sur LaZone!' });
        navigate('/profile');
      } else {
        const fullPhoneNumber = `${formData.country?.phoneCode}${formData.phone}`;
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: `${formData.firstName} ${formData.lastName}`,
              country: formData.country?.name,
              country_code: formData.country?.code,
              city: formData.city,
              phone: fullPhoneNumber,
            },
            emailRedirectTo: `${window.location.origin}/profile`,
          },
        });
        if (error) throw error;
        
        // Send verification email via Resend
        if (data.user) {
          await sendVerificationEmail(formData.email, formData.firstName, data.user.id);
        }
        
        toast({ 
          title: 'Compte créé', 
          description: 'Un email de vérification vous a été envoyé!' 
        });
        navigate('/profile');
      }
    } catch (error: any) {
      let message = 'Une erreur est survenue';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('User already registered')) {
        message = 'Cet email est déjà utilisé';
      } else if (error.message.includes('Password should be')) {
        message = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-destructive text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="icon-button active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display font-semibold">{isLogin ? 'Connexion' : 'Inscription'}</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏠</div>
          <h1 className="font-display text-2xl font-bold gradient-text">LaZone</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Sign Up Fields */}
          {!isLogin && (
            <>
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl">📷</span>
                      <span className="text-xs text-muted-foreground">Photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={`glass-card p-1 ${errors.firstName && touched.firstName ? 'border border-destructive' : ''}`}>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  <InputError message={touched.firstName ? errors.firstName : undefined} />
                </div>
                <div>
                  <div className={`glass-card p-1 ${errors.lastName && touched.lastName ? 'border border-destructive' : ''}`}>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  <InputError message={touched.lastName ? errors.lastName : undefined} />
                </div>
              </div>

              {/* Country Select */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCountryDropdown(!showCountryDropdown);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full glass-card p-1 ${errors.country && touched.country ? 'border border-destructive' : ''}`}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className={`flex-1 text-left text-sm ${formData.country ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {formData.country ? (
                        <span className="flex items-center gap-2">
                          <FlagImg code={formData.country.code} name={formData.country.name} />
                          <span>{formData.country.name}</span>
                        </span>
                      ) : 'Sélectionner un pays'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <InputError message={touched.country ? errors.country : undefined} />
                
                {showCountryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {africanCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                      >
                        <FlagImg code={country.code} name={country.name} className="h-5 w-7" />
                        <span className="flex-1 text-sm">{country.name}</span>
                        <span className="text-xs text-muted-foreground">{country.phoneCode}</span>
                        {formData.country?.code === country.code && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Select */}
              {formData.country && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityDropdown(!showCityDropdown);
                      setShowCountryDropdown(false);
                    }}
                    className={`w-full glass-card p-1 ${errors.city && touched.city ? 'border border-destructive' : ''}`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className={`flex-1 text-left text-sm ${formData.city ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {formData.city || 'Sélectionner une ville'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <InputError message={touched.city ? errors.city : undefined} />
                  
                  {showCityDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {availableCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <span className="flex-1 text-sm">{city}</span>
                          {formData.city === city && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Phone with Country Code */}
              <div>
                <div className={`glass-card p-1 ${errors.phone && touched.phone ? 'border border-destructive' : ''}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {formData.country ? (
                      <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg">
                        <FlagImg code={formData.country.code} name={formData.country.name} />
                        <span className="text-sm font-medium text-foreground">
                          {formData.country.phoneCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sélectionnez un pays</span>
                    )}
                    <input
                      type="tel"
                      placeholder="Numéro de téléphone"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('phone')}
                      className="flex-1 bg-transparent outline-none text-sm"
                      disabled={!formData.country}
                    />
                  </div>
                </div>
                <InputError message={touched.phone ? errors.phone : undefined} />
                {formData.country && formData.phone && (
                  <p className="text-xs text-muted-foreground mt-1 pl-1">
                    Numéro complet: {formData.country.phoneCode}{formData.phone}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <div className={`glass-card p-1 ${errors.email && touched.email ? 'border border-destructive' : ''}`}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <InputError message={touched.email ? errors.email : undefined} />
          </div>

          {/* Password */}
          <div>
            <div className={`glass-card p-1 ${errors.password && touched.password ? 'border border-destructive' : ''}`}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <InputError message={touched.password ? errors.password : undefined} />
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div>
              <div className={`glass-card p-1 ${errors.confirmPassword && touched.confirmPassword ? 'border border-destructive' : ''}`}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <InputError message={touched.confirmPassword ? errors.confirmPassword : undefined} />
            </div>
          )}

          {/* Terms Checkbox */}
          {!isLogin && (
            <div>
              <div className="flex items-start gap-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(!acceptedTerms);
                    if (touched.terms) {
                      setErrors(prev => ({ ...prev, terms: !acceptedTerms ? undefined : 'Veuillez accepter les conditions d\'utilisation' }));
                    }
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    acceptedTerms ? 'bg-primary border-primary' : errors.terms && touched.terms ? 'border-destructive' : 'border-border'
                  }`}
                >
                  {acceptedTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <p className="text-xs text-muted-foreground">
                  J'accepte les{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsDialog(true)}
                    className="text-primary underline"
                  >
                    conditions d'utilisation
                  </button>
                  {' '}et la{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyDialog(true)}
                    className="text-primary underline"
                  >
                    politique de confidentialité
                  </button>
                </p>
              </div>
              <InputError message={touched.terms ? errors.terms : undefined} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary py-3.5 rounded-2xl text-primary-foreground font-display font-semibold shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Chargement...
              </span>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              'Créer un compte'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setTouched({});
            }}
            className="text-muted-foreground text-sm"
          >
            {isLogin ? (
              <>
                Pas de compte?{' '}
                <span className="text-primary font-semibold">Créer un compte</span>
              </>
            ) : (
              <>
                Déjà un compte?{' '}
                <span className="text-primary font-semibold">Se connecter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Conditions d'utilisation</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-4">
            <p><strong>1. Acceptation des conditions</strong></p>
            <p>En utilisant l'application LaZone, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.</p>
            
            <p><strong>2. Description du service</strong></p>
            <p>LaZone est une plateforme immobilière permettant aux utilisateurs de publier, rechercher et consulter des annonces immobilières en Afrique.</p>
            
            <p><strong>3. Inscription et compte</strong></p>
            <p>Pour utiliser certaines fonctionnalités de l'application, vous devez créer un compte. Vous êtes responsable de la confidentialité de vos identifiants de connexion.</p>
            
            <p><strong>4. Contenu utilisateur</strong></p>
            <p>Vous êtes seul responsable du contenu que vous publiez sur LaZone. Il est interdit de publier du contenu illégal, trompeur ou portant atteinte aux droits d'autrui.</p>
            
            <p><strong>5. Propriété intellectuelle</strong></p>
            <p>Tous les éléments de l'application LaZone sont protégés par les droits de propriété intellectuelle.</p>
            
            <p><strong>6. Limitation de responsabilité</strong></p>
            <p>LaZone ne peut être tenu responsable des transactions entre utilisateurs ni de l'exactitude des informations publiées.</p>
            
            <p><strong>7. Modification des conditions</strong></p>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Politique de confidentialité</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-4">
            <p><strong>1. Collecte des données</strong></p>
            <p>Nous collectons les informations que vous nous fournissez lors de votre inscription : nom, prénom, email, numéro de téléphone, pays et ville.</p>
            
            <p><strong>2. Utilisation des données</strong></p>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gérer votre compte utilisateur</li>
              <li>Permettre la communication entre utilisateurs</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des notifications importantes</li>
            </ul>
            
            <p><strong>3. Protection des données</strong></p>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé.</p>
            
            <p><strong>4. Partage des données</strong></p>
            <p>Vos données ne sont pas vendues à des tiers. Certaines informations peuvent être visibles par d'autres utilisateurs dans le cadre du service.</p>
            
            <p><strong>5. Vos droits</strong></p>
            <p>Vous avez le droit d'accéder, de rectifier ou de supprimer vos données personnelles. Contactez-nous pour exercer ces droits.</p>
            
            <p><strong>6. Cookies</strong></p>
            <p>L'application peut utiliser des cookies pour améliorer votre expérience utilisateur.</p>
            
            <p><strong>7. Contact</strong></p>
            <p>Pour toute question concernant notre politique de confidentialité, contactez-nous à support@lazone.africa</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;