import { Property } from "@/components/PropertyCard";
import { seedProperties } from "./seedGenerator";

// Export the generated seed data
export const comprehensiveMockProperties: Property[] = seedProperties;

// Export by country for easy filtering
export const propertiesByCountry = {
  "Côte d'Ivoire": comprehensiveMockProperties.filter(p => 
    ["Abidjan", "Bouaké", "Yamoussoukro"].includes(p.location.city)
  ),
  "Sénégal": comprehensiveMockProperties.filter(p => 
    ["Dakar", "Thiès"].includes(p.location.city)
  ),
  "Bénin": comprehensiveMockProperties.filter(p => 
    ["Cotonou", "Porto-Novo"].includes(p.location.city)
  ),
  "Togo": comprehensiveMockProperties.filter(p => 
    ["Lomé"].includes(p.location.city)
  ),
  "Nigeria": comprehensiveMockProperties.filter(p => 
    ["Lagos", "Abuja"].includes(p.location.city)
  ),
  "Ghana": comprehensiveMockProperties.filter(p => 
    ["Accra", "Kumasi"].includes(p.location.city)
  ),
  "Cameroun": comprehensiveMockProperties.filter(p => 
    ["Douala", "Yaoundé"].includes(p.location.city)
  ),
  "Kenya": comprehensiveMockProperties.filter(p => 
    ["Nairobi", "Mombasa"].includes(p.location.city)
  ),
  "Maroc": comprehensiveMockProperties.filter(p => 
    ["Casablanca", "Rabat", "Marrakech"].includes(p.location.city)
  ),
  "Tunisie": comprehensiveMockProperties.filter(p => 
    ["Tunis", "Sfax"].includes(p.location.city)
  ),
  "Égypte": comprehensiveMockProperties.filter(p => 
    ["Le Caire", "Alexandrie"].includes(p.location.city)
  ),
  "Afrique du Sud": comprehensiveMockProperties.filter(p => 
    ["Johannesburg", "Le Cap"].includes(p.location.city)
  ),
};

// Export summary stats
export const seedDataStats = {
  totalProperties: comprehensiveMockProperties.length,
  byPurpose: {
    rent: comprehensiveMockProperties.filter(p => p.purpose === 'rent').length,
    sale: comprehensiveMockProperties.filter(p => p.purpose === 'sale').length,
  },
  byType: {
    apartment: comprehensiveMockProperties.filter(p => p.type === 'apartment').length,
    house: comprehensiveMockProperties.filter(p => p.type === 'house').length,
    land: comprehensiveMockProperties.filter(p => p.type === 'land').length,
  },
  byCountry: Object.fromEntries(
    Object.entries(propertiesByCountry).map(([country, properties]) => [country, properties.length])
  ),
  verified: comprehensiveMockProperties.filter(p => p.isVerified).length,
  new: comprehensiveMockProperties.filter(p => p.isNew).length,
  featured: comprehensiveMockProperties.filter(p => p.isFeatured).length,
};

// Seed data generated - removed console.log for production