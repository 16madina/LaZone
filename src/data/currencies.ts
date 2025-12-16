export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Map country code to currency
export const countryCurrencyMap: Record<string, Currency> = {
  // Zone CFA BCEAO (Franc CFA - XOF)
  'BJ': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Bénin
  'BF': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Burkina Faso
  'CI': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Côte d'Ivoire
  'GW': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Guinée-Bissau
  'ML': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Mali
  'NE': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Niger
  'SN': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Sénégal
  'TG': { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' }, // Togo
  
  // Zone CFA BEAC (Franc CFA - XAF)
  'CM': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Cameroun
  'CF': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Centrafrique
  'TD': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Tchad
  'CG': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Congo
  'GQ': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Guinée équatoriale
  'GA': { code: 'XAF', name: 'Franc CFA', symbol: 'FCFA' }, // Gabon
  
  // Autres pays
  'DZ': { code: 'DZD', name: 'Dinar algérien', symbol: 'DA' },
  'AO': { code: 'AOA', name: 'Kwanza', symbol: 'Kz' },
  'BW': { code: 'BWP', name: 'Pula', symbol: 'P' },
  'BI': { code: 'BIF', name: 'Franc burundais', symbol: 'FBu' },
  'CV': { code: 'CVE', name: 'Escudo capverdien', symbol: '$' },
  'KM': { code: 'KMF', name: 'Franc comorien', symbol: 'FC' },
  'CD': { code: 'CDF', name: 'Franc congolais', symbol: 'FC' },
  'DJ': { code: 'DJF', name: 'Franc djiboutien', symbol: 'Fdj' },
  'EG': { code: 'EGP', name: 'Livre égyptienne', symbol: 'E£' },
  'ER': { code: 'ERN', name: 'Nakfa', symbol: 'Nfk' },
  'SZ': { code: 'SZL', name: 'Lilangeni', symbol: 'L' },
  'ET': { code: 'ETB', name: 'Birr', symbol: 'Br' },
  'GM': { code: 'GMD', name: 'Dalasi', symbol: 'D' },
  'GH': { code: 'GHS', name: 'Cedi', symbol: 'GH₵' },
  'GN': { code: 'GNF', name: 'Franc guinéen', symbol: 'FG' },
  'KE': { code: 'KES', name: 'Shilling kényan', symbol: 'KSh' },
  'LS': { code: 'LSL', name: 'Loti', symbol: 'L' },
  'LR': { code: 'LRD', name: 'Dollar libérien', symbol: 'L$' },
  'LY': { code: 'LYD', name: 'Dinar libyen', symbol: 'LD' },
  'MG': { code: 'MGA', name: 'Ariary', symbol: 'Ar' },
  'MW': { code: 'MWK', name: 'Kwacha', symbol: 'MK' },
  'MR': { code: 'MRU', name: 'Ouguiya', symbol: 'UM' },
  'MU': { code: 'MUR', name: 'Roupie mauricienne', symbol: '₨' },
  'MA': { code: 'MAD', name: 'Dirham', symbol: 'DH' },
  'MZ': { code: 'MZN', name: 'Metical', symbol: 'MT' },
  'NA': { code: 'NAD', name: 'Dollar namibien', symbol: 'N$' },
  'NG': { code: 'NGN', name: 'Naira', symbol: '₦' },
  'RW': { code: 'RWF', name: 'Franc rwandais', symbol: 'FRw' },
  'ST': { code: 'STN', name: 'Dobra', symbol: 'Db' },
  'SC': { code: 'SCR', name: 'Roupie seychelloise', symbol: '₨' },
  'SL': { code: 'SLE', name: 'Leone', symbol: 'Le' },
  'SO': { code: 'SOS', name: 'Shilling somalien', symbol: 'Sh' },
  'ZA': { code: 'ZAR', name: 'Rand', symbol: 'R' },
  'SS': { code: 'SSP', name: 'Livre sud-soudanaise', symbol: '£' },
  'SD': { code: 'SDG', name: 'Livre soudanaise', symbol: 'LS' },
  'TZ': { code: 'TZS', name: 'Shilling tanzanien', symbol: 'TSh' },
  'TN': { code: 'TND', name: 'Dinar tunisien', symbol: 'DT' },
  'UG': { code: 'UGX', name: 'Shilling ougandais', symbol: 'USh' },
  'ZM': { code: 'ZMW', name: 'Kwacha', symbol: 'ZK' },
  'ZW': { code: 'ZWL', name: 'Dollar zimbabwéen', symbol: 'Z$' },
};

export const formatPriceWithCurrency = (price: number, countryCode: string | null): string => {
  const currency = countryCode ? countryCurrencyMap[countryCode] : null;
  
  if (!currency) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }
  
  return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency.symbol;
};

export const getCurrencyByCountry = (countryCode: string | null): Currency | null => {
  if (!countryCode) return null;
  return countryCurrencyMap[countryCode] || null;
};
