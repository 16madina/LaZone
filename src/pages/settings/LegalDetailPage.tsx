import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const legalContent: Record<string, { title: string; content: string }> = {
  terms: {
    title: "Conditions d'utilisation",
    content: `
# Conditions Générales d'Utilisation de LaZone

**Date d'entrée en vigueur : 1er décembre 2025**
**Dernière mise à jour : Décembre 2025**

## 1. Présentation du service

### 1.1 À propos de LaZone
LaZone ("nous", "notre", "l'Application") est une plateforme numérique de mise en relation entre vendeurs, bailleurs et acheteurs de biens immobiliers en Afrique. LaZone est exploitée par LaZone SAS, société de droit ivoirien, immatriculée sous le numéro [À COMPLÉTER].

### 1.2 Objet des conditions
Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application mobile et du site web LaZone. En utilisant nos services, vous acceptez ces conditions dans leur intégralité.

## 2. Acceptation des conditions

### 2.1 Consentement
En créant un compte ou en utilisant LaZone, vous confirmez avoir lu, compris et accepté les présentes CGU ainsi que notre Politique de Confidentialité.

### 2.2 Capacité juridique
Vous déclarez être majeur selon la législation de votre pays de résidence (minimum 18 ans) et avoir la capacité juridique de conclure des contrats.

### 2.3 Modifications
Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications entrent en vigueur dès leur publication. Nous vous informerons des changements significatifs par email ou notification dans l'application.

## 3. Inscription et compte utilisateur

### 3.1 Création de compte
Pour accéder à certaines fonctionnalités, vous devez créer un compte en fournissant :
- Nom et prénom
- Adresse email valide
- Pays de résidence
- Photo de profil (optionnelle)

### 3.2 Vérification
Nous pouvons demander une vérification d'identité pour renforcer la confiance sur la plateforme. La vérification d'email est fortement recommandée.

### 3.3 Sécurité du compte
Vous êtes seul responsable de :
- La confidentialité de vos identifiants
- Toutes les activités effectuées depuis votre compte
- Nous signaler immédiatement tout accès non autorisé

### 3.4 Un compte par utilisateur
Chaque utilisateur ne peut détenir qu'un seul compte actif. La création de comptes multiples peut entraîner la suspension de tous les comptes.

## 4. Publication d'annonces

### 4.1 Critères d'éligibilité
Les annonces publiées doivent :
- Concerner des biens immobiliers réels et disponibles
- Appartenir à l'annonceur ou être publiées avec l'autorisation du propriétaire
- Être conformes à la législation locale

### 4.2 Contenu obligatoire
Chaque annonce doit inclure :
- Description précise et véridique du bien
- Localisation exacte
- Prix réel (vente ou location)
- Photos authentiques du bien

### 4.3 Contenus interdits
Sont strictement interdits :
- Les fausses annonces ou annonces trompeuses
- Les biens litigieux ou illégaux
- Les contenus discriminatoires
- Les annonces sans rapport avec l'immobilier
- Les photos volées ou non représentatives

### 4.4 Modération
LaZone se réserve le droit de supprimer sans préavis toute annonce non conforme aux présentes CGU.

## 5. Rôle d'intermédiaire

### 5.1 Nature du service
LaZone agit uniquement comme intermédiaire technique facilitant la mise en relation. Nous ne sommes pas partie aux transactions entre utilisateurs.

### 5.2 Absence de garantie
LaZone ne garantit pas :
- La véracité des informations publiées par les utilisateurs
- La disponibilité effective des biens
- La solvabilité des parties
- L'aboutissement des transactions

### 5.3 Recommandations
Nous conseillons fortement de :
- Vérifier tous les documents légaux avant transaction
- Effectuer des visites physiques des biens
- Faire appel à un notaire pour les transactions importantes
- Ne jamais payer sans avoir vu le bien

## 6. Messagerie et communications

### 6.1 Usage approprié
La messagerie intégrée doit être utilisée exclusivement pour des communications relatives aux annonces immobilières.

### 6.2 Comportements interdits
Sont interdits dans les messages :
- Le spam et les sollicitations commerciales non sollicitées
- Le harcèlement ou les menaces
- Les propos discriminatoires, haineux ou illégaux
- Le partage de contenus explicites

### 6.3 Surveillance
Pour assurer la sécurité de la plateforme, nous nous réservons le droit d'analyser les messages en cas de signalement.

## 7. Propriété intellectuelle

### 7.1 Droits de LaZone
L'ensemble des éléments de l'application (logo, design, textes, code) sont protégés par le droit d'auteur et appartiennent à LaZone.

### 7.2 Contenu utilisateur
En publiant du contenu, vous nous accordez une licence mondiale, non exclusive et gratuite d'utiliser ce contenu pour les besoins du service.

### 7.3 Respect des droits tiers
Vous garantissez que les contenus publiés ne violent aucun droit de propriété intellectuelle de tiers.

## 8. Sanctions et résiliation

### 8.1 Sanctions graduées
En cas de non-respect des CGU, nous pouvons appliquer :
- Avertissement
- Suspension temporaire (1 à 30 jours)
- Suppression d'annonces
- Bannissement définitif

### 8.2 Résiliation par l'utilisateur
Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application.

### 8.3 Conséquences de la résiliation
La suppression du compte entraîne :
- La suppression de vos annonces
- La suppression de vos messages
- L'anonymisation de vos données personnelles

## 9. Limitation de responsabilité

### 9.1 Disponibilité du service
Nous nous efforçons de maintenir le service disponible 24h/24, mais ne garantissons pas une disponibilité ininterrompue.

### 9.2 Exclusion de responsabilité
LaZone ne saurait être tenue responsable :
- Des dommages résultant de l'utilisation du service
- Des litiges entre utilisateurs
- Des pertes financières liées aux transactions
- Des contenus publiés par les utilisateurs

### 9.3 Force majeure
LaZone n'est pas responsable en cas de force majeure (catastrophes naturelles, guerres, pannes généralisées).

## 10. Droit applicable et litiges

### 10.1 Droit applicable
Les présentes CGU sont régies par le droit ivoirien et les conventions internationales applicables.

### 10.2 Résolution des litiges
En cas de litige, nous vous invitons à nous contacter d'abord pour tenter une résolution amiable. À défaut, les tribunaux d'Abidjan seront compétents.

## 11. Contact

Pour toute question relative aux présentes CGU :
- Email : legal@lazoneapp.com
- Support : support@lazoneapp.com
- Adresse : [À COMPLÉTER], Abidjan, Côte d'Ivoire
    `
  },
  privacy: {
    title: "Politique de confidentialité",
    content: `
# Politique de Confidentialité de LaZone

**Date d'entrée en vigueur : 1er décembre 2025**
**Dernière mise à jour : Décembre 2025**

## 1. Introduction

LaZone SAS ("nous", "notre", "la Société") s'engage à protéger la vie privée des utilisateurs de son application et de ses services. Cette Politique de Confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément aux législations applicables, notamment le Règlement Général sur la Protection des Données (RGPD) et les lois africaines sur la protection des données.

## 2. Responsable du traitement

Le responsable du traitement des données est :
- **Société** : LaZone SAS
- **Adresse** : [À COMPLÉTER], Abidjan, Côte d'Ivoire
- **Email DPO** : privacy@lazoneapp.com

## 3. Données collectées

### 3.1 Données fournies directement
Lors de votre inscription et utilisation :
- **Identité** : nom, prénom, photo de profil
- **Coordonnées** : adresse email, numéro de téléphone
- **Localisation** : pays, ville de résidence
- **Contenu** : annonces, photos de biens, messages

### 3.2 Données collectées automatiquement
- **Données techniques** : adresse IP, type d'appareil, système d'exploitation, identifiants uniques
- **Données de navigation** : pages visitées, temps passé, actions effectuées
- **Données de localisation** : coordonnées GPS (si autorisé)
- **Logs** : journaux de connexion et d'activité

### 3.3 Données de tiers
- Informations reçues lors de connexions via réseaux sociaux (si applicable)
- Données de vérification d'identité (si applicable)

## 4. Finalités du traitement

### 4.1 Fourniture du service
- Création et gestion de votre compte
- Publication et affichage des annonces
- Mise en relation entre utilisateurs
- Messagerie et notifications

### 4.2 Amélioration du service
- Analyse des usages pour optimiser l'application
- Personnalisation de l'expérience utilisateur
- Développement de nouvelles fonctionnalités

### 4.3 Sécurité et conformité
- Prévention des fraudes et abus
- Vérification d'identité
- Respect des obligations légales
- Modération des contenus

### 4.4 Communication
- Notifications relatives à votre compte et vos annonces
- Informations sur les mises à jour du service
- Communications marketing (avec votre consentement)

## 5. Base légale du traitement

Nous traitons vos données sur les bases légales suivantes :
- **Exécution du contrat** : pour fournir nos services
- **Consentement** : pour les communications marketing et certains cookies
- **Intérêts légitimes** : pour la sécurité et l'amélioration du service
- **Obligations légales** : pour respecter les lois applicables

## 6. Partage des données

### 6.1 Avec les autres utilisateurs
Certaines informations sont visibles publiquement :
- Nom et prénom
- Photo de profil
- Note et avis
- Annonces publiées
- Statut de vérification

### 6.2 Avec nos prestataires
Nous partageons des données avec nos prestataires techniques :
- Hébergement cloud (Supabase)
- Services de notification
- Outils d'analyse
- Services de paiement (si applicable)

### 6.3 Obligations légales
Nous pouvons divulguer vos données si requis par :
- Une décision de justice
- Une autorité gouvernementale compétente
- La loi applicable

### 6.4 Ce que nous ne faisons pas
Nous ne vendons jamais vos données personnelles à des tiers.

## 7. Transferts internationaux

Vos données peuvent être transférées et stockées sur des serveurs situés en dehors de votre pays de résidence. Nous veillons à ce que ces transferts soient encadrés par des garanties appropriées (clauses contractuelles types, etc.).

## 8. Conservation des données

### 8.1 Durées de conservation
- **Compte actif** : données conservées tant que le compte existe
- **Compte supprimé** : anonymisation sous 30 jours
- **Messages** : supprimés avec le compte
- **Logs techniques** : 12 mois maximum
- **Données de facturation** : 10 ans (obligation légale)

### 8.2 Archivage
Certaines données peuvent être archivées pour des raisons légales ou probatoires.

## 9. Vos droits

### 9.1 Droits RGPD
Conformément au RGPD, vous disposez des droits suivants :
- **Accès** : obtenir une copie de vos données
- **Rectification** : corriger des données inexactes
- **Effacement** : demander la suppression de vos données
- **Opposition** : vous opposer à certains traitements
- **Limitation** : restreindre le traitement de vos données
- **Portabilité** : recevoir vos données dans un format structuré

### 9.2 Exercice des droits
Pour exercer vos droits, contactez-nous à :
- Email : privacy@lazoneapp.com
- Via l'application : Paramètres > Confidentialité

Nous répondrons dans un délai maximum de 30 jours.

### 9.3 Réclamation
Vous pouvez également déposer une réclamation auprès de l'autorité de protection des données de votre pays.

## 10. Sécurité des données

### 10.1 Mesures techniques
- Chiffrement SSL/TLS pour toutes les communications
- Chiffrement des données sensibles au repos
- Authentification sécurisée
- Sauvegardes régulières

### 10.2 Mesures organisationnelles
- Accès restreint aux données personnelles
- Formation du personnel
- Procédures de gestion des incidents
- Audits de sécurité réguliers

## 11. Cookies et technologies similaires

### 11.1 Cookies utilisés
- **Essentiels** : fonctionnement de base de l'application
- **Performance** : analyse des performances
- **Fonctionnels** : personnalisation de l'expérience

### 11.2 Gestion des cookies
Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur ou de l'application.

## 12. Mineurs

Notre service est destiné aux personnes majeures (18 ans minimum). Nous ne collectons pas sciemment de données de mineurs. Si nous découvrons avoir collecté des données d'un mineur, nous les supprimerons immédiatement.

## 13. Modifications de la politique

Nous pouvons modifier cette Politique de Confidentialité. En cas de modification substantielle, nous vous informerons par email ou notification dans l'application au moins 30 jours avant l'entrée en vigueur des changements.

## 14. Contact

Pour toute question relative à la protection de vos données :
- **DPO** : privacy@lazoneapp.com
- **Support** : support@lazoneapp.com
- **Adresse** : [À COMPLÉTER], Abidjan, Côte d'Ivoire
    `
  },
  community: {
    title: "Règles de la communauté",
    content: `
# Règles de la Communauté LaZone

**Date d'entrée en vigueur : 1er décembre 2025**

## Notre vision

LaZone aspire à créer la communauté immobilière la plus sûre et la plus fiable d'Afrique. Ces règles sont essentielles pour maintenir un environnement de confiance pour tous.

## 1. Principes fondamentaux

### 1.1 Honnêteté
- Publiez uniquement des annonces véridiques
- Utilisez des photos réelles et récentes des biens
- Indiquez le prix réel sans frais cachés
- Soyez transparent sur l'état du bien

### 1.2 Respect
- Traitez tous les utilisateurs avec courtoisie
- Répondez aux messages dans des délais raisonnables
- Honorez vos rendez-vous ou prévenez en cas d'empêchement
- Acceptez les refus avec dignité

### 1.3 Sécurité
- Signalez tout comportement suspect
- Ne partagez pas d'informations personnelles sensibles publiquement
- Privilégiez les rencontres dans des lieux publics
- Vérifiez les documents avant toute transaction

## 2. Comportements attendus

### 2.1 Pour les vendeurs/bailleurs
✅ Fournir des descriptions précises et complètes
✅ Répondre rapidement aux demandes de renseignements
✅ Être disponible pour les visites
✅ Mettre à jour ou retirer les annonces non disponibles
✅ Fournir tous les documents légaux requis

### 2.2 Pour les acheteurs/locataires
✅ Poser des questions pertinentes
✅ Être ponctuel aux rendez-vous
✅ Faire des offres réalistes
✅ Respecter les biens lors des visites
✅ Communiquer clairement vos intentions

## 3. Comportements interdits

### 3.1 Fraudes et arnaques
❌ Publier de fausses annonces
❌ Demander des paiements avant visite
❌ Usurper l'identité d'autrui
❌ Utiliser de faux documents
❌ Pratiquer la sous-location non autorisée

### 3.2 Contenus inappropriés
❌ Photos trompeuses ou volées
❌ Descriptions mensongères
❌ Prix artificiellement bas ou élevés
❌ Annonces sans rapport avec l'immobilier
❌ Publicité pour des services tiers

### 3.3 Comportements abusifs
❌ Harcèlement ou intimidation
❌ Propos discriminatoires (race, religion, genre, etc.)
❌ Langage vulgaire ou menaçant
❌ Spam et messages répétitifs
❌ Non-respect de la vie privée

### 3.4 Pratiques commerciales déloyales
❌ Prix discriminatoires
❌ Fausse urgence ("dernière chance")
❌ Manipulation des avis
❌ Pratiques d'appâtage

## 4. Politique anti-discrimination

LaZone interdit strictement toute discrimination basée sur :
- L'origine ethnique ou nationale
- La religion ou les croyances
- Le genre ou l'orientation sexuelle
- Le handicap
- La situation familiale
- L'âge
- La profession

Les annonces discriminatoires seront supprimées et les auteurs sanctionnés.

## 5. Signalement et modération

### 5.1 Comment signaler
- Utilisez le bouton "Signaler" sur l'annonce ou le profil
- Décrivez précisément le problème
- Joignez des captures d'écran si possible
- Contactez-nous à : moderation@lazoneapp.com

### 5.2 Processus de modération
1. Réception et analyse du signalement (24-48h)
2. Investigation et collecte d'informations
3. Décision et action appropriée
4. Notification aux parties concernées

### 5.3 Confidentialité des signalements
Les signalements sont traités de manière confidentielle. L'identité du signalant n'est jamais révélée à la personne signalée.

## 6. Sanctions

### 6.1 Échelle des sanctions
Les sanctions sont proportionnelles à la gravité et à la répétition des infractions :

**Niveau 1 - Avertissement**
- Première infraction mineure
- Rappel des règles

**Niveau 2 - Suspension temporaire**
- Infractions répétées
- Durée : 7 à 30 jours
- Suppression des annonces concernées

**Niveau 3 - Bannissement permanent**
- Infractions graves (fraude, discrimination)
- Récidive après suspension
- Pas de possibilité de réinscription

### 6.2 Appel
Vous pouvez contester une sanction en écrivant à : appeals@lazoneapp.com
L'appel doit être motivé et sera examiné sous 7 jours ouvrés.

## 7. Conseils de sécurité

### 7.1 Avant une transaction
- Vérifiez l'identité du vendeur/bailleur
- Demandez les documents de propriété
- Faites appel à un notaire pour les ventes
- Ne payez jamais avant d'avoir vu le bien

### 7.2 Lors des visites
- Informez un proche de votre déplacement
- Visitez de jour de préférence
- N'allez pas seul si vous n'êtes pas à l'aise
- Faites confiance à votre instinct

### 7.3 Paiements
- Privilégiez les virements bancaires traçables
- Évitez les paiements en espèces importants
- Conservez tous les reçus et documents
- Méfiez-vous des demandes d'acomptes excessifs

## 8. Contact

Pour toute question sur ces règles :
- Modération : moderation@lazoneapp.com
- Support : support@lazoneapp.com
    `
  },
  'child-safety': {
    title: "Sécurité et protection des mineurs",
    content: `
# Politique de Protection des Mineurs

**Date d'entrée en vigueur : 1er décembre 2025**

## 1. Notre engagement

La protection des enfants et des mineurs est une priorité absolue pour LaZone. Nous avons une tolérance zéro envers toute forme d'exploitation ou d'abus impliquant des mineurs.

## 2. Restrictions d'âge

### 2.1 Âge minimum
- L'utilisation de LaZone est strictement réservée aux personnes majeures
- L'âge minimum requis est de 18 ans
- Nous nous réservons le droit de vérifier l'âge des utilisateurs

### 2.2 Création de compte
En créant un compte, vous certifiez :
- Avoir au moins 18 ans
- Ne pas créer de compte pour le compte d'un mineur
- Être légalement capable de contracter

## 3. Contenus interdits

### 3.1 Contenus strictement prohibés
Les contenus suivants sont absolument interdits et entraînent un bannissement immédiat et définitif :
- Images ou vidéos de mineurs dans un contexte inapproprié
- Tout contenu à caractère sexuel impliquant des mineurs
- Toute sollicitation de mineurs
- Toute discussion inappropriée avec ou concernant des mineurs
- Tout contenu faisant la promotion de l'exploitation des enfants

### 3.2 Signalement automatique
Nous utilisons des technologies automatisées pour détecter les contenus illégaux impliquant des mineurs. Tout contenu suspect est signalé aux autorités compétentes.

## 4. Procédure de signalement

### 4.1 Comment signaler
Si vous suspectez une activité illégale impliquant un mineur :

**Signalement d'urgence :**
1. Contactez immédiatement les autorités locales
2. Signalez dans l'application via le bouton "Signaler"
3. Envoyez un email d'urgence à : safety@lazoneapp.com

### 4.2 Informations à fournir
- Description détaillée de la situation
- Captures d'écran (si approprié et légal)
- Identifiants des comptes concernés
- Tout autre élément pertinent

### 4.3 Traitement prioritaire
Les signalements concernant des mineurs sont traités en priorité absolue, généralement dans l'heure suivant leur réception.

## 5. Collaboration avec les autorités

### 5.1 Signalement aux autorités
Conformément à nos obligations légales et éthiques, nous signalons systématiquement aux autorités compétentes :
- Tout contenu d'exploitation sexuelle de mineurs
- Toute tentative de contact inapproprié avec un mineur
- Tout autre comportement criminel impliquant des mineurs

### 5.2 Coopération
Nous coopérons pleinement avec :
- Les forces de l'ordre locales et internationales
- Les organisations de protection de l'enfance
- Les autorités judiciaires

### 5.3 Conservation des preuves
En cas de contenu illégal, nous conservons les preuves numériques nécessaires aux enquêtes, conformément aux exigences légales.

## 6. Mesures préventives

### 6.1 Modération proactive
- Surveillance automatisée des contenus
- Équipe de modération formée à la protection des mineurs
- Filtres de détection de contenus inappropriés

### 6.2 Formation
Notre équipe reçoit une formation régulière sur :
- L'identification des signes d'exploitation
- Les procédures de signalement
- La gestion des contenus sensibles

### 6.3 Technologies de protection
- Analyse automatique des images
- Détection de patterns suspects
- Vérification d'âge renforcée

## 7. Ressources et contacts d'urgence

### 7.1 Numéros d'urgence
**Côte d'Ivoire :**
- Police : 110 / 170
- BICE (Bureau International Catholique de l'Enfance)

**France :**
- 119 (Enfance en danger)
- 0 800 05 1234 (Victimes de violences sexuelles)

**International :**
- ECPAT International
- Missing Children International

### 7.2 Organisations partenaires
- UNICEF
- Save the Children
- Organisations locales de protection de l'enfance

### 7.3 Contact LaZone
- Urgences : safety@lazoneapp.com
- Support général : support@lazoneapp.com

## 8. Conséquences des violations

### 8.1 Mesures immédiates
En cas de violation de cette politique :
- Suspension immédiate du compte
- Signalement aux autorités compétentes
- Conservation des preuves pour enquête
- Bannissement permanent de la plateforme

### 8.2 Poursuites légales
Nous nous réservons le droit d'engager des poursuites légales contre tout utilisateur impliqué dans l'exploitation de mineurs.

## 9. Éducation et sensibilisation

### 9.1 Sensibilisation des utilisateurs
Nous menons des campagnes régulières de sensibilisation sur :
- Les risques d'exploitation en ligne
- Les signes à repérer
- Les actions à entreprendre

### 9.2 Ressources éducatives
Nous mettons à disposition des ressources sur la sécurité en ligne pour les parents et les éducateurs.

## 10. Mise à jour de cette politique

Cette politique est révisée régulièrement pour s'adapter aux évolutions légales et technologiques. Les modifications significatives seront communiquées aux utilisateurs.

## 11. Contact

Pour toute question relative à la protection des mineurs :
- **Email prioritaire** : safety@lazoneapp.com
- **Support** : support@lazoneapp.com

---

*LaZone s'engage fermement dans la lutte contre l'exploitation des enfants et collabore activement avec les organisations de protection de l'enfance à travers l'Afrique et le monde.*
    `
  }
};

const LegalDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const page = id ? legalContent[id] : null;

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => navigate('/settings/legal')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{page.title}</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {page.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- ')) {
                return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('✅') || line.startsWith('❌')) {
                return <p key={index} className="font-medium">{line}</p>;
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return <p key={index} className="text-muted-foreground">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDetailPage;
