import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarDays, 
  Loader2, 
  Check, 
  X, 
  MessageCircle,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Appointment {
  id: string;
  property_id: string;
  requester_id: string;
  owner_id: string;
  requested_date: string;
  requested_time: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  response_message: string | null;
  created_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
  };
  requester?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  owner?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const AppointmentsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      subscribeToAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('requested_date', { ascending: true });

      if (error) throw error;

      // Fetch related data
      const propertyIds = [...new Set(data?.map(a => a.property_id) || [])];
      const userIds = [...new Set([
        ...(data?.map(a => a.requester_id) || []),
        ...(data?.map(a => a.owner_id) || [])
      ])];

      const [propertiesRes, profilesRes] = await Promise.all([
        supabase.from('properties').select('id, title, address, city').in('id', propertyIds),
        supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', userIds)
      ]);

      const propertiesMap = new Map(propertiesRes.data?.map(p => [p.id, p]));
      const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]));

      const enrichedAppointments: Appointment[] = (data || []).map(a => ({
        ...a,
        status: a.status as 'pending' | 'approved' | 'rejected',
        property: propertiesMap.get(a.property_id),
        requester: profilesMap.get(a.requester_id),
        owner: profilesMap.get(a.owner_id),
      }));

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAppointments = () => {
    if (!user) return;

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUpdateStatus = async (appointmentId: string, status: 'approved' | 'rejected') => {
    setProcessingId(appointmentId);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Rendez-vous approuvé' : 'Rendez-vous refusé',
        description: status === 'approved' 
          ? 'Le demandeur a été notifié de votre acceptation.'
          : 'Le demandeur a été notifié de votre refus.',
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le rendez-vous.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleContactRequester = (requesterId: string, propertyId: string) => {
    navigate('/messages', { state: { recipientId: requesterId, propertyId } });
  };

  const receivedAppointments = appointments.filter(a => a.owner_id === user?.id);
  const sentAppointments = appointments.filter(a => a.requester_id === user?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">En attente</span>;
      case 'approved':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Refusé</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">Aucun rendez-vous</h3>
        <p className="text-sm text-muted-foreground">
          Vos demandes et rendez-vous apparaîtront ici
        </p>
      </div>
    );
  }

  const AppointmentCard = ({ appointment, isReceived }: { appointment: Appointment; isReceived: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/30 rounded-xl p-4 space-y-3"
    >
      {/* Property Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{appointment.property?.title || 'Propriété'}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{appointment.property?.city || 'N/A'}</span>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2">
        <img
          src={isReceived 
            ? appointment.requester?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'
            : appointment.owner?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'
          }
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {isReceived 
              ? appointment.requester?.full_name || 'Utilisateur'
              : appointment.owner?.full_name || 'Propriétaire'
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {isReceived ? 'Demandeur' : 'Propriétaire'}
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span>{format(new Date(appointment.requested_date), 'd MMMM yyyy', { locale: fr })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" />
          <span>{appointment.requested_time}</span>
        </div>
      </div>

      {/* Message */}
      {appointment.message && (
        <div className="p-2 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground">Message :</p>
          <p className="text-sm">{appointment.message}</p>
        </div>
      )}

      {/* Actions for received appointments */}
      {isReceived && appointment.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(appointment.id, 'approved')}
            disabled={processingId === appointment.id}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {processingId === appointment.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Accepter
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleUpdateStatus(appointment.id, 'rejected')}
            disabled={processingId === appointment.id}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Refuser
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleContactRequester(appointment.requester_id, appointment.property_id)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <Tabs defaultValue="received" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="received" className="relative">
          Reçus
          {receivedAppointments.filter(a => a.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
              {receivedAppointments.filter(a => a.status === 'pending').length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent">Envoyés</TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="space-y-3">
        {receivedAppointments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Aucune demande reçue</p>
          </div>
        ) : (
          receivedAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} isReceived />
          ))
        )}
      </TabsContent>

      <TabsContent value="sent" className="space-y-3">
        {sentAppointments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Aucune demande envoyée</p>
          </div>
        ) : (
          sentAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} isReceived={false} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentsTab;
