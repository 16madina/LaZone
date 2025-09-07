import { useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ImagePreviewProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  isMainPhoto?: boolean;
}

export default function ImagePreview({ file, index, onRemove, isMainPhoto = false }: ImagePreviewProps) {
  // Créer une URL temporaire pour l'affichage de l'image
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);
  
  // Nettoyer l'URL quand le composant se démonte
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);
  
  return (
    <div className="relative group">
      <img
        src={imageUrl}
        alt={`Upload ${index + 1}`}
        className="w-full h-20 object-cover rounded-lg"
      />
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-1 right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <X className="w-3 h-3" />
      </Button>
      {isMainPhoto && (
        <Badge className="absolute bottom-1 left-1 text-xs">Photo principale</Badge>
      )}
    </div>
  );
}