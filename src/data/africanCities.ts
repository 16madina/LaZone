// Données des villes et quartiers africains pour l'autocomplétion

export interface City {
  name: string;
  neighborhoods: string[];
}

export interface Country {
  code: string;
  name: string;
  cities: City[];
}

export const AFRICAN_CITIES_DATA: Country[] = [
  {
    code: 'CI',
    name: 'Côte d\'Ivoire',
    cities: [
      {
        name: 'Abidjan',
        neighborhoods: ['Cocody', 'Plateau', 'Marcory', 'Treichville', 'Adjamé', 'Yopougon', 'Port-Bouët', 'Koumassi', 'Abobo', 'Attécoubé', 'Riviera', 'Angré', 'Deux Plateaux', 'Bingerville', 'Zone 4', 'Biétry', 'Blockhaus', 'Vridi', 'Gonzagueville']
      },
      {
        name: 'Abengourou',
        neighborhoods: ['Centre-ville', 'Quartier Commercial', 'Résidentiel', 'Nouveau Quartier', 'Quartier Nord']
      },
      {
        name: 'Adiaké',
        neighborhoods: ['Centre', 'Port', 'Résidentiel', 'Commercial']
      },
      {
        name: 'Bouaké',
        neighborhoods: ['Centre-ville', 'Koko', 'Belleville', 'Commerce', 'Résidentiel', 'Air France']
      },
      {
        name: 'Daloa',
        neighborhoods: ['Centre-ville', 'Tazibouo', 'Lobia', 'Commerce', 'Résidentiel']
      },
      {
        name: 'San-Pédro',
        neighborhoods: ['Centre-ville', 'Port', 'Zone Industrielle', 'Résidentiel', 'Balmer']
      }
    ]
  },
  {
    code: 'SN',
    name: 'Sénégal',
    cities: [
      {
        name: 'Dakar',
        neighborhoods: ['Plateau', 'Médina', 'Point E', 'Almadies', 'Ngor', 'Ouakam', 'Yoff', 'HLM', 'Parcelles Assainies', 'Guédiawaye', 'Pikine', 'Rufisque', 'Keur Massar', 'Malika', 'Cambérène', 'Liberté', 'Sacré-Cœur', 'Mermoz', 'SICAP', 'Fann']
      },
      {
        name: 'Thiès',
        neighborhoods: ['Centre-ville', 'Résidentiel', 'HLM Thiès', 'Quartier Nord', 'Zone Industrielle']
      },
      {
        name: 'Kaolack',
        neighborhoods: ['Centre-ville', 'Médina', 'Ndangane', 'Résidentiel', 'Quartier Commercial']
      },
      {
        name: 'Saint-Louis',
        neighborhoods: ['Île', 'Sor', 'Ndar Toute', 'Résidentiel', 'Centre historique']
      }
    ]
  },
  {
    code: 'NG',
    name: 'Nigeria',
    cities: [
      {
        name: 'Lagos',
        neighborhoods: ['Victoria Island', 'Ikoyi', 'Lekki', 'Ikeja', 'Surulere', 'Maryland', 'Yaba', 'Apapa', 'Festac', 'Ajah', 'Gbagada', 'Magodo', 'Ojota', 'Mushin', 'Alaba', 'Ketu', 'Mile 12']
      },
      {
        name: 'Kano',
        neighborhoods: ['Sabon Gari', 'Fagge', 'Gwale', 'Dala', 'Municipal', 'Nassarawa', 'Tarauni', 'Ungogo']
      },
      {
        name: 'Ibadan',
        neighborhoods: ['Bodija', 'UI', 'Ring Road', 'Dugbe', 'Mokola', 'Sango', 'Challenge', 'New Bodija']
      },
      {
        name: 'Port Harcourt',
        neighborhoods: ['GRA', 'Trans Amadi', 'Mile 1', 'Mile 2', 'D-Line', 'Old GRA', 'New GRA', 'Town']
      }
    ]
  },
  {
    code: 'ML',
    name: 'Mali',
    cities: [
      {
        name: 'Bamako',
        neighborhoods: ['Commune I', 'Commune II', 'Commune III', 'Commune IV', 'Commune V', 'Commune VI', 'Hippodrome', 'Médina Coura', 'Badalabougou', 'Hamdallaye', 'ACI 2000', 'Titibougou', 'Sabalibougou', 'Magnambougou', 'Sogoniko', 'Banankabougou']
      },
      {
        name: 'Sikasso',
        neighborhoods: ['Centre-ville', 'Résidentiel', 'Commerce', 'Quartier Nord']
      },
      {
        name: 'Mopti',
        neighborhoods: ['Centre-ville', 'Port', 'Résidentiel', 'Quartier Commercial']
      }
    ]
  },
  {
    code: 'GH',
    name: 'Ghana',
    cities: [
      {
        name: 'Accra',
        neighborhoods: ['Osu', 'Labone', 'Airport Residential', 'East Legon', 'Cantonments', 'Adabraka', 'Tema', 'Dansoman', 'Achimota', 'Lapaz', 'Madina', 'Spintex', 'Teshie', 'Nungua']
      },
      {
        name: 'Kumasi',
        neighborhoods: ['Adum', 'Asokwa', 'Bantama', 'Suame', 'Nhyiaeso', 'Ridge', 'Tech', 'Ayeduase']
      },
      {
        name: 'Tamale',
        neighborhoods: ['Central', 'Aboabo', 'Kalpohin', 'Vittin', 'Residentieel', 'Commercial']
      },
      {
        name: 'Takoradi',
        neighborhoods: ['Market Circle', 'European Town', 'Fijai', 'Kwesimintsim', 'New Takoradi']
      }
    ]
  },
  {
    code: 'CM',
    name: 'Cameroun',
    cities: [
      {
        name: 'Douala',
        neighborhoods: ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'New Bell', 'Bassa', 'Makepe', 'Logpom', 'Cité SIC', 'Kotto', 'Ndokotti', 'Pk 10', 'Pk 12']
      },
      {
        name: 'Yaoundé',
        neighborhoods: ['Centre-ville', 'Bastos', 'Mvan', 'Ngoa-Ekelle', 'Tsinga', 'Emombo', 'Essos', 'Nlongkak', 'Odza', 'Mendong', 'Ekounou', 'Mvog-Ada']
      },
      {
        name: 'Garoua',
        neighborhoods: ['Centre', 'Plateau', 'Résidentiel', 'Commercial', 'Domayo']
      },
      {
        name: 'Bamenda',
        neighborhoods: ['Commercial Avenue', 'Up Station', 'Ntarikon', 'Mile 4', 'Government']
      }
    ]
  },
  {
    code: 'KE',
    name: 'Kenya',
    cities: [
      {
        name: 'Nairobi',
        neighborhoods: ['CBD', 'Westlands', 'Karen', 'Lavington', 'Kilimani', 'Parklands', 'Eastleigh', 'South C', 'South B', 'Kileleshwa', 'Hurlingham', 'Runda', 'Muthaiga', 'Spring Valley']
      },
      {
        name: 'Mombasa',
        neighborhoods: ['CBD', 'Nyali', 'Bamburi', 'Kisauni', 'Likoni', 'Tudor', 'Changamwe', 'Port Reitz']
      },
      {
        name: 'Kisumu',
        neighborhoods: ['CBD', 'Milimani', 'Nyamasaria', 'Mamboleo', 'Kondele', 'Migosi']
      },
      {
        name: 'Nakuru',
        neighborhoods: ['CBD', 'Milimani', 'Section 58', 'Flamingo', 'Shabab', 'London']
      }
    ]
  },
  {
    code: 'MA',
    name: 'Maroc',
    cities: [
      {
        name: 'Casablanca',
        neighborhoods: ['Maarif', 'Gauthier', 'Racine', 'Palmier', 'Anfa', 'Bourgogne', 'Californie', 'Centre-ville', 'Hay Hassani', 'Sidi Bernoussi', 'Ain Sebaa', 'Mohammedia']
      },
      {
        name: 'Rabat',
        neighborhoods: ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Medina', 'Ocean', 'Aviation', 'Yacoub El Mansour']
      },
      {
        name: 'Marrakech',
        neighborhoods: ['Gueliz', 'Hivernage', 'Medina', 'Targa', 'Semlalia', 'Majorelle', 'Palmeraie', 'Sidi Ghanem']
      },
      {
        name: 'Fès',
        neighborhoods: ['Medina', 'Ville Nouvelle', 'Atlas', 'Saiss', 'Zouagha', 'Bensouda']
      }
    ]
  },
  {
    code: 'TN',
    name: 'Tunisie',
    cities: [
      {
        name: 'Tunis',
        neighborhoods: ['Centre-ville', 'Lac 1', 'Lac 2', 'Menzah', 'Manar', 'Ariana', 'Bardo', 'Carthage', 'Sidi Bou Said', 'La Marsa']
      },
      {
        name: 'Sfax',
        neighborhoods: ['Centre-ville', 'Sakiet Ezzit', 'Sakiet Eddaier', 'El Ain', 'Chihia']
      },
      {
        name: 'Sousse',
        neighborhoods: ['Medina', 'Kantaoui', 'Sahloul', 'Riadh', 'Khezama']
      },
      {
        name: 'Kairouan',
        neighborhoods: ['Medina', 'Centre-ville', 'Résidentiel', 'Cité']
      }
    ]
  },
  {
    code: 'EG',
    name: 'Égypte',
    cities: [
      {
        name: 'Le Caire',
        neighborhoods: ['Zamalek', 'Maadi', 'Heliopolis', 'New Cairo', 'Dokki', 'Mohandessin', 'Nasr City', 'Downtown', 'Garden City', 'Rehab']
      },
      {
        name: 'Alexandrie',
        neighborhoods: ['Centre-ville', 'Montaza', 'Raml Station', 'Sporting', 'Sidi Gaber', 'Miami']
      },
      {
        name: 'Giza',
        neighborhoods: ['Dokki', 'Mohandessin', 'Haram', 'Faisal', 'October', 'Sheikh Zayed']
      },
      {
        name: 'Louxor',
        neighborhoods: ['Centre-ville', 'East Bank', 'West Bank', 'Corniche']
      }
    ]
  },
  {
    code: 'ZA',
    name: 'Afrique du Sud',
    cities: [
      {
        name: 'Johannesburg',
        neighborhoods: ['Sandton', 'Rosebank', 'Melville', 'Braamfontein', 'Soweto', 'Alexandra', 'Randburg', 'Midrand', 'Fourways']
      },
      {
        name: 'Le Cap',
        neighborhoods: ['City Bowl', 'Sea Point', 'Camps Bay', 'Clifton', 'Green Point', 'Woodstock', 'Observatory', 'Constantia', 'Hout Bay']
      },
      {
        name: 'Durban',
        neighborhoods: ['Umhlanga', 'Morningside', 'Berea', 'Point', 'Chatsworth', 'Phoenix']
      },
      {
        name: 'Pretoria',
        neighborhoods: ['Arcadia', 'Hatfield', 'Sunnyside', 'Brooklyn', 'Menlo Park', 'Centurion']
      }
    ]
  },
  {
    code: 'ET',
    name: 'Éthiopie',
    cities: [
      {
        name: 'Addis-Abeba',
        neighborhoods: ['Bole', 'Kazanchis', 'Piazza', 'Mercato', 'Kirkos', 'Arada', 'Gulele', 'Yeka']
      },
      {
        name: 'Dire Dawa',
        neighborhoods: ['Centre', 'Kezira', 'Sabian', 'Addis Ketema']
      },
      {
        name: 'Mekelle',
        neighborhoods: ['Centre', 'Ayder', 'Kedamay Weyane', 'Hawelti']
      },
      {
        name: 'Gondar',
        neighborhoods: ['Centre historique', 'Piazza', 'Azezo', 'Maraki']
      }
    ]
  },
  {
    code: 'TG',
    name: 'Togo',
    cities: [
      {
        name: 'Lomé',
        neighborhoods: ['Centre-ville', 'Bè', 'Tokoin', 'Adawlato', 'Nyékonakpoè', 'Agbalépédogan', 'Agoè', 'Cacaveli', 'Djidjolé']
      },
      {
        name: 'Sokodé',
        neighborhoods: ['Centre', 'Tchaoudjo', 'Résidentiel', 'Commercial']
      },
      {
        name: 'Kara',
        neighborhoods: ['Centre', 'Plateau', 'Résidentiel', 'Kozah']
      },
      {
        name: 'Atakpamé',
        neighborhoods: ['Centre', 'Agou', 'Résidentiel', 'Commercial']
      }
    ]
  },
  {
    code: 'BJ',
    name: 'Bénin',
    cities: [
      {
        name: 'Cotonou',
        neighborhoods: ['Centre-ville', 'Dantokpa', 'Ganhi', 'Fidjrossè', 'Akpakpa', 'Cadjehoun', 'Godomey', 'Calavi', 'Sème', 'Vedoko']
      },
      {
        name: 'Porto-Novo',
        neighborhoods: ['Centre-ville', 'Ouando', 'Djassin', 'Résidentiel']
      },
      {
        name: 'Parakou',
        neighborhoods: ['Centre', 'Banikoara', 'Résidentiel', 'Commercial']
      },
      {
        name: 'Abomey',
        neighborhoods: ['Centre historique', 'Résidentiel', 'Goho', 'Djègbé']
      }
    ]
  }
];

// Fonction pour obtenir les villes d'un pays
export const getCitiesByCountry = (countryName: string): City[] => {
  const country = AFRICAN_CITIES_DATA.find(c => c.name === countryName);
  return country?.cities || [];
};

// Fonction pour obtenir les quartiers d'une ville
export const getNeighborhoodsByCity = (countryName: string, cityName: string): string[] => {
  const country = AFRICAN_CITIES_DATA.find(c => c.name === countryName);
  if (!country) return [];
  
  const city = country.cities.find(c => c.name === cityName);
  return city?.neighborhoods || [];
};

// Fonction de recherche pour l'autocomplétion des villes
export const searchCities = (countryName: string, query: string): string[] => {
  const cities = getCitiesByCountry(countryName);
  if (!query) return cities.map(c => c.name);
  
  return cities
    .map(c => c.name)
    .filter(name => name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      // Priorité aux correspondances qui commencent par la query
      const aStarts = a.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });
};

// Fonction de recherche pour l'autocomplétion des quartiers
export const searchNeighborhoods = (countryName: string, cityName: string, query: string): string[] => {
  const neighborhoods = getNeighborhoodsByCity(countryName, cityName);
  if (!query) return neighborhoods;
  
  return neighborhoods
    .filter(name => name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      // Priorité aux correspondances qui commencent par la query
      const aStarts = a.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });
};