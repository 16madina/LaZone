import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const legalContent: Record<string, { title: string; content: string }> = {
  terms: {
    title: "Conditions d'utilisation",
    content: `
# Conditions Générales d'Utilisation de LaZone

**Date d'entrée en vigueur : 1er décembre 2025**

## 1. Acceptation des conditions

En accédant et en utilisant l'application LaZone, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

## 2. Description du service

LaZone est une plateforme de mise en relation entre vendeurs et acheteurs de biens immobiliers en Afrique. Nous ne sommes pas partie aux transactions effectuées entre utilisateurs.

## 3. Inscription et compte

- Vous devez avoir au moins 18 ans pour créer un compte
- Vous êtes responsable de la confidentialité de vos identifiants
- Les informations fournies doivent être exactes et à jour

## 4. Règles de publication

Les annonces doivent :
- Concerner des biens immobiliers réels
- Contenir des informations véridiques
- Ne pas violer les droits de tiers
- Respecter les lois locales

## 5. Responsabilité

LaZone décline toute responsabilité quant aux transactions entre utilisateurs. Nous recommandons de vérifier tous les documents légaux avant toute transaction.

## 6. Propriété intellectuelle

Tout le contenu de l'application (logos, textes, images) est protégé par le droit d'auteur.

## 7. Modification des conditions

Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs.

## 8. Contact

Pour toute question : support@lazoneapp.com
    `
  },
  privacy: {
    title: "Politique de confidentialité",
    content: `
# Politique de Confidentialité de LaZone

**Date d'entrée en vigueur : 1er décembre 2025**

## 1. Données collectées

Nous collectons les données suivantes :
- Informations d'inscription (nom, email, téléphone)
- Données de profil (photo, localisation)
- Annonces publiées
- Messages échangés
- Données de navigation

## 2. Utilisation des données

Vos données sont utilisées pour :
- Fournir et améliorer nos services
- Personnaliser votre expérience
- Envoyer des notifications pertinentes
- Assurer la sécurité de la plateforme

## 3. Partage des données

Nous ne vendons pas vos données personnelles. Elles peuvent être partagées avec :
- Les autres utilisateurs (selon vos paramètres)
- Nos prestataires techniques
- Les autorités (si requis par la loi)

## 4. Sécurité

Nous utilisons des mesures de sécurité avancées pour protéger vos données, notamment le chiffrement SSL et des pratiques de stockage sécurisé.

## 5. Vos droits

Vous pouvez :
- Accéder à vos données
- Les modifier ou les supprimer
- Retirer votre consentement
- Demander la portabilité

## 6. Cookies

Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez les gérer dans les paramètres de votre navigateur.

## 7. Contact

DPO : privacy@lazoneapp.com
    `
  },
  community: {
    title: "Règles de la communauté",
    content: `
# Règles de la Communauté LaZone

## Notre engagement

LaZone s'engage à maintenir un environnement sûr et respectueux pour tous les utilisateurs.

## Comportements attendus

✅ **À faire :**
- Être honnête dans vos annonces
- Répondre rapidement aux messages
- Respecter les rendez-vous
- Signaler les comportements suspects

## Comportements interdits

❌ **À ne pas faire :**
- Publier de fausses annonces
- Harceler d'autres utilisateurs
- Discriminer
- Utiliser un langage offensant
- Tenter d'arnaquer

## Sanctions

Les violations peuvent entraîner :
1. Avertissement
2. Suspension temporaire
3. Suppression définitive du compte

## Signalement

Si vous êtes témoin d'une violation, signalez-la via l'option "Signaler" de l'application.

## Appel

Vous pouvez contester une sanction en contactant : moderation@lazoneapp.com
    `
  },
  'child-safety': {
    title: "Sécurité et protection des mineurs",
    content: `
# Protection des Mineurs

## Notre engagement

La sécurité des mineurs est une priorité absolue pour LaZone.

## Règles strictes

- L'inscription est interdite aux moins de 18 ans
- Les annonces ne doivent pas cibler les mineurs
- Tout contenu inapproprié est strictement interdit

## Signalement

Si vous suspectez une activité impliquant des mineurs :
1. Signalez immédiatement via l'application
2. Contactez les autorités locales si nécessaire
3. Envoyez un email à : safety@lazoneapp.com

## Collaboration

Nous collaborons avec les autorités pour toute enquête concernant la protection des mineurs.

## Ressources

- Ligne d'écoute enfance : 116 111
- Police : 17

## Formation

Notre équipe de modération est formée pour détecter et traiter rapidement tout contenu inapproprié.
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
