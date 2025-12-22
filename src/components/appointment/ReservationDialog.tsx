import { useState, useEffect } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Loader2, Phone, Users, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatPriceWithCurrency } from '@/data/currencies';
import { DateRange } from 'react-day-picker';

interface ReservationDialogProps {
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  pricePerNight: number;
  minimumStay?: number;
  country?: string | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ReservationDialog = ({ 
  propertyId, 
  ownerId, 
  propertyTitle,
  pricePerNight,
  minimumStay = 1,
  country,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ReservationDialogProps) => {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharePhone, setSharePhone] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [guests, setGuests] = useState(1);

  // Calculate nights and total price
  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;
  const totalPrice = nights * pricePerNight;

  // Fetch user's phone number from profile
  useEffect(() => {
    const fetchUserPhone = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.phone) {
        setUserPhone(data.phone);
        setContactPhone(data.phone);
      }
    };
    fetchUserPhone();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Dates manquantes',
        description: 'Veuillez sélectionner vos dates d\'arrivée et de départ.',
        variant: 'destructive',
      });
      return;
    }

    if (nights < minimumStay) {
      toast({
        title: 'Séjour minimum non respecté',
        description: `Le séjour minimum est de ${minimumStay} nuit${minimumStay > 1 ? 's' : ''}.`,
        variant: 'destructive',
      });
      return;
    }

    if (user.id === ownerId) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas réserver votre propre logement.',
        variant: 'destructive',
      });
      return;
    }

    if (sharePhone && !contactPhone.trim()) {
      toast({
        title: 'Numéro manquant',
        description: 'Veuillez entrer votre numéro de téléphone.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          property_id: propertyId,
          requester_id: user.id,
          owner_id: ownerId,
          requested_date: format(dateRange.from, 'yyyy-MM-dd'),
          requested_time: '12:00', // Default check-in time
          check_in_date: format(dateRange.from, 'yyyy-MM-dd'),
          check_out_date: format(dateRange.to, 'yyyy-MM-dd'),
          total_nights: nights,
          total_price: totalPrice,
          price_per_night: pricePerNight,
          reservation_type: 'reservation',
          message: message.trim() || null,
          share_phone: sharePhone,
          contact_phone: sharePhone ? contactPhone.trim() : null,
        });

      if (error) throw error;

      toast({
        title: 'Demande de réservation envoyée',
        description: 'Le propriétaire examinera votre demande et vous répondra bientôt.',
      });

      setOpen(false);
      setDateRange(undefined);
      setMessage('');
      setSharePhone(false);
      setGuests(1);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return formatPriceWithCurrency(price, country);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Calendar className="w-5 h-5 mr-2" />
            Réserver
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Demande de réservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Property Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Logement :</p>
            <p className="font-medium truncate">{propertyTitle}</p>
            <p className="text-primary font-bold">{formatPrice(pricePerNight)}/nuit</p>
            {minimumStay > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Séjour minimum : {minimumStay} nuits
              </p>
            )}
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionnez vos dates
            </label>
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => date < new Date()}
              locale={fr}
              numberOfMonths={1}
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>

          {/* Nights Summary */}
          {nights > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-primary/10 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{nights} nuit{nights > 1 ? 's' : ''}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(pricePerNight)} × {nights}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-lg border-t border-primary/20 pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              {nights < minimumStay && (
                <p className="text-destructive text-xs">
                  ⚠️ Séjour minimum de {minimumStay} nuits requis
                </p>
              )}
            </motion.div>
          )}

          {/* Guests */}
          {dateRange?.from && dateRange?.to && nights >= minimumStay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Nombre de voyageurs
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGuests(guests + 1)}
                >
                  +
                </Button>
              </div>
            </motion.div>
          )}

          {/* Phone Share Option */}
          {dateRange?.from && dateRange?.to && nights >= minimumStay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox
                  id="sharePhone"
                  checked={sharePhone}
                  onCheckedChange={(checked) => setSharePhone(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="sharePhone" className="text-sm cursor-pointer">
                  <span className="font-medium">Partager mon numéro de téléphone</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Le propriétaire pourra vous contacter directement
                  </p>
                </label>
              </div>

              {sharePhone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Votre numéro de téléphone"
                      className="flex-1"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Message */}
          {dateRange?.from && dateRange?.to && nights >= minimumStay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium mb-2 block">
                Message pour le propriétaire (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présentez-vous et expliquez le but de votre séjour..."
                className="w-full p-3 rounded-lg border border-border bg-background resize-none h-20"
                maxLength={500}
              />
            </motion.div>
          )}

          {/* Summary */}
          {dateRange?.from && dateRange?.to && nights >= minimumStay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-muted/50 rounded-lg text-sm"
            >
              <p className="font-medium mb-1">Récapitulatif :</p>
              <p>📅 Arrivée : {format(dateRange.from, 'EEEE d MMMM yyyy', { locale: fr })}</p>
              <p>📅 Départ : {format(dateRange.to, 'EEEE d MMMM yyyy', { locale: fr })}</p>
              <p>👥 {guests} voyageur{guests > 1 ? 's' : ''}</p>
              {sharePhone && contactPhone && (
                <p className="text-muted-foreground mt-1">
                  📞 Téléphone partagé : {contactPhone}
                </p>
              )}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!dateRange?.from || !dateRange?.to || nights < minimumStay || loading}
            className="w-full gradient-primary"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Envoyer la demande • ${formatPrice(totalPrice)}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Le propriétaire confirmera votre réservation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
