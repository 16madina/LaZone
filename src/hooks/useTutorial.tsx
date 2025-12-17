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
    title: 'Bienvenue sur LaZone ! 🏠',
    description: 'Découvrez la première plateforme immobilière panafricaine. Ce tutoriel vous guidera à travers les principales fonctionnalités.',
    position: 'center'
  },
  {
    id: 'search',
    title: 'Recherchez votre bien idéal',
    description: 'Utilisez la barre de recherche et les filtres pour trouver des propriétés. Filtrez par type (maison, appartement, terrain), prix et transaction (achat/location).',
    target: '[data-tutorial="search"]',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'country',
    title: 'Changez de pays',
    description: 'Cliquez sur le drapeau pour voir les propriétés d\'autres pays africains. Les prix s\'affichent automatiquement dans la devise locale.',
    target: '[data-tutorial="country"]',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'property-card',
    title: 'Explorez les propriétés',
    description: 'Faites glisser les images pour voir plus de photos. Cliquez sur le cœur pour sauvegarder en favoris. Appuyez sur la carte pour voir les détails.',
    target: '[data-tutorial="property-card"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'map',
    title: 'Vue carte interactive',
    description: 'Visualisez toutes les propriétés sur la carte. Zoomez sur une zone et cliquez sur les marqueurs pour découvrir les biens disponibles.',
    target: '[data-tutorial="nav-map"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'publish',
    title: 'Publiez votre annonce',
    description: 'Vendez ou louez votre bien facilement. Ajoutez des photos, une description, et placez votre propriété sur la carte.',
    target: '[data-tutorial="nav-publish"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'messages',
    title: 'Messagerie intégrée',
    description: 'Communiquez directement avec les vendeurs et acheteurs. Envoyez des messages, photos et prenez des rendez-vous.',
    target: '[data-tutorial="nav-messages"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'profile',
    title: 'Votre profil',
    description: 'Gérez vos annonces, rendez-vous, favoris et paramètres. Vérifiez votre email pour obtenir un badge de confiance.',
    target: '[data-tutorial="nav-profile"]',
    position: 'top',
    route: '/'
  },
  {
    id: 'complete',
    title: 'Vous êtes prêt ! 🎉',
    description: 'Explorez maintenant LaZone et trouvez votre prochain chez-vous. N\'hésitez pas à consulter la FAQ si vous avez des questions.',
    position: 'center'
  }
];

const sectionTutorials: Record<TutorialSection, TutorialStep[]> = {
  full: fullTutorialSteps,
  home: [
    {
      id: 'home-intro',
      title: 'Bienvenue sur l\'Accueil 🏠',
      description: 'Découvrez toutes les propriétés disponibles dans votre zone. Voici comment naviguer efficacement.',
      position: 'center'
    },
    {
      id: 'home-search',
      title: 'Barre de recherche',
      description: 'Recherchez par ville, quartier ou type de bien. Utilisez les mots-clés pour affiner vos résultats.',
      target: '[data-tutorial="search"]',
      position: 'bottom'
    },
    {
      id: 'home-filters',
      title: 'Filtres avancés',
      description: 'Cliquez sur l\'icône filtre pour définir le prix, le nombre de chambres, le type de transaction et plus encore.',
      target: '[data-tutorial="filters"]',
      position: 'bottom'
    },
    {
      id: 'home-country',
      title: 'Sélection du pays',
      description: 'Changez de pays en cliquant sur le drapeau. Les propriétés et devises s\'adaptent automatiquement.',
      target: '[data-tutorial="country"]',
      position: 'bottom'
    },
    {
      id: 'home-properties',
      title: 'Cartes de propriétés',
      description: 'Glissez pour voir les photos, cliquez sur le cœur pour sauvegarder, appuyez pour voir les détails.',
      target: '[data-tutorial="property-card"]',
      position: 'top'
    },
    {
      id: 'home-complete',
      title: 'C\'est parti ! ✨',
      description: 'Vous maîtrisez maintenant l\'accueil. Explorez les propriétés et trouvez votre prochain chez-vous.',
      position: 'center'
    }
  ],
  map: [
    {
      id: 'map-intro',
      title: 'Vue Carte 🗺️',
      description: 'Visualisez toutes les propriétés sur une carte interactive pour mieux localiser les biens.',
      position: 'center'
    },
    {
      id: 'map-markers',
      title: 'Marqueurs de propriétés',
      description: 'Chaque marqueur représente une propriété. Cliquez dessus pour voir un aperçu rapide.',
      target: '[data-tutorial="map-markers"]',
      position: 'top'
    },
    {
      id: 'map-zoom',
      title: 'Navigation sur la carte',
      description: 'Zoomez avec les boutons +/- ou pincez sur mobile. Déplacez-vous en faisant glisser la carte.',
      target: '[data-tutorial="map-controls"]',
      position: 'left'
    },
    {
      id: 'map-filter',
      title: 'Filtrer par pays',
      description: 'Utilisez le bouton filtre pour voir les propriétés d\'un pays spécifique.',
      target: '[data-tutorial="map-filter"]',
      position: 'bottom'
    },
    {
      id: 'map-complete',
      title: 'Explorez ! 📍',
      description: 'La carte est votre meilleur outil pour découvrir des propriétés par emplacement. Bonne exploration !',
      position: 'center'
    }
  ],
  publish: [
    {
      id: 'publish-intro',
      title: 'Publier une annonce 📝',
      description: 'Vendez ou louez votre bien en quelques étapes simples. Voici comment créer une annonce attractive.',
      position: 'center'
    },
    {
      id: 'publish-photos',
      title: 'Ajoutez des photos',
      description: 'Les annonces avec photos attirent 10x plus de visiteurs. Ajoutez jusqu\'à 10 photos de qualité.',
      target: '[data-tutorial="publish-photos"]',
      position: 'bottom'
    },
    {
      id: 'publish-details',
      title: 'Détails du bien',
      description: 'Renseignez le titre, la description, le prix et les caractéristiques. Soyez précis pour attirer les bons acheteurs.',
      target: '[data-tutorial="publish-details"]',
      position: 'bottom'
    },
    {
      id: 'publish-location',
      title: 'Localisation sur la carte',
      description: 'Placez le marqueur sur la carte pour indiquer l\'emplacement exact. Cela aide les acheteurs à vous trouver.',
      target: '[data-tutorial="publish-location"]',
      position: 'top'
    },
    {
      id: 'publish-complete',
      title: 'Prêt à publier ! 🎉',
      description: 'Vérifiez les informations et publiez. Votre annonce sera visible immédiatement par tous les utilisateurs.',
      position: 'center'
    }
  ],
  messages: [
    {
      id: 'messages-intro',
      title: 'Messagerie 💬',
      description: 'Communiquez directement avec les vendeurs et acheteurs. Voici comment utiliser la messagerie.',
      position: 'center'
    },
    {
      id: 'messages-conversations',
      title: 'Vos conversations',
      description: 'Retrouvez toutes vos discussions ici. Chaque conversation est liée à une propriété spécifique.',
      target: '[data-tutorial="messages-list"]',
      position: 'bottom'
    },
    {
      id: 'messages-send',
      title: 'Envoyer un message',
      description: 'Tapez votre message et appuyez sur envoyer. Vous pouvez aussi joindre des photos et documents.',
      target: '[data-tutorial="messages-input"]',
      position: 'top'
    },
    {
      id: 'messages-appointment',
      title: 'Prendre rendez-vous',
      description: 'Utilisez le menu (3 points) pour proposer un rendez-vous directement depuis la conversation.',
      target: '[data-tutorial="messages-menu"]',
      position: 'bottom'
    },
    {
      id: 'messages-complete',
      title: 'Restez connecté ! 📱',
      description: 'Les notifications vous alertent des nouveaux messages. Répondez rapidement pour conclure vos affaires.',
      position: 'center'
    }
  ],
  profile: [
    {
      id: 'profile-intro',
      title: 'Votre Profil 👤',
      description: 'Gérez votre compte, vos annonces et vos paramètres. Voici un tour rapide de votre espace.',
      position: 'center'
    },
    {
      id: 'profile-info',
      title: 'Informations personnelles',
      description: 'Cliquez sur l\'icône profil pour voir et modifier vos informations. Un profil complet inspire confiance.',
      target: '[data-tutorial="profile-info"]',
      position: 'bottom'
    },
    {
      id: 'profile-listings',
      title: 'Mes annonces',
      description: 'Retrouvez toutes vos propriétés publiées. Modifiez, activez ou supprimez vos annonces ici.',
      target: '[data-tutorial="profile-listings"]',
      position: 'bottom'
    },
    {
      id: 'profile-appointments',
      title: 'Mes rendez-vous',
      description: 'Gérez les demandes de visite. Acceptez, refusez ou reprogrammez les rendez-vous.',
      target: '[data-tutorial="profile-appointments"]',
      position: 'bottom'
    },
    {
      id: 'profile-favorites',
      title: 'Mes favoris',
      description: 'Retrouvez toutes les propriétés que vous avez sauvegardées d\'un simple clic.',
      target: '[data-tutorial="profile-favorites"]',
      position: 'bottom'
    },
    {
      id: 'profile-settings',
      title: 'Paramètres',
      description: 'Personnalisez votre expérience : notifications, langue, sécurité et plus encore.',
      target: '[data-tutorial="profile-settings"]',
      position: 'bottom'
    },
    {
      id: 'profile-complete',
      title: 'Votre espace ! 🌟',
      description: 'Votre profil est votre vitrine. Gardez-le à jour pour maximiser vos chances de succès.',
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
