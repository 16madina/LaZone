import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  route?: string;
}

const tutorialSteps: TutorialStep[] = [
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

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
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
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem('lazone_tutorial_completed');
    setHasCompletedTutorial(completed === 'true');
  }, []);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
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
    localStorage.setItem('lazone_tutorial_completed', 'true');
    setHasCompletedTutorial(true);
  };

  const completeTutorial = () => {
    setIsActive(false);
    localStorage.setItem('lazone_tutorial_completed', 'true');
    setHasCompletedTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem('lazone_tutorial_completed');
    setHasCompletedTutorial(false);
  };

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStep,
      steps: tutorialSteps,
      startTutorial,
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
