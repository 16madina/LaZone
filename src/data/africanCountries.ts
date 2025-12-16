export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  cities: string[];
}

export const africanCountries: Country[] = [
  {
    code: 'DZ',
    name: 'Algérie',
    flag: '🇩🇿',
    phoneCode: '+213',
    cities: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Djelfa', 'Biskra', 'Tébessa']
  },
  {
    code: 'AO',
    name: 'Angola',
    flag: '🇦🇴',
    phoneCode: '+244',
    cities: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 'Kuito', 'Malanje', 'Namibe']
  },
  {
    code: 'BJ',
    name: 'Bénin',
    flag: '🇧🇯',
    phoneCode: '+229',
    cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Abomey-Calavi', 'Natitingou']
  },
  {
    code: 'BW',
    name: 'Botswana',
    flag: '🇧🇼',
    phoneCode: '+267',
    cities: ['Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Serowe', 'Selebi-Phikwe']
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    phoneCode: '+226',
    cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya', 'Kaya']
  },
  {
    code: 'BI',
    name: 'Burundi',
    flag: '🇧🇮',
    phoneCode: '+257',
    cities: ['Bujumbura', 'Gitega', 'Muyinga', 'Ngozi', 'Rumonge', 'Bururi']
  },
  {
    code: 'CM',
    name: 'Cameroun',
    flag: '🇨🇲',
    phoneCode: '+237',
    cities: ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Ngaoundéré', 'Bertoua']
  },
  {
    code: 'CV',
    name: 'Cap-Vert',
    flag: '🇨🇻',
    phoneCode: '+238',
    cities: ['Praia', 'Mindelo', 'Santa Maria', 'Espargos', 'Assomada']
  },
  {
    code: 'CF',
    name: 'Centrafrique',
    flag: '🇨🇫',
    phoneCode: '+236',
    cities: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar']
  },
  {
    code: 'TD',
    name: 'Tchad',
    flag: '🇹🇩',
    phoneCode: '+235',
    cities: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Koumra']
  },
  {
    code: 'KM',
    name: 'Comores',
    flag: '🇰🇲',
    phoneCode: '+269',
    cities: ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni']
  },
  {
    code: 'CG',
    name: 'Congo',
    flag: '🇨🇬',
    phoneCode: '+242',
    cities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso']
  },
  {
    code: 'CD',
    name: 'RD Congo',
    flag: '🇨🇩',
    phoneCode: '+243',
    cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kananga', 'Goma', 'Bukavu', 'Likasi']
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    phoneCode: '+225',
    cities: ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Divo']
  },
  {
    code: 'DJ',
    name: 'Djibouti',
    flag: '🇩🇯',
    phoneCode: '+253',
    cities: ['Djibouti', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil']
  },
  {
    code: 'EG',
    name: 'Égypte',
    flag: '🇪🇬',
    phoneCode: '+20',
    cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Shubra El Kheima', 'Port-Saïd', 'Suez', 'Louxor', 'Assouan']
  },
  {
    code: 'GQ',
    name: 'Guinée équatoriale',
    flag: '🇬🇶',
    phoneCode: '+240',
    cities: ['Malabo', 'Bata', 'Ebebiyin', 'Aconibe', 'Mongomo']
  },
  {
    code: 'ER',
    name: 'Érythrée',
    flag: '🇪🇷',
    phoneCode: '+291',
    cities: ['Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera']
  },
  {
    code: 'SZ',
    name: 'Eswatini',
    flag: '🇸🇿',
    phoneCode: '+268',
    cities: ['Mbabane', 'Manzini', 'Lobamba', 'Siteki', 'Nhlangano']
  },
  {
    code: 'ET',
    name: 'Éthiopie',
    flag: '🇪🇹',
    phoneCode: '+251',
    cities: ['Addis-Abeba', 'Dire Dawa', 'Gondar', 'Mekele', 'Adama', 'Hawassa', 'Bahir Dar']
  },
  {
    code: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    phoneCode: '+241',
    cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné']
  },
  {
    code: 'GM',
    name: 'Gambie',
    flag: '🇬🇲',
    phoneCode: '+220',
    cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni']
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phoneCode: '+233',
    cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema', 'Obuasi']
  },
  {
    code: 'GN',
    name: 'Guinée',
    flag: '🇬🇳',
    phoneCode: '+224',
    cities: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Boké']
  },
  {
    code: 'GW',
    name: 'Guinée-Bissau',
    flag: '🇬🇼',
    phoneCode: '+245',
    cities: ['Bissau', 'Bafatá', 'Gabú', 'Bissora', 'Bolama']
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    phoneCode: '+254',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Thika']
  },
  {
    code: 'LS',
    name: 'Lesotho',
    flag: '🇱🇸',
    phoneCode: '+266',
    cities: ['Maseru', 'Teyateyaneng', 'Mafeteng', 'Hlotse', 'Mohales Hoek']
  },
  {
    code: 'LR',
    name: 'Liberia',
    flag: '🇱🇷',
    phoneCode: '+231',
    cities: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville', 'Harper']
  },
  {
    code: 'LY',
    name: 'Libye',
    flag: '🇱🇾',
    phoneCode: '+218',
    cities: ['Tripoli', 'Benghazi', 'Misrata', 'Zliten', 'Bayda', 'Zaouïa']
  },
  {
    code: 'MG',
    name: 'Madagascar',
    flag: '🇲🇬',
    phoneCode: '+261',
    cities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara']
  },
  {
    code: 'MW',
    name: 'Malawi',
    flag: '🇲🇼',
    phoneCode: '+265',
    cities: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Mangochi']
  },
  {
    code: 'ML',
    name: 'Mali',
    flag: '🇲🇱',
    phoneCode: '+223',
    cities: ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Koutiala', 'Kayes', 'Gao']
  },
  {
    code: 'MR',
    name: 'Mauritanie',
    flag: '🇲🇷',
    phoneCode: '+222',
    cities: ['Nouakchott', 'Nouadhibou', 'Kaédi', 'Zouérate', 'Rosso', 'Atar']
  },
  {
    code: 'MU',
    name: 'Maurice',
    flag: '🇲🇺',
    phoneCode: '+230',
    cities: ['Port-Louis', 'Beau Bassin-Rose Hill', 'Vacoas-Phoenix', 'Curepipe', 'Quatre Bornes']
  },
  {
    code: 'MA',
    name: 'Maroc',
    flag: '🇲🇦',
    phoneCode: '+212',
    cities: ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda']
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    flag: '🇲🇿',
    phoneCode: '+258',
    cities: ['Maputo', 'Matola', 'Beira', 'Nampula', 'Chimoio', 'Quelimane', 'Tete']
  },
  {
    code: 'NA',
    name: 'Namibie',
    flag: '🇳🇦',
    phoneCode: '+264',
    cities: ['Windhoek', 'Walvis Bay', 'Swakopmund', 'Oshakati', 'Rundu', 'Keetmanshoop']
  },
  {
    code: 'NE',
    name: 'Niger',
    flag: '🇳🇪',
    phoneCode: '+227',
    cities: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phoneCode: '+234',
    cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna', 'Enugu']
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    phoneCode: '+250',
    cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba']
  },
  {
    code: 'ST',
    name: 'São Tomé-et-Príncipe',
    flag: '🇸🇹',
    phoneCode: '+239',
    cities: ['São Tomé', 'Santo António', 'Neves', 'Santana']
  },
  {
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    phoneCode: '+221',
    cities: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Rufisque']
  },
  {
    code: 'SC',
    name: 'Seychelles',
    flag: '🇸🇨',
    phoneCode: '+248',
    cities: ['Victoria', 'Anse Royale', 'Beau Vallon', 'Anse Boileau']
  },
  {
    code: 'SL',
    name: 'Sierra Leone',
    flag: '🇸🇱',
    phoneCode: '+232',
    cities: ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Koidu']
  },
  {
    code: 'SO',
    name: 'Somalie',
    flag: '🇸🇴',
    phoneCode: '+252',
    cities: ['Mogadiscio', 'Hargeisa', 'Kismayo', 'Berbera', 'Baidoa']
  },
  {
    code: 'ZA',
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    phoneCode: '+27',
    cities: ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Soweto']
  },
  {
    code: 'SS',
    name: 'Soudan du Sud',
    flag: '🇸🇸',
    phoneCode: '+211',
    cities: ['Juba', 'Wau', 'Malakal', 'Yei', 'Bor']
  },
  {
    code: 'SD',
    name: 'Soudan',
    flag: '🇸🇩',
    phoneCode: '+249',
    cities: ['Khartoum', 'Omdurman', 'Port-Soudan', 'Kassala', 'El-Obeid', 'Nyala']
  },
  {
    code: 'TZ',
    name: 'Tanzanie',
    flag: '🇹🇿',
    phoneCode: '+255',
    cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Zanzibar', 'Tanga']
  },
  {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    phoneCode: '+228',
    cities: ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Bassar']
  },
  {
    code: 'TN',
    name: 'Tunisie',
    flag: '🇹🇳',
    phoneCode: '+216',
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana']
  },
  {
    code: 'UG',
    name: 'Ouganda',
    flag: '🇺🇬',
    phoneCode: '+256',
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Entebbe', 'Mbale']
  },
  {
    code: 'ZM',
    name: 'Zambie',
    flag: '🇿🇲',
    phoneCode: '+260',
    cities: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Livingstone', 'Mufulira', 'Chingola']
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    phoneCode: '+263',
    cities: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Epworth', 'Masvingo']
  }
];