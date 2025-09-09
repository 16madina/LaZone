import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, User, Building2, Loader2 } from 'lucide-react';
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

  // Fonction pour l'inscription par SMS
  const handleSMSSignup = async () => {
    if (!selectedCountry || !phone.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre numéro de téléphone.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'particulier' && !firstName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre prénom.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'agence' && !agencyName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir le nom de votre agence.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      
      // Envoyer le SMS de vérification
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: fullPhoneNumber,
          type: 'otp'
        }
      });

      if (error) throw error;

      // Stocker les données d'inscription temporairement
      const signupData = userType === 'particulier' 
        ? {
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            country: selectedCountry,
            city: selectedCity,
            neighborhood,
            phone: fullPhoneNumber,
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
            responsible_mobile: fullPhoneNumber
          };

      // Stocker les données temporairement dans localStorage
      localStorage.setItem('pendingSignupData', JSON.stringify(signupData));

      setOtpSent(true);
      toast({
        title: 'Code envoyé !',
        description: 'Un code à 6 chiffres vous a été envoyé par SMS pour activer votre compte.',
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

  const handleVerifySignupOTP = async () => {
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
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      
      // Vérifier le code OTP - cela va automatiquement créer le compte
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: fullPhoneNumber,
          code: otpCode
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

        // Récupérer et mettre à jour le profil avec les données d'inscription
        const signupData = localStorage.getItem('pendingSignupData');
        if (signupData) {
          try {
            const userData = JSON.parse(signupData);
            
            // Mettre à jour le profil avec les informations complètes
            const { error: updateError } = await supabase
              .from('profiles')
              .update(userData)
              .eq('user_id', data.user?.id);

            if (updateError) {
              console.error('Profile update error:', updateError);
            }
            
            // Nettoyer les données temporaires
            localStorage.removeItem('pendingSignupData');
          } catch (parseError) {
            console.error('Failed to parse signup data:', parseError);
          }
        }

        // Log successful signup
        SecurityMonitor.logAuthEvent('signup', data.user?.id, {
          signupMethod: 'sms',
          phone: fullPhoneNumber,
          userType: userType
        });

        toast({
          title: 'Compte créé et activé ! 🎉',
          description: 'Bienvenue sur LaZone ! Votre compte est maintenant actif.',
        });
        
        // Attendre un peu pour que la session s'établisse
        setTimeout(() => {
          navigate(nextUrl);
        }, 1000);
      } else {
        throw new Error(data?.error || 'Code de vérification incorrect');
      }
    } catch (error: any) {
      // Log failed signup attempt
      SecurityMonitor.logAuthEvent('signup', undefined, {
        signupMethod: 'sms',
        phone: `${phoneCode}${phone.replace(/\s/g, '')}`,
        error: error.message,
        userType: userType
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

  const handleResendSignupSMS = async () => {
    setIsResending(true);
    try {
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: fullPhoneNumber,
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
          <h1 className="text-xl font-bold">Inscription LaZone</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Créer un compte LaZone</CardTitle>
              <CardDescription>
                Inscription rapide par SMS - Votre compte sera activé immédiatement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Info SMS */}
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">Inscription par SMS uniquement</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Plus besoin d'email ! Recevez un code SMS et activez votre compte instantanément.
                  </p>
                </div>

                {!otpSent ? (
                  <>
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

                    {/* Champs selon le type */}
                    {userType === 'particulier' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="pl-10"
                                placeholder="Votre prénom"
                                required
                              />
                            </div>
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
                      </>
                    ) : (
                      <>
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
                      </>
                    )}

                    {/* Pays et ville */}
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
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone *</Label>
                      <div className="flex space-x-2">
                        <div className="w-20 flex items-center justify-center border rounded-md bg-muted text-sm">
                          {phoneCode}
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="phone"
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
                      type="button"
                      className="w-full" 
                      onClick={handleSMSSignup}
                      disabled={isLoading || !selectedCountry || !phone.trim() || (!firstName.trim() && userType === 'particulier') || (!agencyName.trim() && userType === 'agence')}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Créer le compte et envoyer le SMS
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium text-green-800 dark:text-green-200">
                        Code envoyé !
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Saisissez le code à 6 chiffres reçu par SMS au {phoneCode}{phone}
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
                        type="button"
                        className="w-full" 
                        onClick={handleVerifySignupOTP}
                        disabled={isLoading || otpCode.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Vérification...
                          </>
                        ) : (
                          'Vérifier et activer le compte'
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleResendSignupSMS}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Renvoi...
                          </>
                        ) : (
                          'Renvoyer le code'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;