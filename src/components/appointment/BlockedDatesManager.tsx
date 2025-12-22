import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, X, Loader2, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

interface BlockedDatesManagerProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
}

export const BlockedDatesManager = ({ 
  propertyId, 
  propertyTitle,
  trigger 
}: BlockedDatesManagerProps) => {
  const [open, setOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDates, setFetchingDates] = useState(false);

  const fetchBlockedDates = async () => {
    setFetchingDates(true);
    try {
      const { data, error } = await supabase
        .from('property_blocked_dates')
        .select('*')
        .eq('property_id', propertyId)
        .order('blocked_date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setFetchingDates(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBlockedDates();
    }
  }, [open, propertyId]);

  const handleBlockDates = async () => {
    if (!dateRange?.from) {
      toast({
        title: 'Date manquante',
        description: 'Veuillez sélectionner au moins une date.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const endDate = dateRange.to || dateRange.from;
      const datesInRange = eachDayOfInterval({ start: dateRange.from, end: endDate });
      
      const datesToInsert = datesInRange.map(date => ({
        property_id: propertyId,
        blocked_date: format(date, 'yyyy-MM-dd'),
        reason: reason.trim() || null,
      }));

      const { error } = await supabase
        .from('property_blocked_dates')
        .upsert(datesToInsert, { onConflict: 'property_id,blocked_date' });

      if (error) throw error;

      toast({
        title: 'Dates bloquées',
        description: `${datesInRange.length} date${datesInRange.length > 1 ? 's' : ''} bloquée${datesInRange.length > 1 ? 's' : ''} avec succès.`,
      });

      setDateRange(undefined);
      setReason('');
      fetchBlockedDates();
    } catch (error) {
      console.error('Error blocking dates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de bloquer les dates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDate = async (dateId: string) => {
    try {
      const { error } = await supabase
        .from('property_blocked_dates')
        .delete()
        .eq('id', dateId);

      if (error) throw error;

      toast({
        title: 'Date débloquée',
        description: 'La date est maintenant disponible.',
      });

      fetchBlockedDates();
    } catch (error) {
      console.error('Error unblocking date:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de débloquer la date.',
        variant: 'destructive',
      });
    }
  };

  const handleUnblockAll = async () => {
    if (!blockedDates.length) return;

    try {
      const { error } = await supabase
        .from('property_blocked_dates')
        .delete()
        .eq('property_id', propertyId);

      if (error) throw error;

      toast({
        title: 'Toutes les dates débloquées',
        description: 'Le calendrier est maintenant entièrement disponible.',
      });

      setBlockedDates([]);
    } catch (error) {
      console.error('Error unblocking all dates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de débloquer les dates.',
        variant: 'destructive',
      });
    }
  };

  const blockedDatesList = blockedDates.map(d => new Date(d.blocked_date));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Gérer les disponibilités
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Gérer les disponibilités
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Logement :</p>
            <p className="font-medium truncate">{propertyTitle}</p>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionnez les dates à bloquer
            </label>
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              modifiers={{
                blocked: blockedDatesList
              }}
              modifiersClassNames={{
                blocked: 'bg-destructive/20 text-destructive line-through'
              }}
              locale={fr}
              numberOfMonths={1}
              className={cn("rounded-md border pointer-events-auto")}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Les dates barrées sont déjà bloquées
            </p>
          </div>

          {/* Reason */}
          {dateRange?.from && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium mb-2 block">
                Raison (optionnel)
              </label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Travaux, occupation personnelle..."
                maxLength={100}
              />
            </motion.div>
          )}

          {/* Block Button */}
          {dateRange?.from && (
            <Button
              onClick={handleBlockDates}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Bloquer ces dates
            </Button>
          )}

          {/* Blocked Dates List */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                Dates bloquées ({blockedDates.length})
              </h3>
              {blockedDates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnblockAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Unlock className="w-4 h-4 mr-1" />
                  Tout débloquer
                </Button>
              )}
            </div>

            {fetchingDates ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune date bloquée
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {blockedDates.map((blockedDate) => (
                    <motion.div
                      key={blockedDate.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(blockedDate.blocked_date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </p>
                        {blockedDate.reason && (
                          <p className="text-xs text-muted-foreground">
                            {blockedDate.reason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnblockDate(blockedDate.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedDatesManager;
