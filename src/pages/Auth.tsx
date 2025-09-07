import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Lock, User, Building2, Phone, RotateCcw, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/contexts/LocationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getAllCountries, getAfricanCountries, isAfricanCountry } from '@/data/worldwideCountries';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecureForm } from '@/components/security/SecureForm';
import { SecureInput } from '@/components/security/SecureInput';
import { SecurityMonitor } from '@/utils/security';


const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    selectedCountry, 
    selectedCity, 
    setSelectedCountry,
    setSelectedCity,
    isLocationDetected,
    detectedCountry,
    detectedCity,
    requestLocation
  } = useLocation();
  const { countries } = useGeolocation();
  
  const mode = searchParams.get('mode') || 'login';
  const nextUrl = searchParams.get('next') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'particulier' | 'agence'>('particulier');
  
  // SMS Login states
  const [loginMethod, setLoginMethod] = useState<'email' | 'sms'>('email');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsCountry, setSmsCountry] = useState<string | null>(selectedCountry);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState(mode);
  
  // Champs particulier
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [isCanvasser, setIsCanvasser] = useState(false);
  
  // Champs agence
  const [agencyName, setAgencyName] = useState('');
  const [responsibleFirstName, setResponsibleFirstName] = useState('');
  const [responsibleLastName, setResponsibleLastName] = useState('');
  const [agencyPhone, setAgencyPhone] = useState('');
  const [responsibleMobile, setResponsibleMobile] = useState('');

  // Auto-detect location on component mount if not already detected
  useEffect(() => {
    if (!selectedCountry && !isLocationDetected) {
      handleAutoDetectLocation();
    }
  }, []);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      await requestLocation();
    } catch (error) {
      // Silently handle errors - LocationContext already shows error toasts
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleManualDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      await requestLocation();
      toast({
        title: 'Position mise à jour',
        description: 'Votre localisation a été mise à jour avec succès.'
      });
    } catch (error) {
      // LocationContext already handles error toasts
    } finally {
      setIsDetectingLocation(false);
    }
  };
  
  // Helper pour obtenir les infos du pays SMS
  const getSmsCountryInfo = () => {
    const country = countries.find(c => c.name === smsCountry);
    return {
      flag: country?.flag || '',
      phoneCode: country?.phoneCode || ''
    };
  };

  // Helper pour obtenir les infos du pays d'inscription
  const getCountryInfo = () => {
    if (!selectedCountry) return { flag: '', phoneCode: '' };
    const country = countries.find(c => c.name === selectedCountry);
    return {
      flag: country?.flag || '',
      phoneCode: country?.phoneCode || ''
    };
  };

  const { flag: smsFlag, phoneCode: smsPhoneCode } = getSmsCountryInfo();
  const { flag, phoneCode } = getCountryInfo();

  const handleSubmit = async (data: Record<string, string>) => {
    const isSignUp = activeTab === 'register';
    
    // Log authentication attempt for security monitoring
    SecurityMonitor.logAuthEvent(isSignUp ? 'signup' : 'login_success');
    
    console.log('Form submission started', { isSignUp, userType });
    
    // Validation spéciale pour les agences - elles doivent être basées en Afrique
    if (isSignUp && userType === 'agence') {
      const countryData = countries.find(c => c.name === selectedCountry);
      if (!countryData?.isAfrican) {
        toast({
          title: 'Localisation invalide',
          description: 'Votre agence doit être basée en Afrique pour créer un compte.',
          variant: 'destructive',
        });
        return; // Empêcher la soumission du formulaire
      }
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Préparer les métadonnées utilisateur
        const userMetadata = userType === 'particulier' 
          ? {
              user_type: userType,
              first_name: firstName,
              last_name: lastName,
              country: selectedCountry,
              city: selectedCity,
              neighborhood,
              phone,
              is_canvasser: isCanvasser
            }
          : {
              user_type: userType,
              agency_name: agencyName,
              responsible_first_name: responsibleFirstName,
              responsible_last_name: responsibleLastName,
              country: selectedCountry,
              city: selectedCity,
              neighborhood,
              agency_phone: agencyPhone,
              responsible_mobile: responsibleMobile
            };

        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email || email,
          password: data.password || password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: userMetadata
          }
        });

        if (signUpError) throw signUpError;

        toast({
          title: 'Compte créé avec succès',
          description: 'Un email de confirmation vous a été envoyé.',
        });
        
        // Rediriger vers la page principale après inscription réussie
        setTimeout(() => {
          navigate(nextUrl);
        }, 2000);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email || email,
          password: data.password || password
        });

        if (signInError) throw signInError;

        // Log successful login
        SecurityMonitor.logAuthEvent('login_success');

        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue sur LaZone !',
        });

        // Attendre un peu avant la redirection pour laisser le contexte se mettre à jour
        setTimeout(() => {
          navigate(nextUrl);
        }, 500);
      }
    } catch (error: any) {
      // Log failed authentication attempt
      SecurityMonitor.logAuthEvent('login_failure', undefined, {
        error: error.message,
        userAgent: navigator.userAgent
      });
      
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

    const handleSendSMS = async () => {
      if (!smsPhone.trim()) {
        toast({
          title: 'Erreur',
          description: 'Veuillez saisir votre numéro de téléphone.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        // Send SMS via secure edge function
        const { data, error } = await supabase.functions.invoke('send-sms', {
          body: {
            to: `${smsPhoneCode}${smsPhone.replace(/\s/g, '')}`, // Remove spaces
            type: 'otp'
          }
        });

        if (error) throw error;

        setOtpSent(true);
        toast({
          title: 'Code envoyé',
          description: 'Un code à 6 chiffres vous a été envoyé par SMS.',
        });
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible d\'envoyer le SMS. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

  const handleResendSMS = async () => {
    setIsResending(true);
    await handleSendSMS();
    setIsResending(false);
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir le code à 6 chiffres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use secure server-side OTP verification
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: `${smsPhoneCode}${smsPhone.replace(/\s/g, '')}`,
          code: otpCode
        }
      });

      if (error) throw error;

      if (data?.success && data?.access_token) {
        // Set the session with the tokens returned by verify-otp
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Failed to establish session');
        }

        // Log successful SMS login
        SecurityMonitor.logAuthEvent('login_success', data.user?.id, {
          loginMethod: 'sms',
          phone: smsPhone
        });

        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue sur LaZone !',
        });
        
        // Wait a bit for session to be established
        setTimeout(() => {
          navigate(nextUrl);
        }, 500);
      } else {
        throw new Error(data?.error || 'Code de vérification incorrect');
      }
    } catch (error: any) {
      // Log failed SMS login attempt
      SecurityMonitor.logAuthEvent('login_failure', undefined, {
        loginMethod: 'sms',
        phone: smsPhone,
        error: error.message
      });
      
      toast({
        title: 'Code incorrect',
        description: error.message || 'Le code saisi est incorrect. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre adresse email.',
        variant: 'destructive',
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'email de réinitialisation.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Connexion</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Bienvenue sur LaZone</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <div className="space-y-4">
                    {/* Login method selector */}
                    <div className="flex space-x-2 p-1 bg-muted rounded-md">
                      <Button
                        type="button"
                        variant={loginMethod === 'email' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setLoginMethod('email')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={loginMethod === 'sms' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setLoginMethod('sms')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                    </div>

                    {loginMethod === 'email' ? (
                      <SecureForm 
                        onSubmit={handleSubmit} 
                        rateLimitKey="auth_login"
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <SecureInput
                              id="login-email"
                              name="email"
                              type="email"
                              placeholder="votre@email.com"
                              validationType="email"
                              showValidation={true}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <SecureInput
                              id="login-password"
                              name="password"
                              type="password"
                              placeholder="Votre mot de passe"
                              validationType="text"
                              showValidation={true}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isLoading}
                        >
                          {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={handleResetPassword}
                          disabled={isResettingPassword}
                          className="w-full text-muted-foreground"
                        >
                          {isResettingPassword ? 'Envoi...' : 'Mot de passe oublié ?'}
                        </Button>
                      </SecureForm>
                    ) : (
                      <div className="space-y-4">
                        {!otpSent ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="sms-phone">Téléphone</Label>
                              <div className="space-y-2">
                                <div className="space-y-2">
                                  <Label>Pays</Label>
                                  <Select value={smsCountry || ''} onValueChange={setSmsCountry}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un pays" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {countries.map((country) => (
                                        <SelectItem key={country.name} value={country.name}>
                                          {country.flag} {country.name} ({country.phoneCode})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    id="sms-phone"
                                    type="tel"
                                    placeholder="Numéro de téléphone"
                                    value={smsPhone}
                                    onChange={(e) => setSmsPhone(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              onClick={handleSendSMS}
                              disabled={isLoading || !smsPhone.trim()}
                              className="w-full"
                            >
                              {isLoading ? 'Envoi...' : 'Envoyer le code'}
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">
                                Code envoyé au {smsFlag} {smsPhoneCode} {smsPhone}
                              </p>
                              <Label htmlFor="otp-code">Code de vérification</Label>
                            </div>
                            
                            <div className="flex justify-center">
                              <InputOTP
                                value={otpCode}
                                onChange={setOtpCode}
                                maxLength={6}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                            
                            <Button
                              onClick={handleVerifyOTP}
                              disabled={isLoading || otpCode.length !== 6}
                              className="w-full"
                            >
                              {isLoading ? 'Vérification...' : 'Vérifier le code'}
                            </Button>
                            
                            <div className="flex justify-between text-sm">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={handleResendSMS}
                                disabled={isResending}
                                className="p-0"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {isResending ? 'Renvoi...' : 'Renvoyer'}
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                  setOtpSent(false);
                                  setOtpCode('');
                                }}
                                className="p-0"
                              >
                                Modifier le numéro
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <div className="space-y-4">
                    {/* Type d'utilisateur */}
                    <div className="space-y-3">
                      <Label>Type de compte</Label>
                      <RadioGroup 
                        value={userType} 
                        onValueChange={(value: 'particulier' | 'agence') => setUserType(value)}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="particulier" id="particulier" />
                          <Label htmlFor="particulier" className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Particulier
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="agence" id="agence" />
                          <Label htmlFor="agence" className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            Agence
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <SecureForm 
                      onSubmit={handleSubmit} 
                      rateLimitKey="auth_register"
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <SecureInput
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="votre@email.com"
                            validationType="email"
                            showValidation={true}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <SecureInput
                            id="register-password"
                            name="password"
                            type="password"
                            placeholder="Minimum 8 caractères"
                            validationType="text"
                            showValidation={true}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {userType === 'particulier' ? (
                        <div className="space-y-4">
                          {/* Noms */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">Prénom</Label>
                              <SecureInput
                                id="firstName"
                                type="text"
                                placeholder="Prénom"
                                validationType="name"
                                showValidation={true}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Nom</Label>
                              <SecureInput
                                id="lastName"
                                type="text"
                                placeholder="Nom de famille"
                                validationType="name"
                                showValidation={true}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          {/* Géolocalisation intelligente */}
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Localisation</span>
                                {isLocationDetected && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    ✓ Détectée
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleManualDetectLocation}
                                disabled={isDetectingLocation}
                                className="flex items-center gap-1"
                              >
                                {isDetectingLocation ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Détection...
                                  </>
                                ) : (
                                  <>
                                    <Navigation className="w-3 h-3" />
                                    Détecter
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Sélection du pays et de la ville */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="country">Pays</Label>
                                <Select
                                  value={selectedCountry || ""}
                                  onValueChange={setSelectedCountry}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un pays" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border">
                                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium border-b">
                                      Pays africains (recommandés)
                                    </div>
                                    {getAfricanCountries().map((country) => (
                                      <SelectItem key={country.code} value={country.name}>
                                        <div className="flex items-center gap-2">
                                          <span>{country.flag}</span>
                                          <span>{country.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium border-b border-t">
                                      Autres pays
                                    </div>
                                    {getAllCountries().filter(c => !c.isAfrican).map((country) => (
                                      <SelectItem key={country.code} value={country.name}>
                                        <div className="flex items-center gap-2">
                                          <span>{country.flag}</span>
                                          <span>{country.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                {selectedCountry ? (
                                  <Select
                                    value={selectedCity || ""}
                                    onValueChange={setSelectedCity}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une ville" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border border-border">
                                      {getAllCountries()
                                        .find(c => c.name === selectedCountry)
                                        ?.cities.map((city) => (
                                          <SelectItem key={city} value={city}>
                                            {city}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id="city"
                                    type="text"
                                    value={selectedCity || ''}
                                    placeholder="Sélectionnez d'abord un pays"
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled
                                    className="bg-muted"
                                  />
                                )}
                              </div>
                            </div>

                            {!isAfricanCountry(selectedCountry || '') && selectedCountry && (
                              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                                ⚠️ Note : Seuls les utilisateurs basés en Afrique peuvent créer des annonces.
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="neighborhood">Quartier</Label>
                            <Input
                              id="neighborhood"
                              type="text"
                              placeholder="Votre quartier"
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              required
                            />
                          </div>

                          {/* Téléphone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="flex gap-2">
                              <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-sm min-w-20">
                                {flag} {phoneCode}
                              </div>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="Numéro de téléphone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {/* Option démarcheur */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="canvasser"
                              checked={isCanvasser}
                              onCheckedChange={(checked) => setIsCanvasser(checked === true)}
                            />
                            <Label htmlFor="canvasser" className="text-sm">
                              Je souhaite devenir démarcheur pour gagner des commissions
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Nom de l'agence */}
                          <div className="space-y-2">
                            <Label htmlFor="agencyName">Nom de l'agence</Label>
                            <SecureInput
                              id="agencyName"
                              type="text"
                              placeholder="Nom de votre agence"
                              validationType="name"
                              showValidation={true}
                              value={agencyName}
                              onChange={(e) => setAgencyName(e.target.value)}
                              required
                            />
                          </div>

                          {/* Responsable */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="responsibleFirstName">Prénom du responsable</Label>
                              <SecureInput
                                id="responsibleFirstName"
                                type="text"
                                placeholder="Prénom"
                                validationType="name"
                                showValidation={true}
                                value={responsibleFirstName}
                                onChange={(e) => setResponsibleFirstName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="responsibleLastName">Nom du responsable</Label>
                              <SecureInput
                                id="responsibleLastName"
                                type="text"
                                placeholder="Nom"
                                validationType="name"
                                showValidation={true}
                                value={responsibleLastName}
                                onChange={(e) => setResponsibleLastName(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          {/* Géolocalisation intelligente pour agence */}
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Localisation de l'agence</span>
                                {isLocationDetected && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    ✓ Détectée
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleManualDetectLocation}
                                disabled={isDetectingLocation}
                                className="flex items-center gap-1"
                              >
                                {isDetectingLocation ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Détection...
                                  </>
                                ) : (
                                  <>
                                    <Navigation className="w-3 h-3" />
                                    Détecter
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Sélection du pays et de la ville pour agence */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="agencyCountry">Pays de l'agence</Label>
                                <Select
                                  value={selectedCountry || ""}
                                  onValueChange={setSelectedCountry}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un pays" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border">
                                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium border-b">
                                      Pays africains (recommandés)
                                    </div>
                                    {getAfricanCountries().map((country) => (
                                      <SelectItem key={country.code} value={country.name}>
                                        <div className="flex items-center gap-2">
                                          <span>{country.flag}</span>
                                          <span>{country.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium border-b border-t">
                                      Autres pays
                                    </div>
                                    {getAllCountries().filter(c => !c.isAfrican).map((country) => (
                                      <SelectItem key={country.code} value={country.name}>
                                        <div className="flex items-center gap-2">
                                          <span>{country.flag}</span>
                                          <span>{country.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="agencyCity">Ville de l'agence</Label>
                                {selectedCountry ? (
                                  <Select
                                    value={selectedCity || ""}
                                    onValueChange={setSelectedCity}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une ville" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border border-border">
                                      {getAllCountries()
                                        .find(c => c.name === selectedCountry)
                                        ?.cities.map((city) => (
                                          <SelectItem key={city} value={city}>
                                            {city}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id="agencyCity"
                                    type="text"
                                    value={selectedCity || ''}
                                    placeholder="Sélectionnez d'abord un pays"
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled
                                    className="bg-muted"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Message spécial pour les agences non-africaines */}
                            {!isAfricanCountry(selectedCountry || '') && selectedCountry && (
                              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                ❌ Important : Votre agence doit être basée en Afrique pour pouvoir créer un compte et publier des annonces.
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agencyNeighborhood">Quartier de l'agence</Label>
                            <Input
                              id="agencyNeighborhood"
                              type="text"
                              placeholder="Quartier de l'agence"
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              required
                            />
                          </div>

                          {/* Téléphones agence */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="agencyPhone">Téléphone de l'agence</Label>
                              <div className="flex gap-2">
                                <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-sm min-w-20">
                                  {flag} {phoneCode}
                                </div>
                                <Input
                                  id="agencyPhone"
                                  type="tel"
                                  placeholder="Téléphone de l'agence"
                                  value={agencyPhone}
                                  onChange={(e) => setAgencyPhone(e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="responsibleMobile">Mobile du responsable</Label>
                              <div className="flex gap-2">
                                <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-sm min-w-20">
                                  {flag} {phoneCode}
                                </div>
                                <Input
                                  id="responsibleMobile"
                                  type="tel"
                                  placeholder="Mobile du responsable"
                                  value={responsibleMobile}
                                  onChange={(e) => setResponsibleMobile(e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                      </Button>
                    </SecureForm>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;