import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, User, Building2, Loader2, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/contexts/LocationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  } = useLocation();
  const { countries } = useGeolocation();
  
  const nextUrl = searchParams.get('next') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'particulier' | 'agence'>('particulier');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPhone, setCurrentPhone] = useState('');
  
  // Champs communs
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Champs particulier
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isCanvasser, setIsCanvasser] = useState(false);
  
  // Champs agence
  const [agencyName, setAgencyName] = useState('');
  const [responsibleFirstName, setResponsibleFirstName] = useState('');
  const [responsibleLastName, setResponsibleLastName] = useState('');
  const [agencyPhone, setAgencyPhone] = useState('');

  // Helper pour obtenir les infos du pays
  const getCountryInfo = () => {
    if (!selectedCountry) return { flag: '', phoneCode: '' };
    const country = countries.find(c => c.name === selectedCountry);
    return {
      flag: country?.flag || '',
      phoneCode: country?.phoneCode || ''
    };
  };

  const { flag, phoneCode } = getCountryInfo();

  // Fonction pour connexion existante (juste téléphone + SMS)
  const handleLogin = async () => {
    if (!selectedCountry || !phone.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre numéro de téléphone.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      setCurrentPhone(fullPhoneNumber);
      
      // Vérifier d'abord si l'utilisateur existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone', fullPhoneNumber)
        .maybeSingle();
      
      if (!existingProfile) {
        toast({
          title: 'Compte introuvable',
          description: 'Aucun compte n\'est associé à ce numéro. Veuillez vous inscrire d\'abord.',
          variant: 'destructive',
        });
        return;
      }
      
      // Envoyer le SMS de connexion
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: fullPhoneNumber,
          type: 'otp'
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: 'Code envoyé !',
        description: 'Un code de connexion vous a été envoyé par SMS.',
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

  // Fonction pour inscription complète
  const handleSignup = async () => {
    // Validation des champs obligatoires
    if (!selectedCountry || !phone.trim() || !email.trim()) {
      toast({
        title: 'Champs obligatoires',
        description: 'Veuillez remplir le téléphone, l\'email et sélectionner votre pays.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'particulier' && !firstName.trim()) {
      toast({
        title: 'Prénom requis',
        description: 'Veuillez saisir votre prénom.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'agence' && !agencyName.trim()) {
      toast({
        title: 'Nom d\'agence requis',
        description: 'Veuillez saisir le nom de votre agence.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      setCurrentPhone(fullPhoneNumber);
      
      // Vérifier si l'utilisateur existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone', fullPhoneNumber)
        .maybeSingle();
      
      if (existingProfile) {
        toast({
          title: 'Compte existant',
          description: 'Un compte existe déjà avec ce numéro. Utilisez "Se connecter" à la place.',
          variant: 'destructive',
        });
        return;
      }
      
      // Envoyer le SMS d'inscription
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: fullPhoneNumber,
          type: 'otp'
        }
      });

      if (error) throw error;

      // Stocker les données d'inscription temporairement
      const signupData = {
        phone: fullPhoneNumber,
        email: email.trim(),
        country: selectedCountry,
        city: selectedCity || '',
        neighborhood: neighborhood.trim(),
        user_type: userType,
        ...(userType === 'particulier' ? {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          is_canvasser: isCanvasser
        } : {
          agency_name: agencyName.trim(),
          responsible_first_name: responsibleFirstName.trim(),
          responsible_last_name: responsibleLastName.trim(),
          agency_phone: agencyPhone.trim(),
          responsible_mobile: fullPhoneNumber
        })
      };

      localStorage.setItem('pendingSignupData', JSON.stringify(signupData));

      setOtpSent(true);
      toast({
        title: 'Code envoyé !',
        description: 'Un code vous a été envoyé par SMS pour créer votre compte.',
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
      // Vérifier le code OTP
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: currentPhone,
          code: otpCode,
          isSignup: authMode === 'signup'
        }
      });

      if (error) throw error;

      if (data?.success && data?.access_token) {
        // Établir la session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Failed to establish session');
        }

        // Si c'est une inscription, mettre à jour le profil avec toutes les infos
        if (authMode === 'signup') {
          const signupData = localStorage.getItem('pendingSignupData');
          if (signupData && data.user?.id) {
            try {
              const userData = JSON.parse(signupData);
              
              // Mettre à jour le profil avec les informations complètes
              const { error: updateError } = await supabase
                .from('profiles')
                .update(userData)
                .eq('user_id', data.user.id);

              if (updateError) {
                console.error('Profile update error:', updateError);
              }
              
              // Nettoyer les données temporaires
              localStorage.removeItem('pendingSignupData');
            } catch (parseError) {
              console.error('Failed to parse signup data:', parseError);
            }
          }
        }

        // Log successful auth
        SecurityMonitor.logAuthEvent(authMode === 'signup' ? 'signup' : 'login_success', data.user?.id, {
          authMethod: 'sms',
          phone: currentPhone,
          userType: authMode === 'signup' ? userType : undefined
        });

        toast({
          title: authMode === 'signup' ? 'Compte créé ! 🎉' : 'Connexion réussie ! 👋',
          description: authMode === 'signup' 
            ? 'Votre compte LaZone a été créé et activé avec succès.' 
            : 'Bienvenue de retour sur LaZone !',
        });
        
        // Attendre un peu pour que la session s'établisse
        setTimeout(() => {
          navigate(nextUrl);
        }, 1000);
      } else {
        throw new Error(data?.error || 'Code de vérification incorrect');
      }
    } catch (error: any) {
      SecurityMonitor.logAuthEvent('login_failure', undefined, {
        authMethod: 'sms',
        phone: currentPhone,
        error: error.message,
        authMode
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

  const handleResendSMS = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: currentPhone,
          type: 'otp'
        }
      });

      if (error) throw error;

      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code vous a été envoyé par SMS.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de renvoyer le SMS.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtpCode('');
    setCurrentPhone('');
    setPhone('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setNeighborhood('');
    setAgencyName('');
    setResponsibleFirstName('');
    setResponsibleLastName('');
    setAgencyPhone('');
    setIsCanvasser(false);
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
          <h1 className="text-xl font-bold">LaZone</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Accès à votre compte</CardTitle>
              <CardDescription>
                Connexion et inscription sécurisées par SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpSent ? (
                <Tabs value={authMode} onValueChange={(value) => { setAuthMode(value as 'login' | 'signup'); resetForm(); }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Se connecter</TabsTrigger>
                    <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Phone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium text-blue-800 dark:text-blue-200">Connexion rapide</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Connectez-vous avec votre numéro de téléphone
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pays</Label>
                        <Select value={selectedCountry || ''} onValueChange={setSelectedCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre pays">
                              {selectedCountry && (
                                <span className="flex items-center">
                                  <span className="mr-2">{flag}</span>
                                  <span>{selectedCountry}</span>
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.name} value={country.name}>
                                <span className="flex items-center">
                                  <span className="mr-2">{country.flag}</span>
                                  <span>{country.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-phone">Numéro de téléphone</Label>
                        <div className="flex space-x-2">
                          <div className="w-20 flex items-center justify-center border rounded-md bg-muted text-sm">
                            {phoneCode}
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="login-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-10"
                              placeholder="123456789"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleLogin}
                        className="w-full" 
                        disabled={isLoading || !selectedCountry || !phone.trim()}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Envoi du code...
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Envoyer le code de connexion
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <User className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium text-green-800 dark:text-green-200">Créer un compte</h3>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Inscription complète avec activation par SMS
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Type de compte */}
                      <div className="space-y-3">
                        <Label>Type de compte</Label>
                        <RadioGroup 
                          value={userType} 
                          onValueChange={(value) => setUserType(value as 'particulier' | 'agence')}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="particulier" id="particulier" />
                            <Label htmlFor="particulier">Particulier</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="agence" id="agence" />
                            <Label htmlFor="agence">Agence</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Email obligatoire */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            placeholder="votre@email.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Champs selon le type */}
                      {userType === 'particulier' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">Prénom *</Label>
                              <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Votre prénom"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Nom</Label>
                              <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Votre nom"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isCanvasser"
                              checked={isCanvasser}
                              onCheckedChange={(checked) => setIsCanvasser(checked === true)}
                            />
                            <Label htmlFor="isCanvasser" className="text-sm">
                              Je suis un démarcheur immobilier
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="agencyName">Nom de l'agence *</Label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="agencyName"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                className="pl-10"
                                placeholder="Nom de votre agence"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="responsibleFirstName">Prénom du responsable</Label>
                              <Input
                                id="responsibleFirstName"
                                value={responsibleFirstName}
                                onChange={(e) => setResponsibleFirstName(e.target.value)}
                                placeholder="Prénom"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="responsibleLastName">Nom du responsable</Label>
                              <Input
                                id="responsibleLastName"
                                value={responsibleLastName}
                                onChange={(e) => setResponsibleLastName(e.target.value)}
                                placeholder="Nom"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agencyPhone">Téléphone de l'agence</Label>
                            <Input
                              id="agencyPhone"
                              value={agencyPhone}
                              onChange={(e) => setAgencyPhone(e.target.value)}
                              placeholder="Téléphone de l'agence"
                            />
                          </div>
                        </div>
                      )}

                      {/* Localisation */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Pays *</Label>
                          <Select value={selectedCountry || ''} onValueChange={setSelectedCountry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre pays">
                                {selectedCountry && (
                                  <span className="flex items-center">
                                    <span className="mr-2">{flag}</span>
                                    <span>{selectedCountry}</span>
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.name} value={country.name}>
                                  <span className="flex items-center">
                                    <span className="mr-2">{country.flag}</span>
                                    <span>{country.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Ville</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="city"
                                value={selectedCity || ''}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="pl-10"
                                placeholder="Votre ville"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="neighborhood">Quartier</Label>
                            <Input
                              id="neighborhood"
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              placeholder="Votre quartier"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Téléphone */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone">Numéro de téléphone *</Label>
                        <div className="flex space-x-2">
                          <div className="w-20 flex items-center justify-center border rounded-md bg-muted text-sm">
                            {phoneCode}
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="signup-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-10"
                              placeholder="123456789"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSignup}
                        className="w-full" 
                        disabled={isLoading || !selectedCountry || !phone.trim() || !email.trim() || (!firstName.trim() && userType === 'particulier') || (!agencyName.trim() && userType === 'agence')}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Création du compte...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Créer le compte
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Code de vérification</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saisissez le code reçu par SMS au {currentPhone}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
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
                      className="w-full" 
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        authMode === 'signup' ? 'Créer et activer le compte' : 'Se connecter'
                      )}
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleResendSMS}
                        disabled={isResending}
                      >
                        {isResending ? 'Renvoi...' : 'Renvoyer'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={resetForm}
                      >
                        Modifier le numéro
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;