-- Insérer quelques villes de base pour les principaux pays d'Afrique de l'Ouest
INSERT INTO cities (country_code, name, slug) VALUES
-- Côte d'Ivoire
('CI', 'Abidjan', 'abidjan'),
('CI', 'Yamoussoukro', 'yamoussoukro'),
('CI', 'Bouaké', 'bouake'),
('CI', 'Daloa', 'daloa'),
('CI', 'San-Pédro', 'san-pedro'),
('CI', 'Korhogo', 'korhogo'),
('CI', 'Man', 'man'),

-- Sénégal  
('SN', 'Dakar', 'dakar'),
('SN', 'Thiès', 'thies'),
('SN', 'Kaolack', 'kaolack'),
('SN', 'Saint-Louis', 'saint-louis'),
('SN', 'Ziguinchor', 'ziguinchor'),
('SN', 'Diourbel', 'diourbel'),

-- Mali
('ML', 'Bamako', 'bamako'),
('ML', 'Sikasso', 'sikasso'),
('ML', 'Mopti', 'mopti'),
('ML', 'Ségou', 'segou'),
('ML', 'Kayes', 'kayes'),

-- Burkina Faso
('BF', 'Ouagadougou', 'ouagadougou'),
('BF', 'Bobo-Dioulasso', 'bobo-dioulasso'),
('BF', 'Koudougou', 'koudougou'),
('BF', 'Banfora', 'banfora'),

-- Cameroun
('CM', 'Yaoundé', 'yaounde'),
('CM', 'Douala', 'douala'),
('CM', 'Garoua', 'garoua'),
('CM', 'Bamenda', 'bamenda'),
('CM', 'Bafoussam', 'bafoussam')

ON CONFLICT (slug) DO NOTHING;