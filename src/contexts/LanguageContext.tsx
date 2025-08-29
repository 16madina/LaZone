import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  fr: {
    // Navigation & Header
    'nav.rent': 'Louer',
    'nav.buy': 'Acheter',
    'nav.login': 'Se connecter',
    'nav.language': 'FR',
    
    // Search & Filters
    'search.placeholder': 'Ville, quartier ou adresse...',
    'filters.title': 'Filtres',
    'filters.propertyType': 'Type de bien',
    'filters.price': 'Prix',
    'filters.priceRent': 'Loyer mensuel',
    'filters.priceBuy': 'Prix d\'achat',
    'filters.bedrooms': 'Chambres',
    'filters.bathrooms': 'Salle de bain',
    'filters.area': 'Surface',
    'filters.amenities': 'Commodités',
    'filters.apply': 'Appliquer',
    'filters.reset': 'Réinitialiser',
    'filters.all': 'Toutes',
    
    // Property Types
    'property.apartment': 'Appartement',
    'property.house': 'Maison',
    'property.land': 'Terrain',
    
    // Property Details
    'property.bedrooms': 'chambres',
    'property.bathrooms': 'sdb',
    'property.area': 'm²',
    'property.perMonth': '/mois',
    'property.new': 'Nouveau',
    'property.verified': 'Vérifié',
    'property.featured': 'Exclusivité',
    
    // Actions
    'action.call': 'Appeler',
    'action.message': 'Message',
    'action.schedule': 'Planifier une visite',
    'action.favorite': 'Favoris',
    'action.share': 'Partager',
    'action.back': 'Retour',
    'action.continue': 'Continuer',
    
    // Results
    'results.rentals': 'locations',
    'results.sales': 'ventes',
    'results.noResults': 'Aucun résultat trouvé',
    'results.noResultsDesc': 'Essayez de modifier vos critères de recherche ou vos filtres.',
    'results.modifyFilters': 'Modifier les filtres',
    
    // Map
    'map.searchInArea': 'Rechercher dans cette zone',
    'map.showAll': 'Tout voir',
    
    // Location
    'location.welcome': 'Bienvenue sur LaZone',
    'location.description': 'Découvrez les meilleures propriétés près de chez vous',
    'location.detectPosition': 'Détecter ma position',
    'location.chooseManually': 'Choisir manuellement',
    'location.positionDetected': 'Position détectée',
    'location.useThisPosition': 'Utiliser cette position',
    'location.country': 'Pays',
    'location.city': 'Ville',
    'location.selectCountry': 'Sélectionnez votre pays',
    'location.selectCity': 'Sélectionnez votre ville',
    'location.skipForNow': 'Ignorer pour le moment',
    
    // Agent
    'agent.realEstateAgent': 'Agent immobilier',
    'agent.summary': 'Résumé',
    'agent.propertyType': 'Type',
    'agent.purpose': 'Objectif',
    'agent.surface': 'Surface',
    'agent.published': 'Publié',
    'purpose.rent': 'Location',
    'purpose.sale': 'Vente'
  },
  en: {
    // Navigation & Header
    'nav.rent': 'Rent',
    'nav.buy': 'Buy',
    'nav.login': 'Sign In',
    'nav.language': 'EN',
    
    // Search & Filters
    'search.placeholder': 'City, neighborhood or address...',
    'filters.title': 'Filters',
    'filters.propertyType': 'Property Type',
    'filters.price': 'Price',
    'filters.priceRent': 'Monthly Rent',
    'filters.priceBuy': 'Purchase Price',
    'filters.bedrooms': 'Bedrooms',
    'filters.bathrooms': 'Bathrooms',
    'filters.area': 'Area',
    'filters.amenities': 'Amenities',
    'filters.apply': 'Apply',
    'filters.reset': 'Reset',
    'filters.all': 'All',
    
    // Property Types
    'property.apartment': 'Apartment',
    'property.house': 'House',
    'property.land': 'Land',
    
    // Property Details
    'property.bedrooms': 'bedrooms',
    'property.bathrooms': 'bathrooms',
    'property.area': 'm²',
    'property.perMonth': '/month',
    'property.new': 'New',
    'property.verified': 'Verified',
    'property.featured': 'Featured',
    
    // Actions
    'action.call': 'Call',
    'action.message': 'Message',
    'action.schedule': 'Schedule Visit',
    'action.favorite': 'Favorite',
    'action.share': 'Share',
    'action.back': 'Back',
    'action.continue': 'Continue',
    
    // Results
    'results.rentals': 'rentals',
    'results.sales': 'sales',
    'results.noResults': 'No results found',
    'results.noResultsDesc': 'Try modifying your search criteria or filters.',
    'results.modifyFilters': 'Modify filters',
    
    // Map
    'map.searchInArea': 'Search in this area',
    'map.showAll': 'Show all',
    
    // Location
    'location.welcome': 'Welcome to LaZone',
    'location.description': 'Discover the best properties near you',
    'location.detectPosition': 'Detect my location',
    'location.chooseManually': 'Choose manually',
    'location.positionDetected': 'Location detected',
    'location.useThisPosition': 'Use this location',
    'location.country': 'Country',
    'location.city': 'City',
    'location.selectCountry': 'Select your country',
    'location.selectCity': 'Select your city',
    'location.skipForNow': 'Skip for now',
    
    // Agent
    'agent.realEstateAgent': 'Real Estate Agent',
    'agent.summary': 'Summary',
    'agent.propertyType': 'Type',
    'agent.purpose': 'Purpose',
    'agent.surface': 'Area',
    'agent.published': 'Published',
    'purpose.rent': 'Rental',
    'purpose.sale': 'Sale'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};