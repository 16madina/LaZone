import React, { useState } from 'react';
import { Calendar, MapPin, Clock, User, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface VisitRequest {
  id: string;
  listing_id: string;
  requester_id: string;
  owner_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requested_date: string;
  requested_time: string;
  message?: string;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    currency: string;
    address?: string;
    city?: string;
    property_type?: string;
  };
  requester_profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    agency_name?: string;
  };
}

export function VisitRequests() {
  const { toast } = useToast();
  
  // Données factices pour la démonstration
  const [visitRequests] = useState<VisitRequest[]>([
    {
      id: '1',
      listing_id: 'listing-1',
      requester_id: 'user-1',
      owner_id: 'user-2',
      status: 'pending',
      requested_date: '2024-01-15',
      requested_time: '14:00',
      message: 'Je suis très intéressé par cette propriété et aimerais la visiter.',
      created_at: '2024-01-10T10:00:00Z',
      listing: {
        title: 'Appartement moderne 3 pièces',
        price: 450000,
        currency: 'EUR',
        address: '15 Rue de la Paix',
        city: 'Abidjan',
        property_type: 'appartement'
      },
      requester_profile: {
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '+225 07 12 34 56 78',
        agency_name: 'Agence Immobilier Plus'
      }
    },
    {
      id: '2',
      listing_id: 'listing-2',
      requester_id: 'user-3',
      owner_id: 'user-2',
      status: 'accepted',
      requested_date: '2024-01-12',
      requested_time: '10:30',
      message: 'Disponible en matinée, merci !',
      created_at: '2024-01-08T15:30:00Z',
      listing: {
        title: 'Villa 4 chambres avec piscine',
        price: 850000,
        currency: 'EUR',
        address: 'Cocody Riviera',
        city: 'Abidjan',
        property_type: 'villa'
      },
      requester_profile: {
        first_name: 'Marie',
        last_name: 'Kone',
        phone: '+225 05 98 76 54 32'
      }
    }
  ]);

  const updateRequestStatus = (requestId: string, status: 'accepted' | 'rejected') => {
    toast({
      title: 'Succès',
      description: `Demande ${status === 'accepted' ? 'acceptée' : 'refusée'}`,
    });
    // Dans une vraie application, ceci mettrait à jour la base de données
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          En attente
        </Badge>;
      case 'accepted':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="w-3 h-3" />
          Acceptée
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Refusée
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Terminée
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequesterName = (request: VisitRequest) => {
    const profile = request.requester_profile;
    if (profile?.agency_name) return profile.agency_name;
    if (profile?.first_name) {
      return `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`;
    }
    return 'Demandeur';
  };

  const pendingRequests = visitRequests.filter(r => r.status === 'pending');
  const myRequests = visitRequests.filter(r => r.status !== 'pending');
  const otherRequests = visitRequests.filter(r => r.status === 'accepted' || r.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Demandes en attente
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-gradient-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{getRequesterName(request)}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          {request.listing && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{request.listing.title}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-primary">
                                  {formatPrice(request.listing.price, request.listing.currency)}
                                </span>
                                {request.listing.city && ` • ${request.listing.city}`}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(request.requested_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{request.requested_time}</span>
                            </div>
                          </div>
                          
                          {request.message && (
                            <p className="text-sm text-muted-foreground italic mb-3">
                              "{request.message}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Refuser
                            </Button>
                            {request.requester_profile?.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${request.requester_profile?.phone}`, '_self')}
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                Appeler
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Mes demandes */}
      {myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mes demandes de visite
              <Badge variant="outline">{myRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                        </div>
                        
                        {request.listing && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{request.listing.title}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-primary">
                                {formatPrice(request.listing.price, request.listing.currency)}
                              </span>
                              {request.listing.city && ` • ${request.listing.city}`}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.requested_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{request.requested_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historique des demandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3">
                {otherRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getRequesterName(request)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {request.listing?.title} • {new Date(request.requested_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {visitRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune demande de visite</h3>
            <p className="text-muted-foreground text-center">
              Les demandes de visite apparaîtront ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}