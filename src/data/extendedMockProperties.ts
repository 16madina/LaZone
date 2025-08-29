import { Property } from "@/components/PropertyCard";

// Extended mock data covering major African cities
export const extendedMockProperties: Property[] = [
  // Existing properties (Abidjan, Dakar)
  {
    id: "1",
    title: "Appartement moderne 3 chambres - Cocody",
    price: 850000,
    currency: "CFA",
    location: {
      city: "Abidjan",
      neighborhood: "Cocody",
      coordinates: [-4.0167, 5.3436]
    },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    amenities: ["Climatisation", "Parking", "Sécurité 24/7", "Fibre"],
    isVerified: true,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Koffi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-15"
  },

  // Lagos, Nigeria
  {
    id: "10",
    title: "Luxury 4BR Duplex - Victoria Island",
    price: 2500000,
    currency: "NGN",
    location: {
      city: "Lagos",
      neighborhood: "Victoria Island",
      coordinates: [3.4273, 6.4281]
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    landArea: 400,
    amenities: ["Piscine", "Générateur", "Sécurité 24/7", "Parking", "Climatisation"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Adebayo Johnson",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-18"
  },

  {
    id: "11",
    title: "Modern 2BR Apartment - Lekki Phase 1",
    price: 1200000,
    currency: "NGN",
    location: {
      city: "Lagos",
      neighborhood: "Lekki",
      coordinates: [3.4736, 6.4350]
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    amenities: ["Climatisation", "Parking", "Piscine", "Gym", "Fibre"],
    isVerified: true,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Folake Adeyemi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-20"
  },

  // Accra, Ghana
  {
    id: "12",
    title: "Executive 5BR House - East Legon",
    price: 8500,
    currency: "GHS",
    location: {
      city: "Accra",
      neighborhood: "East Legon",
      coordinates: [-0.1507, 5.6500]
    },
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 5,
    bathrooms: 4,
    area: 280,
    landArea: 600,
    amenities: ["Piscine", "Jardin", "Sécurité 24/7", "Parking", "Climatisation", "Générateur"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Kwame Asante",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-12"
  },

  {
    id: "13",
    title: "Cozy 1BR Apartment - Airport Residential",
    price: 2800,
    currency: "GHS",
    location: {
      city: "Accra",
      neighborhood: "Airport Residential",
      coordinates: [-0.1726, 5.6037]
    },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    amenities: ["Climatisation", "Parking", "Fibre", "Meublé"],
    isVerified: false,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Ama Osei",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
      isVerified: false
    },
    createdAt: "2024-01-22"
  },

  // Nairobi, Kenya
  {
    id: "14",
    title: "Penthouse 4BR - Kilimani",
    price: 180000,
    currency: "KES",
    location: {
      city: "Nairobi",
      neighborhood: "Kilimani",
      coordinates: [36.7833, -1.3000]
    },
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 4,
    bathrooms: 3,
    area: 150,
    amenities: ["Vue panoramique", "Parking", "Ascenseur", "Sécurité 24/7", "Climatisation"],
    isVerified: true,
    isNew: true,
    isFeatured: true,
    agent: {
      name: "Grace Wanjiku",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-19"
  },

  {
    id: "15",
    title: "Family House - Karen",
    price: 35000000,
    currency: "KES",
    location: {
      city: "Nairobi",
      neighborhood: "Karen",
      coordinates: [36.6833, -1.3333]
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    landArea: 800,
    amenities: ["Jardin", "Vue nature", "Parking", "Sécurité", "Cheminée"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "John Kamau",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-10"
  },

  // Douala, Cameroun
  {
    id: "16",
    title: "Villa 5 chambres - Bonanjo",
    price: 1500000,
    currency: "CFA",
    location: {
      city: "Douala",
      neighborhood: "Bonanjo",
      coordinates: [9.7043, 4.0511]
    },
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 5,
    bathrooms: 4,
    area: 250,
    landArea: 500,
    amenities: ["Piscine", "Jardin", "Parking", "Sécurité 24/7", "Climatisation"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Marie Ngono",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-08"
  },

  // Casablanca, Maroc
  {
    id: "17",
    title: "Appartement standing - Maarif",
    price: 8500,
    currency: "MAD",
    location: {
      city: "Casablanca",
      neighborhood: "Maarif",
      coordinates: [-7.6167, 33.5833]
    },
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    amenities: ["Climatisation", "Parking", "Ascenseur", "Balcon", "Fibre"],
    isVerified: true,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Youssef El Alami",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-21"
  },

  {
    id: "18",
    title: "Villa avec piscine - Ain Diab",
    price: 2800000,
    currency: "MAD",
    location: {
      city: "Casablanca",
      neighborhood: "Ain Diab",
      coordinates: [-7.6500, 33.5667]
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "sale",
    bedrooms: 6,
    bathrooms: 5,
    area: 350,
    landArea: 800,
    amenities: ["Piscine", "Vue mer", "Jardin", "Parking", "Sécurité", "Climatisation"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Fatima Benali",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-05"
  },

  // Tunis, Tunisie
  {
    id: "19",
    title: "Duplex moderne - La Marsa",
    price: 1200,
    currency: "TND",
    location: {
      city: "Tunis",
      neighborhood: "La Marsa",
      coordinates: [10.3333, 36.8833]
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    amenities: ["Vue mer", "Balcon", "Parking", "Climatisation", "Meublé"],
    isVerified: true,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Ahmed Ben Salah",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-17"
  },

  // Le Caire, Égypte
  {
    id: "20",
    title: "Apartment in New Cairo - 5th Settlement",
    price: 12000,
    currency: "EGP",
    location: {
      city: "Le Caire",
      neighborhood: "New Cairo",
      coordinates: [31.4953, 30.0209]
    },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    amenities: ["Climatisation", "Parking", "Piscine communautaire", "Sécurité 24/7"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "Omar Hassan",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-14"
  },

  // Johannesburg, Afrique du Sud
  {
    id: "21",
    title: "Luxury Townhouse - Sandton",
    price: 35000,
    currency: "ZAR",
    location: {
      city: "Johannesburg",
      neighborhood: "Sandton",
      coordinates: [28.0436, -26.1076]
    },
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    landArea: 300,
    amenities: ["Piscine", "Jardin", "Sécurité 24/7", "Parking", "Climatisation"],
    isVerified: true,
    isNew: true,
    isFeatured: true,
    agent: {
      name: "Nomsa Mthembu",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-16"
  },

  {
    id: "22",
    title: "Modern Apartment - Rosebank",
    price: 18000,
    currency: "ZAR",
    location: {
      city: "Johannesburg",
      neighborhood: "Rosebank",
      coordinates: [28.0406, -26.1467]
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    amenities: ["Balcon", "Parking", "Sécurité", "Fibre", "Ascenseur"],
    isVerified: false,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "David Van Der Merwe",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
      isVerified: false
    },
    createdAt: "2024-01-11"
  },

  // Addis-Abeba, Éthiopie
  {
    id: "23",
    title: "Modern Villa - Bole",
    price: 85000,
    currency: "ETB",
    location: {
      city: "Addis-Abeba",
      neighborhood: "Bole",
      coordinates: [38.7875, 8.9806]
    },
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    landArea: 400,
    amenities: ["Jardin", "Parking", "Sécurité", "Générateur"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "Hanan Yosef",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-09"
  },

  // Lomé, Togo
  {
    id: "24",
    title: "Appartement 2 chambres - Centre-ville",
    price: 450000,
    currency: "CFA",
    location: {
      city: "Lomé",
      neighborhood: "Centre-ville",
      coordinates: [1.2255, 6.1319]
    },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    amenities: ["Climatisation", "Parking", "Balcon"],
    isVerified: false,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Kossi Agbemavor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
      isVerified: false
    },
    createdAt: "2024-01-23"
  },

  // Cotonou, Bénin
  {
    id: "25",
    title: "Maison familiale - Fidjrossè",
    price: 750000,
    currency: "CFA",
    location: {
      city: "Cotonou",
      neighborhood: "Fidjrossè",
      coordinates: [2.3833, 6.3667]
    },
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    landArea: 200,
    amenities: ["Jardin", "Parking", "Puits"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "Sylvie Dossou",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-07"
  }
];

// Currency formatting helper
export const formatCurrency = (amount: number, currency: string): string => {
  const formatters: { [key: string]: Intl.NumberFormat } = {
    'CFA': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }),
    'NGN': new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }),
    'GHS': new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }),
    'KES': new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }),
    'MAD': new Intl.NumberFormat('ar-MA', { style: 'currency', currency: 'MAD' }),
    'TND': new Intl.NumberFormat('ar-TN', { style: 'currency', currency: 'TND' }),
    'EGP': new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }),
    'ZAR': new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }),
    'ETB': new Intl.NumberFormat('am-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 })
  };

  const formatter = formatters[currency];
  if (formatter) {
    return formatter.format(amount).replace(/[A-Z]{3}/, currency);
  }
  
  return `${amount.toLocaleString()} ${currency}`;
};

// Filter properties by country/city
export const getPropertiesByLocation = (city?: string, country?: string) => {
  if (city) {
    return extendedMockProperties.filter(p => p.location.city === city);
  }
  if (country) {
    // Map countries to cities for filtering
    const cityMapping: { [key: string]: string[] } = {
      'Côte d\'Ivoire': ['Abidjan'],
      'Sénégal': ['Dakar'],
      'Nigeria': ['Lagos'],
      'Ghana': ['Accra'],
      'Cameroun': ['Douala'],
      'Kenya': ['Nairobi'],
      'Maroc': ['Casablanca'],
      'Tunisie': ['Tunis'],
      'Égypte': ['Le Caire'],
      'Afrique du Sud': ['Johannesburg'],
      'Éthiopie': ['Addis-Abeba'],
      'Togo': ['Lomé'],
      'Bénin': ['Cotonou']
    };
    
    const cities = cityMapping[country] || [];
    return extendedMockProperties.filter(p => cities.includes(p.location.city));
  }
  return extendedMockProperties;
};
