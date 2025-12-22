import { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays, addDays, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
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

interface DiscountTiers {
  discount3Nights: number | null;
  discount5Nights: number | null;
  discount7Nights: number | null;
  discount14Nights: number | null;
  discount30Nights: number | null;
}

interface ReservationDialogProps {
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  pricePerNight: number;
  minimumStay?: number;
  country?: string | null;
  discounts?: DiscountTiers;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface BookedPeriod {
  checkIn: Date;
  checkOut: Date;
}

interface BlockedDate {
  blocked_date: string;
}

export const ReservationDialog = ({ 
  propertyId, 
  ownerId, 
  propertyTitle,
  pricePerNight,
  minimumStay = 1,
  country,
  discounts,
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
  const [bookedPeriods, setBookedPeriods] = useState<BookedPeriod[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  // Calculate applicable discount based on nights
  const getApplicableDiscount = (numNights: number): { percentage: number; tier: string } | null => {
    if (!discounts) return null;
    
    if (numNights >= 30 && discounts.discount30Nights) {
      return { percentage: discounts.discount30Nights, tier: '30+ nuits' };
    }
    if (numNights >= 14 && discounts.discount14Nights) {
      return { percentage: discounts.discount14Nights, tier: '14+ nuits' };
    }
    if (numNights >= 7 && discounts.discount7Nights) {
      return { percentage: discounts.discount7Nights, tier: '7+ nuits' };
    }
    if (numNights >= 5 && discounts.discount5Nights) {
      return { percentage: discounts.discount5Nights, tier: '5+ nuits' };
    }
    if (numNights >= 3 && discounts.discount3Nights) {
      return { percentage: discounts.discount3Nights, tier: '3+ nuits' };
    }
    return null;
  };

  // Calculate nights and total price with discount
  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;
  
  const applicableDiscount = getApplicableDiscount(nights);
  const discountedPricePerNight = applicableDiscount 
    ? pricePerNight * (1 - applicableDiscount.percentage / 100)
    : pricePerNight;
  const totalPriceBeforeDiscount = nights * pricePerNight;
  const totalPrice = nights * discountedPricePerNight;
  const savings = totalPriceBeforeDiscount - totalPrice;

  // Fetch booked dates and blocked dates for this property
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      setLoadingDates(true);
      try {
        // Fetch booked reservations
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('appointments')
          .select('check_in_date, check_out_date')
          .eq('property_id', propertyId)
          .eq('status', 'approved')
          .eq('reservation_type', 'reservation')
          .not('check_in_date', 'is', null)
          .not('check_out_date', 'is', null);

        if (bookingsError) throw bookingsError;

        const periods: BookedPeriod[] = (bookingsData || []).map(booking => ({
          checkIn: parseISO(booking.check_in_date!),
          checkOut: parseISO(booking.check_out_date!)
        }));

        setBookedPeriods(periods);

        // Fetch manually blocked dates
        const { data: blockedData, error: blockedError } = await supabase
          .from('property_blocked_dates')
          .select('blocked_date')
          .eq('property_id', propertyId);

        if (blockedError) throw blockedError;

        const blocked = (blockedData || []).map((d: BlockedDate) => parseISO(d.blocked_date));
        setBlockedDates(blocked);
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      } finally {
        setLoadingDates(false);
      }
    };

    if (open) {
      fetchUnavailableDates();
    }
  }, [propertyId, open]);

  // Calculate all disabled dates (booked + manually blocked)
  const disabledDates = useMemo(() => {
    const disabled: Date[] = [...blockedDates];
    
    bookedPeriods.forEach(period => {
      // Get all days between check-in and check-out (exclusive of check-out)
      const days = eachDayOfInterval({ 
        start: period.checkIn, 
        end: addDays(period.checkOut, -1) // Check-out day is available for new check-in
      });
      disabled.push(...days);
    });

    return disabled;
  }, [bookedPeriods, blockedDates]);

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    // Past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    
    // Booked or blocked dates
    return disabledDates.some(disabledDate => 
      disabledDate.toDateString() === date.toDateString()
    );
  };

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
          total_price: Math.round(totalPrice),
          price_per_night: Math.round(discountedPricePerNight),
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
            
            {/* Available discounts */}
            {discounts && (discounts.discount3Nights || discounts.discount5Nights || discounts.discount7Nights || discounts.discount14Nights || discounts.discount30Nights) && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">🏷️ Forfaits disponibles :</p>
                <div className="flex flex-wrap gap-1">
                  {discounts.discount3Nights && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">3+ nuits : -{discounts.discount3Nights}%</span>
                  )}
                  {discounts.discount5Nights && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">5+ nuits : -{discounts.discount5Nights}%</span>
                  )}
                  {discounts.discount7Nights && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">7+ nuits : -{discounts.discount7Nights}%</span>
                  )}
                  {discounts.discount14Nights && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">14+ nuits : -{discounts.discount14Nights}%</span>
                  )}
                  {discounts.discount30Nights && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">30+ nuits : -{discounts.discount30Nights}%</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionnez vos dates
            </label>
            {loadingDates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des disponibilités...</span>
              </div>
            ) : (
              <>
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={isDateDisabled}
                  locale={fr}
                  numberOfMonths={1}
                  className={cn("rounded-md border pointer-events-auto")}
                  modifiers={{
                    booked: disabledDates
                  }}
                  modifiersStyles={{
                    booked: { 
                      textDecoration: 'line-through',
                      opacity: 0.5
                    }
                  }}
                />
                {bookedPeriods.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-muted inline-block"></span>
                    Les dates barrées sont déjà réservées
                  </p>
                )}
              </>
            )}
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
              
              {/* Discount applied */}
              {applicableDiscount && (
                <div className="flex items-center justify-between text-sm text-primary">
                  <span className="flex items-center gap-1">
                    🏷️ Forfait {applicableDiscount.tier}
                  </span>
                  <span>-{applicableDiscount.percentage}%</span>
                </div>
              )}
              
              {applicableDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground line-through">{formatPrice(totalPriceBeforeDiscount)}</span>
                  <span className="text-primary font-medium">Vous économisez {formatPrice(savings)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between font-bold text-lg border-t border-primary/20 pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(Math.round(totalPrice))}</span>
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
              <p>🌙 {nights} nuit{nights > 1 ? 's' : ''}</p>
              <p>👥 {guests} voyageur{guests > 1 ? 's' : ''}</p>
              {sharePhone && contactPhone && (
                <p className="text-muted-foreground mt-1">
                  📞 Téléphone partagé : {contactPhone}
                </p>
              )}
              
              {/* Savings display */}
              {applicableDiscount && savings > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-primary font-medium">
                    <span className="flex items-center gap-1">
                      🎉 Économies forfait {applicableDiscount.tier}
                    </span>
                    <span>-{formatPrice(Math.round(savings))}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prix après réduction : {formatPrice(Math.round(discountedPricePerNight))}/nuit
                  </p>
                </div>
              )}
              
              {/* Final total */}
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between font-bold">
                <span>💰 Total à payer</span>
                <span className="text-primary text-lg">{formatPrice(Math.round(totalPrice))}</span>
              </div>
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
