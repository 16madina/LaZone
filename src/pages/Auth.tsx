import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Lock, User, Building2, Phone, RotateCcw, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/contexts/LocationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import CountryPhoneSelector from '@/components/CountryPhoneSelector';
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
    requestLocation, 
    isLocationDetected,
    detectedCountry,
    detectedCity
  } = useLocation();
  const { countries } = useGeolocation();
  
  const mode = searchParams.get('mode') || 'login';
  const nextUrl = searchParams.get('next') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'particulier' | 'agence'>('particulier');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
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

  // Auto-detect location on first load if no country is selected
  useEffect(() => {
    if (!selectedCountry && !isLocationDetected) {
      handleLocationDetection();
    }
  }, []);

  const handleLocationDetection = async () => {
    setIsDetectingLocation(true);
    try {
      await requestLocation();
      // Toast is already shown in LocationContext with correct values
    } catch (error) {
      // Error is already handled in the context
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
                            <Input
                              id="login-password"
                              name="password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="link" 
                          className="w-full"
                          onClick={handleResetPassword}
                          disabled={isResettingPassword}
                        >
                          {isResettingPassword ? 'Envoi en cours...' : 'Mot de passe oublié ?'}
                        </Button>
                      </SecureForm>
                    ) : (
                      <div className="space-y-4">
                        {!otpSent ? (
                          <>
                            <CountryPhoneSelector
                              countries={countries}
                              selectedCountry={smsCountry}
                              phoneNumber={smsPhone}
                              onCountryChange={setSmsCountry}
                              onPhoneChange={setSmsPhone}
                              placeholder="XX XX XX XX"
                              label="Numéro de téléphone"
                            />
                            
                            <Button
                              type="button"
                              onClick={handleSendSMS}
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Envoi...' : 'Recevoir le code par SMS'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="otp-code">Code de vérification</Label>
                              <p className="text-sm text-muted-foreground">
                                Saisissez le code à 6 chiffres envoyé au {smsPhoneCode}{smsPhone}
                              </p>
                              <div className="flex justify-center">
                                <InputOTP
                                  maxLength={6}
                                  value={otpCode}
                                  onChange={(value) => setOtpCode(value)}
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
                            </div>
                            
                            <Button
                              type="button"
                              onClick={handleVerifyOTP}
                              className="w-full"
                              disabled={isLoading || otpCode.length !== 6}
                            >
                              {isLoading ? 'Vérification...' : 'Vérifier le code'}
                            </Button>
                            
                            <div className="flex items-center justify-between">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setOtpSent(false);
                                  setOtpCode('');
                                }}
                              >
                                Changer de numéro
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResendSMS}
                                disabled={isResending}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {isResending ? 'Envoi...' : 'Renvoyer'}
                              </Button>
                            </div>
                          </>
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
                        onValueChange={(value) => setUserType(value as 'particulier' | 'agence')}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <RadioGroupItem value="particulier" id="particulier" />
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <Label htmlFor="particulier" className="text-sm">Particulier</Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-md">
                          <RadioGroupItem value="agence" id="agence" />
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <Label htmlFor="agence" className="text-sm">Agence</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <SecureForm 
                      onSubmit={(data) => {
                        setActiveTab('register');
                        return handleSubmit(data);
                      }} 
                      rateLimitKey="auth_register"
                      className="space-y-4"
                    >
                      {userType === 'particulier' ? (
                        <>
                          {/* Formulaire Particulier */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">Nom</Label>
                            <SecureInput
                              id="firstName"
                              name="first_name"
                              type="text"
                              placeholder="Nom"
                              validationType="name"
                              showValidation={true}
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Prénom</Label>
                            <SecureInput
                              id="lastName"
                              name="last_name"
                              type="text"
                              placeholder="Prénom"
                              validationType="name"
                              showValidation={true}
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="country">Pays</Label>
                              <div className="relative">
                                <Input
                                  id="country"
                                  type="text"
                                  value={flag ? `${flag} ${selectedCountry}` : selectedCountry || ''}
                                  placeholder={selectedCountry ? "Pays détecté" : "Aucun pays détecté"}
                                  readOnly
                                  className="bg-muted pl-3"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">Ville</Label>
                              <Input
                                id="city"
                                type="text"
                                value={selectedCity || ''}
                                placeholder={selectedCity ? "Ville détectée" : "Aucune ville détectée"}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>

                          {!selectedCountry && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="text-sm text-amber-700">Position non détectée</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleLocationDetection}
                                disabled={isDetectingLocation}
                                className="ml-auto"
                              >
                                <Navigation className={`w-3 h-3 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                                {isDetectingLocation ? 'Détection...' : 'Détecter'}
                              </Button>
                            </div>
                          )}

                          {selectedCountry && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                Position : {selectedCity}, {selectedCountry}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleLocationDetection}
                                disabled={isDetectingLocation}
                                className="ml-auto"
                              >
                                <RotateCcw className={`w-3 h-3 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                                Renouveler
                              </Button>
                            </div>
                          )}

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

                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm z-10">
                                {phoneCode}
                              </span>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder={`${phoneCode} XX XX XX XX`}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={phoneCode ? 'pl-16' : 'pl-3'}
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 border rounded-md">
                            <Checkbox
                              id="canvasser"
                              checked={isCanvasser}
                              onCheckedChange={(checked) => setIsCanvasser(checked === true)}
                            />
                            <Label htmlFor="canvasser" className="text-sm cursor-pointer">
                              Êtes-vous démarcheur ?
                            </Label>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Formulaire Agence */}
                          <div className="space-y-2">
                            <Label htmlFor="agencyName">Nom de l'agence</Label>
                            <Input
                              id="agencyName"
                              type="text"
                              placeholder="Nom de votre agence"
                              value={agencyName}
                              onChange={(e) => setAgencyName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="text-sm font-medium text-muted-foreground mb-2">Responsable</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="responsibleFirstName">Nom</Label>
                              <Input
                                id="responsibleFirstName"
                                type="text"
                                placeholder="Nom du responsable (optionnel)"
                                value={responsibleFirstName}
                                onChange={(e) => setResponsibleFirstName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="responsibleLastName">Prénom</Label>
                              <Input
                                id="responsibleLastName"
                                type="text"
                                placeholder="Prénom du responsable (optionnel)"
                                value={responsibleLastName}
                                onChange={(e) => setResponsibleLastName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="agencyCountry">Pays</Label>
                              <div className="relative">
                                <Input
                                  id="agencyCountry"
                                  type="text"
                                  value={flag ? `${flag} ${selectedCountry}` : selectedCountry || ''}
                                  placeholder={selectedCountry ? "Pays détecté" : "Aucun pays détecté"}
                                  readOnly
                                  className="bg-muted pl-3"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="agencyCity">Ville</Label>
                              <Input
                                id="agencyCity"
                                type="text"
                                value={selectedCity || ''}
                                placeholder={selectedCity ? "Ville détectée" : "Aucune ville détectée"}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>

                          {!selectedCountry && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="text-sm text-amber-700">Position non détectée</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleLocationDetection}
                                disabled={isDetectingLocation}
                                className="ml-auto"
                              >
                                <Navigation className={`w-3 h-3 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                                {isDetectingLocation ? 'Détection...' : 'Détecter'}
                              </Button>
                            </div>
                          )}

                          {selectedCountry && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                Position : {selectedCity}, {selectedCountry}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleLocationDetection}
                                disabled={isDetectingLocation}
                                className="ml-auto"
                              >
                                <RotateCcw className={`w-3 h-3 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                                Renouveler
                              </Button>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="agencyNeighborhood">Quartier</Label>
                            <Input
                              id="agencyNeighborhood"
                              type="text"
                              placeholder="Quartier de l'agence (optionnel)"
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agencyPhone">Téléphone de l'agence</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm z-10">
                                {phoneCode}
                              </span>
                              <Input
                                id="agencyPhone"
                                type="tel"
                                placeholder={`${phoneCode} XX XX XX XX (optionnel)`}
                                value={agencyPhone}
                                onChange={(e) => setAgencyPhone(e.target.value)}
                                className={phoneCode ? 'pl-16' : 'pl-3'}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="responsibleMobile">Téléphone cellulaire du responsable *</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm z-10">
                                {phoneCode}
                              </span>
                              <Input
                                id="responsibleMobile"
                                type="tel"
                                placeholder={`${phoneCode} XX XX XX XX`}
                                value={responsibleMobile}
                                onChange={(e) => setResponsibleMobile(e.target.value)}
                                className={phoneCode ? 'pl-16' : 'pl-3'}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Email commun */}
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
                          <Input
                            id="register-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Création...' : 'Créer un compte'}
                      </Button>
                    </SecureForm>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;