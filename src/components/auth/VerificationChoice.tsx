import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Phone, CheckCircle2, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAllCountries } from '@/data/worldwideCountries';

interface VerificationChoiceProps {
  userEmail: string;
  onVerificationComplete: () => void;
}

export const VerificationChoice: React.FC<VerificationChoiceProps> = ({
  userEmail,
  onVerificationComplete
}) => {
  const { toast } = useToast();
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const countries = getAllCountries();

  const getCountryInfo = () => {
    const country = countries.find(c => c.name === selectedCountry);
    return {
      flag: country?.flag || '',
      phoneCode: country?.phoneCode || ''
    };
  };

  const { flag, phoneCode } = getCountryInfo();

  const handleEmailVerification = () => {
    setVerificationMethod('email');
    toast({
      title: 'Email de confirmation envoyé',
      description: `Veuillez vérifier votre boîte email ${userEmail} et cliquer sur le lien de confirmation.`,
    });
    
    // Auto-complete après 2 secondes pour la démo
    setTimeout(() => {
      setIsVerified(true);
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    }, 2000);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !selectedCountry) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un pays et saisir votre numéro de téléphone.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${phoneCode}${phoneNumber.replace(/\s/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: fullPhone,
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
      const fullPhone = `${phoneCode}${phoneNumber.replace(/\s/g, '')}`;
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: fullPhone,
          code: otpCode
        }
      });

      if (error) throw error;

      if (data?.success) {
        setIsVerified(true);
        toast({
          title: 'Téléphone vérifié',
          description: 'Votre numéro de téléphone a été confirmé avec succès.',
        });
        
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        throw new Error(data?.error || 'Code de vérification incorrect');
      }
    } catch (error: any) {
      toast({
        title: 'Code incorrect',
        description: error.message || 'Le code saisi est incorrect. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Vérification réussie !</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Votre compte est maintenant activé. Redirection en cours...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Finaliser votre inscription</CardTitle>
          <CardDescription>
            Choisissez comment vous souhaitez confirmer votre identité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!verificationMethod && (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={handleEmailVerification}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => setVerificationMethod('phone')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Numéro de téléphone</p>
                    <p className="text-sm text-muted-foreground">Code SMS à 6 chiffres</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Button>
            </div>
          )}

          {verificationMethod === 'email' && !isVerified && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Email envoyé !</h3>
                <p className="text-sm text-muted-foreground">
                  Vérifiez votre boîte email et cliquez sur le lien de confirmation.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVerificationMethod(null)}
              >
                Choisir une autre méthode
              </Button>
            </div>
          )}

          {verificationMethod === 'phone' && !otpSent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Pays</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.name} value={country.name}>
                        <div className="flex items-center space-x-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-muted-foreground">({country.phoneCode})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="flex space-x-2">
                  {selectedCountry && (
                    <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-sm">
                      {flag} {phoneCode}
                    </div>
                  )}
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Votre numéro"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setVerificationMethod(null)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleSendSMS}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Envoyer le code
                </Button>
              </div>
            </div>
          )}

          {verificationMethod === 'phone' && otpSent && !isVerified && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Code envoyé !</h3>
                <p className="text-sm text-muted-foreground">
                  Saisissez le code à 6 chiffres reçu par SMS
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {flag} {phoneCode}{phoneNumber}
                </p>
              </div>

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
                disabled={isLoading || otpCode.length !== 6}
                className="w-full"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Vérifier le code
              </Button>

              <div className="flex justify-center space-x-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendSMS}
                  disabled={isResending}
                >
                  {isResending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Renvoyer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                >
                  Changer de numéro
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};