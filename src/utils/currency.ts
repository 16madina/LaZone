// Currency formatting utility
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  // African currencies
  'CFA': 'F CFA',
  'NGN': '₦',
  'GHS': '₵',
  'KES': 'KSh',
  'MAD': 'DH',
  'TND': 'د.ت',
  'EGP': 'ج.م',
  'ZAR': 'R',
  'ETB': 'Br',
  'CDF': 'FC',
  
  // International currencies  
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'JPY': '¥',
  'CNY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'KRW': '₩',
  'INR': '₹',
  'BRL': 'R$',
  'MXN': '$',
  'AED': 'د.إ',
  'SAR': 'ر.س',
  'QAR': 'ر.ق',
  'NZD': 'NZ$',
  'ARS': '$'
};

export const formatPrice = (price: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Format number with thousands separators
  const formattedNumber = new Intl.NumberFormat('fr-FR').format(price);
  
  // For CFA, put symbol after the number
  if (currency === 'CFA') {
    return `${formattedNumber} ${symbol}`;
  }
  
  // For other currencies, put symbol before
  return `${symbol} ${formattedNumber}`;
};

export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};