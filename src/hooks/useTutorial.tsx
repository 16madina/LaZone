import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  route?: string;
}

export type TutorialSection = 'full' | 'home' | 'map' | 'publish' | 'messages' | 'profile';

const fullTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue ! 🏠',
    description: 'Découvrez LaZone en quelques étapes.',
    position: 'center'
  },
  {
    id: 'search',
    title: 'Recherche',
    description: 'Trouvez des propriétés par ville ou quartier.',
    target: '[data-tutorial="search"]',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'country',
    title: 'Pays',
    description: 'Cliquez sur le drapeau pour changer de pays.',
    target: '[data-tutorial="country"]',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'property-card',
    title: 'Propriétés',
    description: 'Glissez pour voir les photos, cliquez pour détails.',
    target: '[data-tutorial="property-card"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'map',
    title: 'Carte',
    description: 'Visualisez les propriétés sur la carte.',
    target: '[data-tutorial="nav-map"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'publish',
    title: 'Publier',
    description: 'Vendez ou louez votre bien.',
    target: '[data-tutorial="nav-publish"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'messages',
    title: 'Messages',
    description: 'Discutez avec vendeurs et acheteurs.',
    target: '[data-tutorial="nav-messages"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'profile',
    title: 'Profil',
    description: 'Gérez vos annonces et paramètres.',
    target: '[data-tutorial="nav-profile"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'complete',
    title: 'Prêt ! 🎉',
    description: 'Bonne exploration de LaZone !',
    position: 'center'
  }
];

const sectionTutorials: Record<TutorialSection, TutorialStep[]> = {
  full: fullTutorialSteps,
  home: [
    {
      id: 'home-intro',
      title: 'Accueil 🏠',
      description: 'Parcourez les propriétés de votre zone.',
      position: 'center'
    },
    {
      id: 'home-search',
      title: 'Recherche',
      description: 'Tapez une ville ou un quartier.',
      target: '[data-tutorial="search"]',
      position: 'bottom'
    },
    {
      id: 'home-filters',
      title: 'Filtres',
      description: 'Affinez par prix et type de bien.',
      target: '[data-tutorial="filters"]',
      position: 'bottom'
    },
    {
      id: 'home-country',
      title: 'Pays',
      description: 'Changez de pays via le drapeau.',
      target: '[data-tutorial="country"]',
      position: 'bottom'
    },
    {
      id: 'home-properties',
      title: 'Propriétés',
      description: 'Glissez les photos, cliquez pour détails.',
      target: '[data-tutorial="property-card"]',
      position: 'top'
    },
    {
      id: 'home-complete',
      title: 'C\'est parti ! ✨',
      description: 'Bonne exploration !',
      position: 'center'
    }
  ],
  map: [
    {
      id: 'map-intro',
      title: 'Carte 🗺️',
      description: 'Localisez les biens sur la carte.',
      position: 'center'
    },
    {
      id: 'map-country',
      title: 'Pays',
      description: 'Sélectionnez un pays africain.',
      target: '[data-tutorial="map-country"]',
      position: 'bottom'
    },
    {
      id: 'map-search',
      title: 'Recherche',
      description: 'Recherchez une ville ou quartier.',
      target: '[data-tutorial="map-search"]',
      position: 'bottom'
    },
    {
      id: 'map-filters',
      title: 'Filtres',
      description: 'Filtrez par type (vente/location).',
      target: '[data-tutorial="map-filters"]',
      position: 'bottom'
    },
    {
      id: 'map-view',
      title: 'Carte',
      description: 'Cliquez sur un marqueur pour voir le bien.',
      target: '[data-tutorial="map-view"]',
      position: 'top'
    },
    {
      id: 'map-zoom',
      title: 'Zoom',
      description: 'Utilisez +/- pour zoomer.',
      target: '[data-tutorial="map-zoom"]',
      position: 'left'
    },
    {
      id: 'map-complete',
      title: 'Explorez ! 📍',
      description: 'Bonne exploration !',
      position: 'center'
    }
  ],
  publish: [
    {
      id: 'publish-intro',
      title: 'Publier 📝',
      description: 'Créez votre annonce en quelques étapes.',
      position: 'center'
    },
    {
      id: 'publish-photos',
      title: 'Photos',
      description: 'Ajoutez jusqu\'à 10 photos.',
      target: '[data-tutorial="publish-photos"]',
      position: 'bottom'
    },
    {
      id: 'publish-details',
      title: 'Détails',
      description: 'Renseignez titre, prix et description.',
      target: '[data-tutorial="publish-details"]',
      position: 'bottom'
    },
    {
      id: 'publish-location',
      title: 'Localisation',
      description: 'Placez le marqueur sur la carte.',
      target: '[data-tutorial="publish-location"]',
      position: 'top'
    },
    {
      id: 'publish-complete',
      title: 'Publié ! 🎉',
      description: 'Votre annonce est visible.',
      position: 'center'
    }
  ],
  messages: [
    {
      id: 'messages-intro',
      title: 'Messages 💬',
      description: 'Discutez avec vendeurs et acheteurs.',
      position: 'center'
    },
    {
      id: 'messages-conversations',
      title: 'Conversations',
      description: 'Vos discussions par propriété.',
      target: '[data-tutorial="messages-list"]',
      position: 'bottom'
    },
    {
      id: 'messages-send',
      title: 'Envoyer',
      description: 'Tapez et envoyez messages et photos.',
      target: '[data-tutorial="messages-input"]',
      position: 'top'
    },
    {
      id: 'messages-appointment',
      title: 'Rendez-vous',
      description: 'Proposez un RDV via le menu (3 points).',
      target: '[data-tutorial="messages-menu"]',
      position: 'bottom'
    },
    {
      id: 'messages-complete',
      title: 'Connecté ! 📱',
      description: 'Répondez vite pour conclure.',
      position: 'center'
    }
  ],
  profile: [
    {
      id: 'profile-intro',
      title: 'Profil 👤',
      description: 'Gérez compte et annonces.',
      position: 'center'
    },
    {
      id: 'profile-info',
      title: 'Mon profil',
      description: 'Voir et modifier vos infos.',
      target: '[data-tutorial="profile-info"]',
      position: 'bottom'
    },
    {
      id: 'profile-listings',
      title: 'Annonces',
      description: 'Vos propriétés publiées.',
      target: '[data-tutorial="profile-listings"]',
      position: 'bottom'
    },
    {
      id: 'profile-appointments',
      title: 'Mes RDV',
      description: 'Gérez vos rendez-vous.',
      target: '[data-tutorial="profile-appointments"]',
      position: 'bottom'
    },
    {
      id: 'profile-settings',
      title: 'Paramètres',
      description: 'Notifications, sécurité, etc.',
      target: '[data-tutorial="profile-settings"]',
      position: 'bottom'
    },
    {
      id: 'profile-complete',
      title: 'Votre espace ! 🌟',
      description: 'Profil à jour = plus de succès.',
      position: 'center'
    }
  ]
};

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  currentSection: TutorialSection;
  startTutorial: () => void;
  startSectionTutorial: (section: TutorialSection) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  hasCompletedTutorial: boolean;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSection, setCurrentSection] = useState<TutorialSection>('full');
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);

  const steps = sectionTutorials[currentSection];

  useEffect(() => {
    const completed = localStorage.getItem('lazone_tutorial_completed');
    setHasCompletedTutorial(completed === 'true');
  }, []);

  const startTutorial = () => {
    setCurrentSection('full');
    setCurrentStep(0);
    setIsActive(true);
  };

  const startSectionTutorial = (section: TutorialSection) => {
    setCurrentSection(section);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    if (currentSection === 'full') {
      localStorage.setItem('lazone_tutorial_completed', 'true');
      setHasCompletedTutorial(true);
    }
  };

  const completeTutorial = () => {
    setIsActive(false);
    if (currentSection === 'full') {
      localStorage.setItem('lazone_tutorial_completed', 'true');
      setHasCompletedTutorial(true);
    }
  };

  const resetTutorial = () => {
    localStorage.removeItem('lazone_tutorial_completed');
    setHasCompletedTutorial(false);
  };

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStep,
      steps,
      currentSection,
      startTutorial,
      startSectionTutorial,
      nextStep,
      prevStep,
      skipTutorial,
      completeTutorial,
      hasCompletedTutorial,
      resetTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
