import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  MapPin, 
  Shield, 
  Calculator,
  Camera,
  FileCheck,
  Banknote,
  Building,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'finance' | 'verification' | 'services' | 'mapping';
  status: 'active' | 'pending' | 'inactive';
  features: string[];
}

interface FinancingRequest {
  amount: number;
  duration: number;
  income: number;
  employment: string;
}

const ExternalIntegrations: React.FC = () => {
  const { toast } = useToast();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [financingRequest, setFinancingRequest] = useState<FinancingRequest>({
    amount: 0,
    duration: 20,
    income: 0,
    employment: ''
  });

  const integrations: Integration[] = [
    {
      id: 'bank-financing',
      name: 'Financement Bancaire',
      description: 'Simulation et demande de crédit immobilier',
      icon: <CreditCard className="w-5 h-5" />,
      category: 'finance',
      status: 'active',
      features: ['Simulation de crédit', 'Pré-approbation', 'Comparaison des taux', 'Dossier en ligne']
    },
    {
      id: 'property-valuation',
      name: 'Évaluation Immobilière',
      description: 'Estimation automatique de la valeur',
      icon: <Calculator className="w-5 h-5" />,
      category: 'services',
      status: 'active',
      features: ['Évaluation IA', 'Rapport détaillé', 'Comparaison marché', 'Tendances prix']
    },
    {
      id: 'identity-verification',
      name: 'Vérification d\'Identité',
      description: 'KYC et vérification des documents',
      icon: <Shield className="w-5 h-5" />,
      category: 'verification',
      status: 'active',
      features: ['Scan de documents', 'Vérification biométrique', 'Validation automatique', 'Conformité légale']
    },
    {
      id: 'virtual-inspection',
      name: 'Inspection Virtuelle',
      description: 'Inspection à distance par experts',
      icon: <Camera className="w-5 h-5" />,
      category: 'services',
      status: 'pending',
      features: ['Visite guidée', 'Rapport technique', 'Estimation travaux', 'Certification']
    },
    {
      id: 'legal-services',
      name: 'Services Juridiques',
      description: 'Assistance juridique et notariale',
      icon: <FileCheck className="w-5 h-5" />,
      category: 'services',
      status: 'active',
      features: ['Contrats types', 'Conseil juridique', 'Notaire en ligne', 'Suivi dossier']
    },
    {
      id: 'insurance',
      name: 'Assurance Habitation',
      description: 'Devis et souscription d\'assurance',
      icon: <Building className="w-5 h-5" />,
      category: 'finance',
      status: 'active',
      features: ['Devis instantané', 'Comparaison offres', 'Souscription en ligne', 'Gestion sinistres']
    },
    {
      id: 'advanced-mapping',
      name: 'Cartographie Avancée',
      description: 'Analyse géospatiale et démographique',
      icon: <MapPin className="w-5 h-5" />,
      category: 'mapping',
      status: 'active',
      features: ['Données démographiques', 'Analyse transport', 'Projets urbains', 'Évolution quartier']
    },
    {
      id: 'mortgage-broker',
      name: 'Courtage Immobilier',
      description: 'Négociation et accompagnement',
      icon: <Banknote className="w-5 h-5" />,
      category: 'finance',
      status: 'pending',
      features: ['Négociation prix', 'Accompagnement achat', 'Réseau partenaires', 'Suivi complet']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'inactive': return 'Inactif';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finance': return 'bg-green-100 text-green-800';
      case 'verification': return 'bg-blue-100 text-blue-800';
      case 'services': return 'bg-purple-100 text-purple-800';
      case 'mapping': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFinancingSimulation = () => {
    // Simulate financing calculation
    const monthlyRate = 0.03 / 12; // 3% annual rate
    const monthlyPayment = (financingRequest.amount * monthlyRate * Math.pow(1 + monthlyRate, financingRequest.duration * 12)) / 
                          (Math.pow(1 + monthlyRate, financingRequest.duration * 12) - 1);
    
    toast({
      title: "Simulation réalisée",
      description: `Mensualité estimée: ${monthlyPayment.toFixed(0)} CFA`,
    });
  };

  const handleIntegrationAction = (integration: Integration) => {
    switch (integration.id) {
      case 'bank-financing':
        toast({
          title: "Redirection vers le partenaire bancaire",
          description: "Ouverture de l'interface de simulation...",
        });
        break;
      case 'identity-verification':
        toast({
          title: "Vérification d'identité",
          description: "Processus de vérification lancé",
        });
        break;
      case 'property-valuation':
        toast({
          title: "Évaluation en cours",
          description: "Analyse de la propriété par l'IA...",
        });
        break;
      default:
        toast({
          title: "Service en développement",
          description: "Cette fonctionnalité sera bientôt disponible",
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégrations Externes</h2>
          <p className="text-muted-foreground">Services partenaires pour une expérience complète</p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {integration.icon}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(integration.status)}
                <Badge className={getCategoryColor(integration.category)}>
                  {integration.category}
                </Badge>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
            
            <div className="space-y-2 mb-4">
              {integration.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                integration.status === 'active' ? 'bg-green-100 text-green-800' :
                integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {getStatusText(integration.status)}
              </span>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedIntegration(integration)}
                    disabled={integration.status === 'inactive'}
                  >
                    Utiliser
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {integration.icon}
                      {integration.name}
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Informations</TabsTrigger>
                      <TabsTrigger value="action">Utiliser</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Fonctionnalités</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {integration.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="action">
                      {integration.id === 'bank-financing' ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Simulation de financement</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="amount">Montant (CFA)</Label>
                              <Input
                                id="amount"
                                type="number"
                                value={financingRequest.amount}
                                onChange={(e) => setFinancingRequest(prev => ({
                                  ...prev, 
                                  amount: Number(e.target.value)
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="duration">Durée (années)</Label>
                              <Input
                                id="duration"
                                type="number"
                                value={financingRequest.duration}
                                onChange={(e) => setFinancingRequest(prev => ({
                                  ...prev, 
                                  duration: Number(e.target.value)
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="income">Revenus mensuels (CFA)</Label>
                              <Input
                                id="income"
                                type="number"
                                value={financingRequest.income}
                                onChange={(e) => setFinancingRequest(prev => ({
                                  ...prev, 
                                  income: Number(e.target.value)
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="employment">Situation professionnelle</Label>
                              <Input
                                id="employment"
                                value={financingRequest.employment}
                                onChange={(e) => setFinancingRequest(prev => ({
                                  ...prev, 
                                  employment: e.target.value
                                }))}
                                placeholder="ex: CDI, Fonctionnaire"
                              />
                            </div>
                          </div>
                          <Button onClick={handleFinancingSimulation} className="w-full">
                            Simuler le financement
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Cliquez sur le bouton ci-dessous pour accéder au service partenaire.
                          </p>
                          <Button 
                            onClick={() => handleIntegrationAction(integration)}
                            className="w-full"
                          >
                            Accéder au service
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 p-4"
            onClick={() => {
              toast({
                title: "Calcul de mensualités",
                description: "Outil de simulation disponible prochainement"
              });
            }}
          >
            <Calculator className="w-6 h-6" />
            <span className="text-sm">Calculer mensualités</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 p-4"
            onClick={() => {
              toast({
                title: "Vérification de documents",
                description: "Service de vérification en cours de développement"
              });
            }}
          >
            <Shield className="w-6 h-6" />
            <span className="text-sm">Vérifier documents</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 p-4"
            onClick={() => {
              toast({
                title: "Planification de visite",
                description: "Système de rendez-vous bientôt disponible"
              });
            }}
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm">Planifier visite</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 p-4"
            onClick={() => {
              toast({
                title: "Assistance juridique",
                description: "Service juridique en cours d'intégration"
              });
            }}
          >
            <FileCheck className="w-6 h-6" />
            <span className="text-sm">Assistance juridique</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExternalIntegrations;