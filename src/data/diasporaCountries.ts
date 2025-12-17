export interface DiasporaCountry {
  code: string;
  name: string;
  region: 'americas' | 'europe' | 'asia';
  phoneCode: string;
}

export const diasporaCountries: DiasporaCountry[] = [
  // Amérique du Nord
  { code: 'CA', name: 'Canada', region: 'americas', phoneCode: '+1' },
  { code: 'US', name: 'États-Unis', region: 'americas', phoneCode: '+1' },
  { code: 'MX', name: 'Mexique', region: 'americas', phoneCode: '+52' },
  
  // Amérique du Sud
  { code: 'BR', name: 'Brésil', region: 'americas', phoneCode: '+55' },
  { code: 'AR', name: 'Argentine', region: 'americas', phoneCode: '+54' },
  { code: 'CO', name: 'Colombie', region: 'americas', phoneCode: '+57' },
  { code: 'CL', name: 'Chili', region: 'americas', phoneCode: '+56' },
  
  // Caraïbes
  { code: 'HT', name: 'Haïti', region: 'americas', phoneCode: '+509' },
  { code: 'GP', name: 'Guadeloupe', region: 'americas', phoneCode: '+590' },
  { code: 'MQ', name: 'Martinique', region: 'americas', phoneCode: '+596' },
  { code: 'GF', name: 'Guyane française', region: 'americas', phoneCode: '+594' },
  
  // Europe de l'Ouest
  { code: 'FR', name: 'France', region: 'europe', phoneCode: '+33' },
  { code: 'BE', name: 'Belgique', region: 'europe', phoneCode: '+32' },
  { code: 'CH', name: 'Suisse', region: 'europe', phoneCode: '+41' },
  { code: 'DE', name: 'Allemagne', region: 'europe', phoneCode: '+49' },
  { code: 'GB', name: 'Royaume-Uni', region: 'europe', phoneCode: '+44' },
  { code: 'NL', name: 'Pays-Bas', region: 'europe', phoneCode: '+31' },
  { code: 'IT', name: 'Italie', region: 'europe', phoneCode: '+39' },
  { code: 'ES', name: 'Espagne', region: 'europe', phoneCode: '+34' },
  { code: 'PT', name: 'Portugal', region: 'europe', phoneCode: '+351' },
  { code: 'LU', name: 'Luxembourg', region: 'europe', phoneCode: '+352' },
  { code: 'AT', name: 'Autriche', region: 'europe', phoneCode: '+43' },
  { code: 'IE', name: 'Irlande', region: 'europe', phoneCode: '+353' },
  
  // Europe du Nord
  { code: 'SE', name: 'Suède', region: 'europe', phoneCode: '+46' },
  { code: 'NO', name: 'Norvège', region: 'europe', phoneCode: '+47' },
  { code: 'DK', name: 'Danemark', region: 'europe', phoneCode: '+45' },
  { code: 'FI', name: 'Finlande', region: 'europe', phoneCode: '+358' },
  
  // Asie
  { code: 'CN', name: 'Chine', region: 'asia', phoneCode: '+86' },
  { code: 'JP', name: 'Japon', region: 'asia', phoneCode: '+81' },
  { code: 'KR', name: 'Corée du Sud', region: 'asia', phoneCode: '+82' },
  { code: 'AE', name: 'Émirats arabes unis', region: 'asia', phoneCode: '+971' },
  { code: 'SA', name: 'Arabie saoudite', region: 'asia', phoneCode: '+966' },
  { code: 'QA', name: 'Qatar', region: 'asia', phoneCode: '+974' },
  { code: 'SG', name: 'Singapour', region: 'asia', phoneCode: '+65' },
  { code: 'MY', name: 'Malaisie', region: 'asia', phoneCode: '+60' },
  { code: 'TH', name: 'Thaïlande', region: 'asia', phoneCode: '+66' },
  { code: 'IN', name: 'Inde', region: 'asia', phoneCode: '+91' },
  { code: 'IL', name: 'Israël', region: 'asia', phoneCode: '+972' },
  { code: 'TR', name: 'Turquie', region: 'asia', phoneCode: '+90' },
  { code: 'LB', name: 'Liban', region: 'asia', phoneCode: '+961' },
];

export const getRegionLabel = (region: 'americas' | 'europe' | 'asia'): string => {
  switch (region) {
    case 'americas': return '🌎 Amériques';
    case 'europe': return '🌍 Europe';
    case 'asia': return '🌏 Asie';
  }
};
