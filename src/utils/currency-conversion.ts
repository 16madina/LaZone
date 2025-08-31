// Extended currency conversion utility for worldwide countries
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate to CFA
}

export const CURRENCY_RATES: { [country: string]: CurrencyRate } = {
  // African Countries (CFA Zone)
  'Sénégal': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Mali': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Burkina Faso': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Côte d\'Ivoire': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Niger': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Guinée-Bissau': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Togo': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Bénin': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Cameroun': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Tchad': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Gabon': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'République centrafricaine': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'République du Congo': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Guinée équatoriale': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  
  // Other African Countries
  'Maroc': { code: 'MAD', name: 'Dirham Marocain', symbol: 'DH', rate: 0.17 },
  'Tunisie': { code: 'TND', name: 'Dinar Tunisien', symbol: 'د.ت', rate: 0.31 },
  'Algérie': { code: 'DZD', name: 'Dinar Algérien', symbol: 'د.ج', rate: 182 },
  'Nigeria': { code: 'NGN', name: 'Naira Nigérian', symbol: '₦', rate: 2.6 },
  'Ghana': { code: 'GHS', name: 'Cedi Ghanéen', symbol: '₵', rate: 0.015 },
  'Kenya': { code: 'KES', name: 'Shilling Kenyan', symbol: 'KSh', rate: 6.5 },
  'Égypte': { code: 'EGP', name: 'Livre Égyptienne', symbol: 'ج.م', rate: 1.5 },
  'Afrique du Sud': { code: 'ZAR', name: 'Rand Sud-Africain', symbol: 'R', rate: 0.037 },
  'Éthiopie': { code: 'ETB', name: 'Birr Éthiopien', symbol: 'Br', rate: 2.4 },
  'République démocratique du Congo': { code: 'CDF', name: 'Franc Congolais', symbol: 'FC', rate: 1640 },
  
  // European Countries
  'France': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Allemagne': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Royaume-Uni': { code: 'GBP', name: 'Livre Sterling', symbol: '£', rate: 0.0013 },
  'Italie': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Espagne': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Portugal': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Belgique': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Pays-Bas': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  'Suisse': { code: 'CHF', name: 'Franc Suisse', symbol: 'CHF', rate: 0.0015 },
  
  // North American Countries  
  'États-Unis': { code: 'USD', name: 'Dollar Américain', symbol: '$', rate: 0.0016 },
  'Canada': { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 0.0022 },
  'Mexique': { code: 'MXN', name: 'Peso Mexicain', symbol: '$', rate: 0.029 },
  
  // Asian Countries
  'Chine': { code: 'CNY', name: 'Yuan Chinois', symbol: '¥', rate: 0.012 },
  'Japon': { code: 'JPY', name: 'Yen Japonais', symbol: '¥', rate: 0.24 },
  'Corée du Sud': { code: 'KRW', name: 'Won Sud-Coréen', symbol: '₩', rate: 2.1 },
  'Inde': { code: 'INR', name: 'Roupie Indienne', symbol: '₹', rate: 0.14 },
  
  // Middle Eastern Countries
  'Émirats arabes unis': { code: 'AED', name: 'Dirham des EAU', symbol: 'د.إ', rate: 0.006 },
  'Arabie saoudite': { code: 'SAR', name: 'Riyal Saoudien', symbol: 'ر.س', rate: 0.006 },  
  'Qatar': { code: 'QAR', name: 'Riyal Qatarien', symbol: 'ر.ق', rate: 0.006 },
  
  // Oceania Countries
  'Australie': { code: 'AUD', name: 'Dollar Australien', symbol: 'A$', rate: 0.0025 },
  'Nouvelle-Zélande': { code: 'NZD', name: 'Dollar Néo-Zélandais', symbol: 'NZ$', rate: 0.0027 },
  
  // South American Countries
  'Brésil': { code: 'BRL', name: 'Real Brésilien', symbol: 'R$', rate: 0.0087 },
  'Argentine': { code: 'ARS', name: 'Peso Argentin', symbol: '$', rate: 1.4 }
};

export const convertFromCFA = (amountCFA: number, targetCountry: string): number => {
  const currency = CURRENCY_RATES[targetCountry];
  if (!currency) return amountCFA; // Return CFA if country not found
  
  if (currency.code === 'CFA') return amountCFA;
  
  // Convert CFA to target currency
  return Math.round(amountCFA * currency.rate);
};

export const convertToCFA = (amount: number, sourceCountry: string): number => {
  const currency = CURRENCY_RATES[sourceCountry];
  if (!currency) return amount; // Return as is if country not found
  
  if (currency.code === 'CFA') return amount;
  
  // Convert target currency to CFA
  return Math.round(amount / currency.rate);
};

export const getCurrencyForCountry = (country: string): CurrencyRate => {
  return CURRENCY_RATES[country] || CURRENCY_RATES['Sénégal']; // Default to CFA
};

export const formatPriceForCountry = (amountCFA: number, country: string): string => {
  const currency = getCurrencyForCountry(country);
  const convertedAmount = convertFromCFA(amountCFA, country);
  
  // Format number with thousands separators
  const formattedNumber = new Intl.NumberFormat('fr-FR').format(convertedAmount);
  
  // For CFA, put symbol after the number
  if (currency.code === 'CFA') {
    return `${formattedNumber} ${currency.symbol}`;
  }
  
  // For other currencies, put symbol before
  return `${currency.symbol} ${formattedNumber}`;
};