import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AppointmentDialogProps {
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const AppointmentDialog = ({ 
  propertyId, 
  ownerId, 
  propertyTitle,
  trigger,
  onSuccess
}: AppointmentDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez sélectionner une date et une heure.',
        variant: 'destructive',
      });
      return;
    }

    if (user.id === ownerId) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas prendre rendez-vous pour votre propre annonce.',
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
          requested_date: format(selectedDate, 'yyyy-MM-dd'),
          requested_time: selectedTime,
          message: message.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Demande envoyée',
        description: 'Le vendeur recevra votre demande de rendez-vous.',
      });

      setOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setMessage('');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Calendar className="w-5 h-5 mr-2" />
            Prendre rendez-vous
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Demander un rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Property Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Pour la propriété :</p>
            <p className="font-medium truncate">{propertyTitle}</p>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choisissez une date
            </label>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              locale={fr}
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Choisissez une heure
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2 px-3 text-sm rounded-lg border transition-colors",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message */}
          {selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-medium mb-2 block">
                Message (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ajoutez un message pour le vendeur..."
                className="w-full p-3 rounded-lg border border-border bg-background resize-none h-20"
                maxLength={500}
              />
            </motion.div>
          )}

          {/* Summary */}
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-primary/10 rounded-lg"
            >
              <p className="text-sm font-medium text-primary">Récapitulatif :</p>
              <p className="text-sm">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à {selectedTime}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full gradient-primary"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Envoyer la demande'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
