// Currency conversion utility for African countries
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate to CFA
}

export const CURRENCY_RATES: { [country: string]: CurrencyRate } = {
  'Sénégal': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Mali': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Burkina Faso': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Côte d\'Ivoire': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Niger': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Guinée-Bissau': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Togo': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Bénin': { code: 'CFA', name: 'Franc CFA', symbol: 'F CFA', rate: 1 },
  'Maroc': { code: 'MAD', name: 'Dirham Marocain', symbol: 'DH', rate: 0.17 }, // 1 MAD = 0.17 CFA (approx)
  'Tunisie': { code: 'TND', name: 'Dinar Tunisien', symbol: 'د.ت', rate: 0.31 }, // 1 TND = 0.31 CFA (approx)
  'Algérie': { code: 'DZD', name: 'Dinar Algérien', symbol: 'د.ج', rate: 182 }, // 1 CFA = 182 DZD (approx)
  'Nigeria': { code: 'NGN', name: 'Naira Nigérian', symbol: '₦', rate: 2.6 }, // 1 CFA = 2.6 NGN (approx)
  'Ghana': { code: 'GHS', name: 'Cedi Ghanéen', symbol: '₵', rate: 0.015 }, // 1 CFA = 0.015 GHS (approx)
  'Kenya': { code: 'KES', name: 'Shilling Kenyan', symbol: 'KSh', rate: 6.5 }, // 1 CFA = 6.5 KES (approx)
  'Égypte': { code: 'EGP', name: 'Livre Égyptienne', symbol: 'ج.م', rate: 1.5 }, // 1 CFA = 1.5 EGP (approx)
  'Afrique du Sud': { code: 'ZAR', name: 'Rand Sud-Africain', symbol: 'R', rate: 0.037 }, // 1 CFA = 0.037 ZAR (approx)
  'Éthiopie': { code: 'ETB', name: 'Birr Éthiopien', symbol: 'Br', rate: 2.4 }, // 1 CFA = 2.4 ETB (approx)
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