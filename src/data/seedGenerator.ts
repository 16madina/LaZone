import { Property } from "@/components/PropertyCard";

// City data with coordinates and market info
export const cities = {
  // Côte d'Ivoire
  "Abidjan": { coordinates: [-4.0167, 5.3436], currency: "XOF", country: "CI", priceMultiplier: 1.0 },
  "Bouaké": { coordinates: [-5.0333, 7.6833], currency: "XOF", country: "CI", priceMultiplier: 0.6 },
  "Yamoussoukro": { coordinates: [-5.2767, 6.8167], currency: "XOF", country: "CI", priceMultiplier: 0.7 },
  
  // Sénégal
  "Dakar": { coordinates: [-17.4441, 14.6928], currency: "XOF", country: "SN", priceMultiplier: 1.0 },
  "Thiès": { coordinates: [-16.9262, 14.7886], currency: "XOF", country: "SN", priceMultiplier: 0.5 },
  
  // Bénin
  "Cotonou": { coordinates: [2.3158, 6.3703], currency: "XOF", country: "BJ", priceMultiplier: 0.7 },
  "Porto-Novo": { coordinates: [2.6036, 6.4969], currency: "XOF", country: "BJ", priceMultiplier: 0.5 },
  
  // Togo
  "Lomé": { coordinates: [1.2255, 6.1319], currency: "XOF", country: "TG", priceMultiplier: 0.6 },
  
  // Nigeria
  "Lagos": { coordinates: [3.3792, 6.5244], currency: "NGN", country: "NG", priceMultiplier: 1.0 },
  "Abuja": { coordinates: [7.5399, 9.0765], currency: "NGN", country: "NG", priceMultiplier: 0.9 },
  
  // Ghana
  "Accra": { coordinates: [-0.1969, 5.6037], currency: "GHS", country: "GH", priceMultiplier: 1.0 },
  "Kumasi": { coordinates: [-1.6244, 6.6885], currency: "GHS", country: "GH", priceMultiplier: 0.6 },
  
  // Cameroun
  "Douala": { coordinates: [9.7043, 4.0511], currency: "XAF", country: "CM", priceMultiplier: 1.0 },
  "Yaoundé": { coordinates: [11.5174, 3.8480], currency: "XAF", country: "CM", priceMultiplier: 0.9 },
  
  // Kenya
  "Nairobi": { coordinates: [36.8219, -1.2921], currency: "KES", country: "KE", priceMultiplier: 1.0 },
  "Mombasa": { coordinates: [39.6682, -4.0435], currency: "KES", country: "KE", priceMultiplier: 0.7 },
  
  // Maroc
  "Casablanca": { coordinates: [-7.6167, 33.5833], currency: "MAD", country: "MA", priceMultiplier: 1.0 },
  "Rabat": { coordinates: [-6.8326, 34.0209], currency: "MAD", country: "MA", priceMultiplier: 0.8 },
  "Marrakech": { coordinates: [-7.9811, 31.6295], currency: "MAD", country: "MA", priceMultiplier: 0.7 },
  
  // Tunisie
  "Tunis": { coordinates: [10.1815, 36.8065], currency: "TND", country: "TN", priceMultiplier: 1.0 },
  "Sfax": { coordinates: [10.7600, 34.7400], currency: "TND", country: "TN", priceMultiplier: 0.6 },
  
  // Égypte
  "Le Caire": { coordinates: [31.2357, 30.0444], currency: "EGP", country: "EG", priceMultiplier: 1.0 },
  "Alexandrie": { coordinates: [29.9187, 31.2001], currency: "EGP", country: "EG", priceMultiplier: 0.8 },
  
  // Afrique du Sud
  "Johannesburg": { coordinates: [28.0473, -26.2041], currency: "ZAR", country: "ZA", priceMultiplier: 1.0 },
  "Le Cap": { coordinates: [18.4241, -33.9249], currency: "ZAR", country: "ZA", priceMultiplier: 1.1 },
};

// Neighborhoods for each city
export const neighborhoods: Record<string, string[]> = {
  "Abidjan": ["Cocody", "Plateau", "Marcory", "Adjamé", "Yopougon", "Treichville"],
  "Bouaké": ["Centre-ville", "Koko", "Dar-Es-Salam", "Kennedy"],
  "Yamoussoukro": ["Centre-ville", "Morofe", "N'Zuessy"],
  "Dakar": ["Plateau", "Almadies", "Ngor", "Yoff", "Point E", "Fann"],
  "Thiès": ["Centre-ville", "Randoulène", "Cité Senghor"],
  "Cotonou": ["Ganhi", "Cadjehoun", "Fidjrossè", "Akpakpa", "Centre-ville"],
  "Porto-Novo": ["Centre-ville", "Djegan", "Tokpota"],
  "Lomé": ["Centre-ville", "Bè", "Nyékonakpoè", "Adidogomé"],
  "Lagos": ["Victoria Island", "Ikoyi", "Lekki", "Surulere", "Ikeja", "Gbagada"],
  "Abuja": ["Maitama", "Asokoro", "Garki", "Wuse", "Gwarinpa"],
  "Accra": ["East Legon", "Airport Residential", "Labone", "Adabraka", "Osu", "Tema"],
  "Kumasi": ["Adum", "Asafo", "Bantama", "Nhyiaeso"],
  "Douala": ["Bonanjo", "Akwa", "Bonapriso", "Makepe", "Bassa"],
  "Yaoundé": ["Centre-ville", "Bastos", "Nlongkak", "Mvan", "Essos"],
  "Nairobi": ["Westlands", "Kilimani", "Karen", "Runda", "Kileleshwa", "Lavington"],
  "Mombasa": ["Nyali", "Bamburi", "Tudor", "Ganjoni"],
  "Casablanca": ["Maarif", "Ain Diab", "Racine", "Bourgogne", "Gauthier"],
  "Rabat": ["Agdal", "Hassan", "Hay Riad", "Souissi", "Centre-ville"],
  "Marrakech": ["Gueliz", "Hivernage", "Medina", "Sidi Ghanem", "Targa"],
  "Tunis": ["Centre-ville", "La Marsa", "Sidi Bou Said", "Carthage", "Ariana"],
  "Sfax": ["Centre-ville", "Sakiet Eddaier", "Sakiet Ezzit"],
  "Le Caire": ["Zamalek", "Maadi", "New Cairo", "Heliopolis", "Downtown"],
  "Alexandrie": ["Stanley", "Gleem", "Sidi Gaber", "Montazah"],
  "Johannesburg": ["Sandton", "Rosebank", "Melville", "Parkhurst", "Houghton"],
  "Le Cap": ["City Bowl", "Sea Point", "Camps Bay", "Constantia", "Claremont"],
};

// Base prices for rent (monthly) and sale by property type and currency
export const basePrices = {
  rent: {
    XOF: { apartment: 400000, house: 800000, land: 50000 },
    NGN: { apartment: 800000, house: 1500000, land: 100000 },
    GHS: { apartment: 2000, house: 4000, land: 300 },
    XAF: { apartment: 400000, house: 800000, land: 50000 },
    KES: { apartment: 80000, house: 150000, land: 10000 },
    MAD: { apartment: 4000, house: 8000, land: 500 },
    TND: { apartment: 800, house: 1500, land: 100 },
    EGP: { apartment: 8000, house: 15000, land: 1000 },
    ZAR: { apartment: 15000, house: 25000, land: 2000 },
  },
  sale: {
    XOF: { apartment: 25000000, house: 80000000, land: 5000000 },
    NGN: { apartment: 50000000, house: 150000000, land: 10000000 },
    GHS: { apartment: 150000, house: 400000, land: 30000 },
    XAF: { apartment: 25000000, house: 80000000, land: 5000000 },
    KES: { apartment: 8000000, house: 25000000, land: 1500000 },
    MAD: { apartment: 800000, house: 2000000, land: 150000 },
    TND: { apartment: 200000, house: 500000, land: 50000 },
    EGP: { apartment: 2000000, house: 5000000, land: 500000 },
    ZAR: { apartment: 2000000, house: 4000000, land: 500000 },
  }
};

// Amenities pool
export const amenities = [
  "Climatisation", "Parking", "Piscine", "Jardin", "Sécurité 24/7",
  "Fibre optique", "Meublé", "Balcon", "Terrasse", "Vue mer",
  "Vue jardin", "Ascenseur", "Générateur", "Panneau solaire",
  "Cheminée", "Jacuzzi", "Garage", "Cave", "Buanderie", "Bureau"
];

// Agent names by country
export const agentNames: Record<string, string[]> = {
  CI: ["Koffi Mensah", "Aya Traoré", "Kouadio Yapi", "Aminata Koné"],
  SN: ["Mamadou Diallo", "Fatou Sall", "Ousmane Ndiaye", "Aïcha Ba"],
  BJ: ["Sèdjro Akplogan", "Mariama Cissé", "Kodjo Dossou", "Fatoumata Alou"],
  TG: ["Kossi Agbemavor", "Afi Nyaku", "Kofi Mensah", "Akosua Asante"],
  NG: ["Adebayo Johnson", "Folake Adeyemi", "Chinedu Okeke", "Kemi Adebayo"],
  GH: ["Kwame Asante", "Ama Osei", "Kofi Boateng", "Akosua Mensah"],
  CM: ["Marie Ngono", "Jean-Paul Mballa", "Françoise Ndongo", "André Manga"],
  KE: ["Grace Wanjiku", "John Kamau", "Mary Njeri", "Peter Otieno"],
  MA: ["Youssef El Alami", "Fatima Benali", "Omar Tazi", "Leila Idrissi"],
  TN: ["Ahmed Ben Salah", "Sonia Mzoughi", "Karim Bouali", "Nadia Trabelsi"],
  EG: ["Omar Hassan", "Mona Abdel Rahman", "Ahmed Farouk", "Yasmin Nour"],
  ZA: ["Nomsa Mthembu", "David Van Der Merwe", "Thandiwe Nkomo", "Johan Botha"],
};

// Real estate images by property type
export const realEstateImages = {
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&crop=center", // Modern apartment living room
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&crop=center", // Apartment interior
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&crop=center", // Modern studio
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop&crop=center", // Duplex interior
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&crop=center", // Luxury apartment
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=500&fit=crop&crop=center", // Apartment bedroom
    "https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=800&h=500&fit=crop&crop=center", // Apartment kitchen
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=500&fit=crop&crop=center", // Modern condo
  ],
  house: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&crop=center", // Modern villa
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center", // House with pool
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&crop=center", // Family house
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&crop=center", // Contemporary villa
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop&crop=center", // Beautiful house
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&crop=center", // House exterior
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop&crop=center", // Modern house
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop&crop=center", // House with garden
  ],
  land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&crop=center", // Empty land
    "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&h=500&fit=crop&crop=center", // Building plot
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop&crop=center", // Land with trees
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop&crop=center", // Open field
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop&crop=center", // Rural land
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=500&fit=crop&crop=center", // Agricultural land
  ]
};

// Property titles by type and language
export const propertyTitles = {
  apartment: {
    fr: ["Appartement moderne", "Studio lumineux", "Duplex spacieux", "Penthouse luxueux", "F2 rénové", "T3 avec balcon"],
    en: ["Modern apartment", "Bright studio", "Spacious duplex", "Luxury penthouse", "Renovated 2BR", "3BR with balcony"]
  },
  house: {
    fr: ["Villa contemporaine", "Maison familiale", "Résidence de standing", "Pavillon avec jardin", "Villa avec piscine", "Maison neuve"],
    en: ["Contemporary villa", "Family house", "Executive residence", "House with garden", "Villa with pool", "Brand new house"]
  },
  land: {
    fr: ["Terrain constructible", "Parcelle viabilisée", "Terrain en lotissement", "Terrain avec vue", "Parcelle résidentielle", "Terrain commercial"],
    en: ["Building plot", "Serviced land", "Plot in subdivision", "Land with view", "Residential plot", "Commercial land"]
  }
};

export function generateSeedData(): Property[] {
  const properties: Property[] = [];
  let currentId = 1;

  // Generate properties for each city
  Object.entries(cities).forEach(([cityName, cityData]) => {
    const cityNeighborhoods = neighborhoods[cityName] || ["Centre-ville"];
    const propertiesPerCity = cityName === "Lagos" || cityName === "Abidjan" || cityName === "Dakar" || cityName === "Nairobi" ? 20 : 
                              cityName === "Casablanca" || cityName === "Le Caire" || cityName === "Johannesburg" ? 15 : 10;

    for (let i = 0; i < propertiesPerCity; i++) {
      const propertyTypes: Array<'apartment' | 'house' | 'land'> = ['apartment', 'house', 'land'];
      const purposes: Array<'rent' | 'sale'> = ['rent', 'sale'];
      
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const neighborhood = cityNeighborhoods[Math.floor(Math.random() * cityNeighborhoods.length)];
      
      // Calculate coordinates with some variation
      const baseCoords = cityData.coordinates;
      const coords: [number, number] = [
        baseCoords[0] + (Math.random() - 0.5) * 0.1, // ±0.05 degrees
        baseCoords[1] + (Math.random() - 0.5) * 0.1
      ];

      // Determine if it's in French or English speaking area
      const isEnglishSpeaking = ['NG', 'GH', 'KE', 'ZA', 'EG'].includes(cityData.country);
      const titleLang = isEnglishSpeaking ? 'en' : 'fr';
      const titleVariations = propertyTitles[propertyType][titleLang];
      const baseTitle = titleVariations[Math.floor(Math.random() * titleVariations.length)];
      
      // Generate bedrooms, bathrooms, and area based on type
      const bedrooms = propertyType === 'land' ? undefined : Math.floor(Math.random() * 5) + 1;
      const bathrooms = propertyType === 'land' ? undefined : Math.ceil((bedrooms || 1) * 0.7);
      const area = propertyType === 'land' ? 
        Math.floor(Math.random() * 1500) + 200 : // 200-1700 m²
        Math.floor(Math.random() * 300) + 40;    // 40-340 m²
      
      const landArea = propertyType === 'house' ? Math.floor(area * (1.2 + Math.random() * 1.5)) : 
                       propertyType === 'land' ? area : undefined;

      // Calculate price
      const basePrice = basePrices[purpose][cityData.currency as keyof typeof basePrices.rent][propertyType];
      const sizeMultiplier = propertyType === 'land' ? area / 500 : 
                            (area / 100) * (bedrooms ? Math.sqrt(bedrooms) : 1);
      const randomMultiplier = 0.7 + Math.random() * 0.8; // 0.7 to 1.5
      const price = Math.floor(basePrice * cityData.priceMultiplier * sizeMultiplier * randomMultiplier);

      // Generate amenities
      const numAmenities = Math.floor(Math.random() * 6) + 2; // 2-7 amenities
      const selectedAmenities = [...amenities]
        .sort(() => Math.random() - 0.5)
        .slice(0, numAmenities);

      // Generate agent
      const countryAgents = agentNames[cityData.country] || agentNames.CI;
      const agentName = countryAgents[Math.floor(Math.random() * countryAgents.length)];
      const isVerified = Math.random() > 0.3; // 70% verified

      // Generate dates (last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const property: Property = {
        id: currentId.toString(),
        title: `${baseTitle} - ${neighborhood}`,
        price,
        currency: cityData.currency,
        location: {
          city: cityName,
          neighborhood,
          coordinates: coords
        },
        images: [
          realEstateImages[propertyType][Math.floor(Math.random() * realEstateImages[propertyType].length)],
          realEstateImages[propertyType][Math.floor(Math.random() * realEstateImages[propertyType].length)],
          realEstateImages[propertyType][Math.floor(Math.random() * realEstateImages[propertyType].length)]
        ].filter((img, index, array) => array.indexOf(img) === index), // Remove duplicates
        type: propertyType,
        purpose,
        bedrooms,
        bathrooms,
        area,
        landArea,
        amenities: selectedAmenities,
        isVerified,
        isNew: daysAgo < 7, // New if less than 7 days old
        isFeatured: Math.random() > 0.85, // 15% featured
        agent: {
          name: agentName,
          avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`,
          isVerified
        },
        createdAt: createdAt.toISOString().split('T')[0]
      };

      properties.push(property);
      currentId++;
    }
  });

  // Sort by creation date (newest first)
  return properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Generate the seed data
export const seedProperties = generateSeedData();