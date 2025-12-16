import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Camera, Globe, Phone, Building2, Users, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const WEST_AFRICA_COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', phoneCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226', flag: '🇧🇫' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224', flag: '🇬🇳' },
  { code: 'TG', name: 'Togo', phoneCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', phoneCode: '+229', flag: '🇧🇯' },
  { code: 'NE', name: 'Niger', phoneCode: '+227', flag: '🇳🇪' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222', flag: '🇲🇷' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245', flag: '🇬🇼' },
  { code: 'GM', name: 'Gambie', phoneCode: '+220', flag: '🇬🇲' },
  { code: 'CV', name: 'Cap-Vert', phoneCode: '+238', flag: '🇨🇻' },
  { code: 'SL', name: 'Sierra Leone', phoneCode: '+232', flag: '🇸🇱' },
  { code: 'LR', name: 'Liberia', phoneCode: '+231', flag: '🇱🇷' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
];

const USER_TYPES = [
  { id: 'particulier', label: 'Particulier', icon: User },
  { id: 'agence', label: 'Agence', icon: Building2 },
  { id: 'demarcheur', label: 'Démarcheur', icon: Users },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(WEST_AFRICA_COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [userType, setUserType] = useState('particulier');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }

    if (!isLogin && !acceptedTerms) {
      toast({ title: 'Erreur', description: 'Veuillez accepter les conditions d\'utilisation', variant: 'destructive' });
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
        toast({ title: 'Bon retour!', description: 'Connexion réussie' });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              full_name: `${formData.firstName} ${formData.lastName}`,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: `${selectedCountry.phoneCode}${formData.phone}`,
              country: selectedCountry.code,
              user_type: userType,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({ title: 'Bienvenue sur LaZone!', description: 'Votre compte a été créé avec succès' });
        navigate('/');
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

  return (
    <div className="min-h-screen bg-lazone-dark flex flex-col relative overflow-hidden">
      {/* Background Image for Login */}
      {isLogin && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200)',
          }}
        />
      )}
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-8 pb-4 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-lazone-accent flex items-center justify-center">
            <span className="text-lazone-dark font-bold text-lg">L</span>
          </div>
          <span className="font-display text-2xl font-bold text-lazone-accent">LaZone</span>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-8 relative z-10">
        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isLogin ? 'bg-lazone-card/95 backdrop-blur-md' : 'bg-lazone-dark'} rounded-3xl p-6 max-w-md mx-auto w-full`}
        >
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-lazone-text">
              {isLogin ? 'Bon retour!' : 'Créer un compte'}
            </h1>
            <p className="text-lazone-muted text-sm mt-1">
              {isLogin ? 'Connectez-vous pour accéder à vos favoris' : 'Inscrivez-vous pour commencer'}
            </p>
          </div>

          {/* Signup-specific fields */}
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-4"
              >
                {/* Avatar Upload */}
                <div className="flex justify-center mb-6">
                  <button className="w-20 h-20 rounded-full bg-lazone-input border-2 border-dashed border-lazone-border flex items-center justify-center hover:border-lazone-accent transition-colors">
                    <Camera className="w-8 h-8 text-lazone-muted" />
                  </button>
                </div>

                {/* User Type Tabs */}
                <div className="flex gap-2 p-1 bg-lazone-input rounded-xl mb-4">
                  {USER_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setUserType(type.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        userType === type.id
                          ? 'bg-lazone-card text-lazone-text shadow-sm'
                          : 'text-lazone-muted hover:text-lazone-text'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-lazone-input rounded-xl p-1">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <User className="w-5 h-5 text-lazone-muted" />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="bg-lazone-input rounded-xl p-1">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <User className="w-5 h-5 text-lazone-muted" />
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full bg-lazone-input rounded-xl p-1"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Globe className="w-5 h-5 text-lazone-muted" />
                      <span className="flex-1 text-left text-lazone-text">
                        {selectedCountry.flag} {selectedCountry.name}
                      </span>
                      <ArrowRight className={`w-4 h-4 text-lazone-muted transition-transform ${showCountryDropdown ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showCountryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-lazone-card rounded-xl shadow-xl border border-lazone-border max-h-48 overflow-y-auto"
                      >
                        {WEST_AFRICA_COUNTRIES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-lazone-input transition-colors text-left"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-lazone-text">{country.name}</span>
                            <span className="text-lazone-muted text-sm ml-auto">{country.phoneCode}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone Number */}
                <div className="bg-lazone-input rounded-xl p-1">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-lazone-muted font-medium">{selectedCountry.phoneCode}</span>
                    <Phone className="w-4 h-4 text-lazone-muted" />
                    <input
                      type="tel"
                      placeholder="Numéro mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="bg-lazone-input rounded-xl p-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <Mail className="w-5 h-5 text-lazone-muted" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="bg-lazone-input rounded-xl p-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <Lock className="w-5 h-5 text-lazone-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe (min. 6 caractères)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-lazone-muted hover:text-lazone-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="bg-lazone-input rounded-xl p-1">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Lock className="w-5 h-5 text-lazone-muted" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="flex-1 bg-transparent outline-none text-lazone-text placeholder:text-lazone-muted"
                        required={!isLogin}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-lazone-muted hover:text-lazone-text transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-lazone-accent text-sm hover:underline">
                  Mot de passe oublié?
                </button>
              </div>
            )}

            {/* Terms Checkbox (Signup only) */}
            {!isLogin && (
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    acceptedTerms ? 'bg-lazone-accent border-lazone-accent' : 'border-lazone-border'
                  }`}
                >
                  {acceptedTerms && <Check className="w-3 h-3 text-lazone-dark" />}
                </button>
                <span className="text-sm text-lazone-muted">
                  J'accepte la{' '}
                  <a href="#" className="text-lazone-accent hover:underline">politique de confidentialité</a>
                  {' '}et les{' '}
                  <a href="#" className="text-lazone-accent hover:underline">conditions d'utilisation</a>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-lazone-accent to-lazone-accent-light py-4 rounded-xl text-lazone-dark font-display font-semibold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-lazone-dark/30 border-t-lazone-dark rounded-full"
                  />
                  Chargement...
                </span>
              ) : (
                <>
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Phone Login Option (Login only) */}
            {isLogin && (
              <>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-lazone-border" />
                  <span className="text-lazone-muted text-sm">ou</span>
                  <div className="flex-1 h-px bg-lazone-border" />
                </div>
                
                <button
                  type="button"
                  className="w-full bg-lazone-input py-4 rounded-xl text-lazone-text font-medium flex items-center justify-center gap-3 hover:bg-lazone-card transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Se connecter avec le téléphone
                </button>
              </>
            )}
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-lazone-muted"
            >
              {isLogin ? (
                <>
                  Pas encore de compte?{' '}
                  <span className="text-lazone-accent font-semibold border border-lazone-accent px-2 py-0.5 rounded">S'inscrire</span>
                </>
              ) : (
                <>
                  Déjà un compte?{' '}
                  <span className="text-lazone-accent font-semibold">Se connecter</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
