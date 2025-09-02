import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

export const SEOOptimizer: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = '/icon-512x512.png',
  url = window.location.href,
  type = 'website',
  structuredData
}) => {
  const fullTitle = `${title} | LaZone - Immobilier en Afrique`;
  const truncatedDescription = description.length > 160 
    ? `${description.substring(0, 157)}...` 
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="LaZone" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#22c55e" />
    </Helmet>
  );
};

// Helper function to generate structured data for properties
export const generatePropertyStructuredData = (property: any) => ({
  "@context": "https://schema.org",
  "@type": "RealEstate",
  "name": property.title,
  "description": property.description,
  "image": property.images,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": property.location.address,
    "addressLocality": property.location.city,
    "addressCountry": property.location.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": property.location.coordinates[1],
    "longitude": property.location.coordinates[0]
  },
  "offers": {
    "@type": "Offer",
    "price": property.price,
    "priceCurrency": property.currency,
    "availability": "https://schema.org/InStock",
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
});