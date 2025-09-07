import { useEffect, useMemo } from 'react';

interface PreviewImageProps {
  file: File;
  alt: string;
  className?: string;
}

export default function PreviewImage({ file, alt, className }: PreviewImageProps) {
  // Créer une URL temporaire pour l'affichage de l'image
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);
  
  // Nettoyer l'URL quand le composant se démonte
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
}