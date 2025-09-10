// Données des pays du monde avec drapeaux, indicatifs et devises
export interface CountryData {
  code: string;
  name: string;
  currency: string;
  flag: string;
  phoneCode: string;
  cities: string[];
  isAfrican: boolean;
}

export const WORLDWIDE_COUNTRIES: CountryData[] = [
  // Pays africains (pour les annonces)
  { code: 'CI', name: "Côte d'Ivoire", currency: 'CFA', flag: '🇨🇮', phoneCode: '+225', cities: ['Abidjan', 'Bouaké', 'Daloa'], isAfrican: true },
  { code: 'SN', name: 'Sénégal', currency: 'CFA', flag: '🇸🇳', phoneCode: '+221', cities: ['Dakar', 'Thiès', 'Kaolack'], isAfrican: true },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', phoneCode: '+234', cities: ['Lagos', 'Kano', 'Ibadan', 'Port Harcourt'], isAfrican: true },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭', phoneCode: '+233', cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'], isAfrican: true },
  { code: 'CM', name: 'Cameroun', currency: 'CFA', flag: '🇨🇲', phoneCode: '+237', cities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda'], isAfrican: true },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', phoneCode: '+254', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], isAfrican: true },
  { code: 'MA', name: 'Maroc', currency: 'MAD', flag: '🇲🇦', phoneCode: '+212', cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'], isAfrican: true },
  { code: 'TN', name: 'Tunisie', currency: 'TND', flag: '🇹🇳', phoneCode: '+216', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'], isAfrican: true },
  { code: 'EG', name: 'Égypte', currency: 'EGP', flag: '🇪🇬', phoneCode: '+20', cities: ['Le Caire', 'Alexandrie', 'Giza', 'Louxor'], isAfrican: true },
  { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', flag: '🇿🇦', phoneCode: '+27', cities: ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria'], isAfrican: true },
  { code: 'ET', name: 'Éthiopie', currency: 'ETB', flag: '🇪🇹', phoneCode: '+251', cities: ['Addis-Abeba', 'Dire Dawa', 'Mekelle', 'Gondar'], isAfrican: true },
  { code: 'TG', name: 'Togo', currency: 'CFA', flag: '🇹🇬', phoneCode: '+228', cities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé'], isAfrican: true },
  { code: 'BJ', name: 'Bénin', currency: 'CFA', flag: '🇧🇯', phoneCode: '+229', cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey'], isAfrican: true },
  { code: 'BF', name: 'Burkina Faso', currency: 'CFA', flag: '🇧🇫', phoneCode: '+226', cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'], isAfrican: true },
  { code: 'ML', name: 'Mali', currency: 'CFA', flag: '🇲🇱', phoneCode: '+223', cities: ['Bamako', 'Sikasso', 'Mopti'], isAfrican: true },
  { code: 'NE', name: 'Niger', currency: 'CFA', flag: '🇳🇪', phoneCode: '+227', cities: ['Niamey', 'Zinder', 'Maradi'], isAfrican: true },
  { code: 'TD', name: 'Tchad', currency: 'CFA', flag: '🇹🇩', phoneCode: '+235', cities: ['N\'Djamena', 'Moundou', 'Sarh'], isAfrican: true },
  { code: 'GA', name: 'Gabon', currency: 'CFA', flag: '🇬🇦', phoneCode: '+241', cities: ['Libreville', 'Port-Gentil', 'Franceville'], isAfrican: true },
  { code: 'GQ', name: 'Guinée équatoriale', currency: 'CFA', flag: '🇬🇶', phoneCode: '+240', cities: ['Malabo', 'Bata'], isAfrican: true },
  { code: 'CF', name: 'République centrafricaine', currency: 'CFA', flag: '🇨🇫', phoneCode: '+236', cities: ['Bangui', 'Berbérati'], isAfrican: true },
  { code: 'CG', name: 'République du Congo', currency: 'CFA', flag: '🇨🇬', phoneCode: '+242', cities: ['Brazzaville', 'Pointe-Noire'], isAfrican: true },
  { code: 'CD', name: 'République démocratique du Congo', currency: 'CDF', flag: '🇨🇩', phoneCode: '+243', cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi'], isAfrican: true },

  // Pays européens
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷', phoneCode: '+33', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'], isAfrican: false },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', flag: '🇩🇪', phoneCode: '+49', cities: ['Berlin', 'Munich', 'Hambourg', 'Cologne'], isAfrican: false },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', flag: '🇬🇧', phoneCode: '+44', cities: ['Londres', 'Manchester', 'Birmingham', 'Glasgow'], isAfrican: false },
  { code: 'IT', name: 'Italie', currency: 'EUR', flag: '🇮🇹', phoneCode: '+39', cities: ['Rome', 'Milan', 'Naples', 'Turin'], isAfrican: false },
  { code: 'ES', name: 'Espagne', currency: 'EUR', flag: '🇪🇸', phoneCode: '+34', cities: ['Madrid', 'Barcelone', 'Valence', 'Séville'], isAfrican: false },
  { code: 'PT', name: 'Portugal', currency: 'EUR', flag: '🇵🇹', phoneCode: '+351', cities: ['Lisbonne', 'Porto', 'Braga'], isAfrican: false },
  { code: 'BE', name: 'Belgique', currency: 'EUR', flag: '🇧🇪', phoneCode: '+32', cities: ['Bruxelles', 'Anvers', 'Gand'], isAfrican: false },
  { code: 'NL', name: 'Pays-Bas', currency: 'EUR', flag: '🇳🇱', phoneCode: '+31', cities: ['Amsterdam', 'Rotterdam', 'La Haye'], isAfrican: false },
  { code: 'CH', name: 'Suisse', currency: 'CHF', flag: '🇨🇭', phoneCode: '+41', cities: ['Zurich', 'Genève', 'Bâle'], isAfrican: false },

  // Pays d'Amérique du Nord
  { code: 'US', name: 'États-Unis', currency: 'USD', flag: '🇺🇸', phoneCode: '+1', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'], isAfrican: false },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦', phoneCode: '+1', cities: ['Toronto', 'Montréal', 'Vancouver', 'Calgary'], isAfrican: false },
  { code: 'MX', name: 'Mexique', currency: 'MXN', flag: '🇲🇽', phoneCode: '+52', cities: ['Mexico', 'Guadalajara', 'Monterrey'], isAfrican: false },

  // Pays d'Asie
  { code: 'CN', name: 'Chine', currency: 'CNY', flag: '🇨🇳', phoneCode: '+86', cities: ['Pékin', 'Shanghai', 'Guangzhou', 'Shenzhen'], isAfrican: false },
  { code: 'JP', name: 'Japon', currency: 'JPY', flag: '🇯🇵', phoneCode: '+81', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'], isAfrican: false },
  { code: 'KR', name: 'Corée du Sud', currency: 'KRW', flag: '🇰🇷', phoneCode: '+82', cities: ['Séoul', 'Busan', 'Incheon'], isAfrican: false },
  { code: 'IN', name: 'Inde', currency: 'INR', flag: '🇮🇳', phoneCode: '+91', cities: ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai'], isAfrican: false },

  // Pays du Moyen-Orient
  { code: 'AE', name: 'Émirats arabes unis', currency: 'AED', flag: '🇦🇪', phoneCode: '+971', cities: ['Dubaï', 'Abu Dhabi', 'Sharjah'], isAfrican: false },
  { code: 'SA', name: 'Arabie saoudite', currency: 'SAR', flag: '🇸🇦', phoneCode: '+966', cities: ['Riyad', 'Jeddah', 'Dammam'], isAfrican: false },
  { code: 'QA', name: 'Qatar', currency: 'QAR', flag: '🇶🇦', phoneCode: '+974', cities: ['Doha', 'Al Rayyan'], isAfrican: false },

  // Pays d'Océanie
  { code: 'AU', name: 'Australie', currency: 'AUD', flag: '🇦🇺', phoneCode: '+61', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'], isAfrican: false },
  { code: 'NZ', name: 'Nouvelle-Zélande', currency: 'NZD', flag: '🇳🇿', phoneCode: '+64', cities: ['Auckland', 'Wellington', 'Christchurch'], isAfrican: false },

  // Pays d'Amérique du Sud
  { code: 'BR', name: 'Brésil', currency: 'BRL', flag: '🇧🇷', phoneCode: '+55', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília'], isAfrican: false },
  { code: 'AR', name: 'Argentine', currency: 'ARS', flag: '🇦🇷', phoneCode: '+54', cities: ['Buenos Aires', 'Córdoba', 'Rosario'], isAfrican: false }
];

// Fonctions utilitaires
export const getCountryByName = (name: string): CountryData | undefined => {
  return WORLDWIDE_COUNTRIES.find(c => c.name === name);
};

export const getCountryByCode = (code: string): CountryData | undefined => {
  return WORLDWIDE_COUNTRIES.find(c => c.code === code);
};

export const getAfricanCountries = (): CountryData[] => {
  return WORLDWIDE_COUNTRIES.filter(c => c.isAfrican);
};

export const getAllCountries = (): CountryData[] => {
  return WORLDWIDE_COUNTRIES;
};

export const isAfricanCountry = (countryName: string): boolean => {
  const country = getCountryByName(countryName);
  return country?.isAfrican || false;
};