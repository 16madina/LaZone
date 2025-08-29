import { Property } from "@/components/PropertyCard";

// Mock data for different African cities
export const mockProperties: Property[] = [
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
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&crop=center"
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
    createdAt: "2024-01-15",
    distance: 2.3
  },
  {
    id: "2", 
    title: "Villa 4 chambres avec piscine - Riviera Palmeraie",
    price: 45000000,
    currency: "CFA",
    location: {
      city: "Abidjan",
      neighborhood: "Riviera",
      coordinates: [-3.9833, 5.3617]
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    landArea: 500,
    amenities: ["Piscine", "Parking", "Jardin", "Sécurité 24/7", "Climatisation"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Aminata Traore",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-10",
    distance: 4.1
  },
  {
    id: "3",
    title: "Studio meublé - Plateau centre-ville",
    price: 320000,
    currency: "CFA",
    location: {
      city: "Abidjan",
      neighborhood: "Plateau",
      coordinates: [-4.0333, 5.3167]
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    amenities: ["Meublé", "Fibre", "Ascenseur", "Climatisation"],
    isVerified: false,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Jean-Baptiste Kouassi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
      isVerified: false
    },
    createdAt: "2024-01-18",
    distance: 1.8
  },
  {
    id: "4",
    title: "Terrain à bâtir 1200m² - Bassam Zone",
    price: 25000000,
    currency: "CFA",
    location: {
      city: "Grand-Bassam",
      neighborhood: "Zone Industrielle",
      coordinates: [-3.7333, 5.2167]
    },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&crop=center"
    ],
    type: "land",
    purpose: "sale",
    area: 1200,
    amenities: ["Titre foncier", "Électricité", "Route bitumée"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "Marie-Claire Assi",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-05",
    distance: 15.2
  },
  {
    id: "5",
    title: "Duplex 2 chambres avec terrasse - Marcory",
    price: 650000,
    currency: "CFA", 
    location: {
      city: "Abidjan",
      neighborhood: "Marcory",
      coordinates: [-4.0000, 5.2833]
    },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    amenities: ["Balcon", "Parking", "Climatisation"],
    isVerified: true,
    isNew: false,
    isFeatured: false,
    agent: {
      name: "Ibrahim Diallo",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-12",
    distance: 3.5
  },
  {
    id: "6",
    title: "Maison 3 chambres - Yopougon Selmer",
    price: 28000000,
    currency: "CFA",
    location: {
      city: "Abidjan",
      neighborhood: "Yopougon",
      coordinates: [-4.0833, 5.3333]
    },
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house", 
    purpose: "sale",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    landArea: 300,
    amenities: ["Jardin", "Parking", "Sécurité"],
    isVerified: false,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Fatou Camara",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=center",
      isVerified: false
    },
    createdAt: "2024-01-20",
    distance: 6.8
  },
  // Properties for other cities
  {
    id: "7",
    title: "Villa moderne - Almadies Dakar",
    price: 1500000,
    currency: "CFA",
    location: {
      city: "Dakar",
      neighborhood: "Almadies",
      coordinates: [-17.5167, 14.7500]
    },
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&crop=center"
    ],
    type: "house",
    purpose: "rent",
    bedrooms: 5,
    bathrooms: 4,
    area: 250,
    landArea: 600,
    amenities: ["Piscine", "Vue mer", "Parking", "Sécurité 24/7", "Climatisation", "Jardin"],
    isVerified: true,
    isNew: false,
    isFeatured: true,
    agent: {
      name: "Moussa Sow",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-08",
    distance: 8.2
  },
  {
    id: "8",
    title: "Appartement standing - Mermoz Sacré-Coeur",
    price: 95000000,
    currency: "CFA",
    location: {
      city: "Dakar",
      neighborhood: "Mermoz",
      coordinates: [-17.4500, 14.7167]
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&crop=center"
    ],
    type: "apartment",
    purpose: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area: 140,
    amenities: ["Ascenseur", "Parking souterrain", "Fibre", "Climatisation", "Balcon"],
    isVerified: true,
    isNew: true,
    isFeatured: false,
    agent: {
      name: "Aissatou Ba",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=center",
      isVerified: true
    },
    createdAt: "2024-01-22",
    distance: 5.1
  }
];

// Filter function for properties
export const filterProperties = (properties: Property[], filters: any) => {
  return properties.filter(property => {
    // Property type filter
    if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.type)) {
      return false;
    }

    // Price range filter
    if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
      return false;
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'any' && property.bedrooms) {
      const minBedrooms = parseInt(filters.bedrooms);
      if (property.bedrooms < minBedrooms) {
        return false;
      }
    }

    // Bathrooms filter
    if (filters.bathrooms !== 'any' && property.bathrooms) {
      const minBathrooms = parseInt(filters.bathrooms);
      if (property.bathrooms < minBathrooms) {
        return false;
      }
    }

    // Area filter
    if (property.area < filters.areaRange[0] || property.area > filters.areaRange[1]) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasRequiredAmenities = filters.amenities.every((amenity: string) => 
        property.amenities.includes(amenity)
      );
      if (!hasRequiredAmenities) {
        return false;
      }
    }

    return true;
  });
};