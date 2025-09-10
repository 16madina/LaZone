import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, User, Building2, Loader2, Mail, MapPin, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/contexts/LocationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Champs communs
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email ou téléphone pour connexion
  const [password, setPassword] = useState('');
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

  // Fonction pour connexion directe avec email/phone et mot de passe
  const handleLogin = async () => {
    if (!loginIdentifier.trim() || !password.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez saisir votre email/téléphone et mot de passe.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let email = loginIdentifier;
      
      // Si c'est un numéro de téléphone, chercher l'email associé
      if (/^\+?\d+$/.test(loginIdentifier.replace(/\s/g, ''))) {
        const fullPhoneNumber = loginIdentifier.startsWith('+') 
          ? loginIdentifier.replace(/\s/g, '') 
          : `${phoneCode}${loginIdentifier.replace(/\s/g, '')}`;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', fullPhoneNumber)
          .maybeSingle();
        
        if (!profile?.email) {
          toast({
            title: 'Compte introuvable',
            description: 'Aucun compte n\'est associé à ce numéro.',
            variant: 'destructive',
          });
          return;
        }
        
        email = profile.email;
      }

      // Connexion avec Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log successful auth
      SecurityMonitor.logAuthEvent('login_success', undefined, {
        authMethod: 'email_password',
        identifier: loginIdentifier
      });

      toast({
        title: 'Connexion réussie ! 👋',
        description: 'Bienvenue de retour sur LaZone !',
      });
      
      navigate(nextUrl);
    } catch (error: any) {
      SecurityMonitor.logAuthEvent('login_failure', undefined, {
        authMethod: 'email_password',
        identifier: loginIdentifier,
        error: error.message
      });
      
      toast({
        title: 'Erreur de connexion',
        description: error.message === 'Invalid login credentials' 
          ? 'Email/téléphone ou mot de passe incorrect.' 
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour inscription directe sans vérification
  const handleSignup = async () => {
    // Validation des champs obligatoires
    if (!selectedCountry || !phone.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Champs obligatoires',
        description: 'Veuillez remplir tous les champs obligatoires.',
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

    if (password.length < 6) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${phoneCode}${phone.replace(/\s/g, '')}`;
      
      // Vérifier si l'utilisateur existe déjà (email ou téléphone)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, email, phone')
        .or(`email.eq.${email.trim()},phone.eq.${fullPhoneNumber}`)
        .maybeSingle();
      
      if (existingProfile) {
        const duplicateField = existingProfile.email === email.trim() ? 'email' : 'téléphone';
        toast({
          title: 'Compte existant',
          description: `Un compte existe déjà avec ce ${duplicateField}. Utilisez "Se connecter" à la place.`,
          variant: 'destructive',
        });
        return;
      }

      // Créer le compte avec Supabase Auth
      const signupData = {
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            phone: fullPhoneNumber,
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
          }
        }
      };

      const { error } = await supabase.auth.signUp(signupData);

      if (error) throw error;

      // Log successful auth
      SecurityMonitor.logAuthEvent('signup', undefined, {
        authMethod: 'email_password',
        phone: fullPhoneNumber,
        userType
      });

      toast({
        title: 'Compte créé ! 🎉',
        description: 'Votre compte LaZone a été créé avec succès. Vous êtes maintenant connecté.',
      });
      
      navigate(nextUrl);
    } catch (error: any) {
      SecurityMonitor.logAuthEvent('login_failure', undefined, {
        authMethod: 'email_password',
        phone: phone,
        error: error.message,
        userType
      });
      
      toast({
        title: 'Erreur lors de l\'inscription',
        description: error.message === 'User already registered' 
          ? 'Un compte existe déjà avec cet email.' 
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLoginIdentifier('');
    setPassword('');
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
                Connexion et inscription directes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(value) => { setAuthMode(value as 'login' | 'signup'); resetForm(); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">Connexion</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Connectez-vous avec votre email ou téléphone
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-identifier">Email ou numéro de téléphone</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-identifier"
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="pl-10"
                          placeholder="email@exemple.com ou +225123456789"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={handleLogin}
                      className="w-full" 
                      disabled={isLoading || !loginIdentifier.trim() || !password.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          Se connecter
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
                      Inscription directe sans vérification
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Type de compte */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Type de compte</Label>
                      <RadioGroup value={userType} onValueChange={(value) => setUserType(value as typeof userType)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="particulier" id="particulier" />
                          <Label htmlFor="particulier" className="flex items-center cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Particulier
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="agence" id="agence" />
                          <Label htmlFor="agence" className="flex items-center cursor-pointer">
                            <Building2 className="w-4 h-4 mr-2" />
                            Agence immobilière
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Champs communs */}
                    <div className="space-y-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Mot de passe *</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Au moins 6 caractères
                        </p>
                      </div>
                    </div>

                    {/* Champs spécifiques au type */}
                    {userType === 'particulier' && (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom *</Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Jean"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Dupont"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="canvasser"
                            checked={isCanvasser}
                            onCheckedChange={(checked) => setIsCanvasser(checked === true)}
                          />
                          <Label htmlFor="canvasser" className="text-sm">
                            Je suis un démarcheur immobilier
                          </Label>
                        </div>
                      </div>
                    )}

                    {userType === 'agence' && (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="agencyName">Nom de l'agence *</Label>
                          <Input
                            id="agencyName"
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            placeholder="Immobilier Excellence"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="responsibleFirstName">Prénom du responsable</Label>
                            <Input
                              id="responsibleFirstName"
                              value={responsibleFirstName}
                              onChange={(e) => setResponsibleFirstName(e.target.value)}
                              placeholder="Marie"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsibleLastName">Nom du responsable</Label>
                            <Input
                              id="responsibleLastName"
                              value={responsibleLastName}
                              onChange={(e) => setResponsibleLastName(e.target.value)}
                              placeholder="Martin"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agencyPhone">Téléphone de l'agence</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="agencyPhone"
                              type="tel"
                              value={agencyPhone}
                              onChange={(e) => setAgencyPhone(e.target.value)}
                              className="pl-10"
                              placeholder="0123456789"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Localisation */}
                    <div className="space-y-4 pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Localisation</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Pays *</Label>
                          <Select value={selectedCountry || ''} onValueChange={setSelectedCountry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez">
                                {selectedCountry && (
                                  <span className="flex items-center">
                                    <span className="mr-2">{flag}</span>
                                    <span className="truncate">{selectedCountry}</span>
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
                          <Label>Ville</Label>
                          <Select value={selectedCity || ''} onValueChange={setSelectedCity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez">
                                {selectedCity && <span className="truncate">{selectedCity}</span>}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {selectedCountry && countries.find(c => c.name === selectedCountry)?.cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Quartier</Label>
                        <Input
                          id="neighborhood"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Centre-ville, Plateau..."
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2 pt-2 border-t">
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
                      disabled={isLoading || !selectedCountry || !phone.trim() || !email.trim() || !password.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Création du compte...
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          Créer mon compte
                        </>
                      )}
                    </Button>
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