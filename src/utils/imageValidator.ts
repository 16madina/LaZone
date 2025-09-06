/**
 * Image validation utility for production readiness
 */

export const validateImage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return false;
  }

  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

export const validateAllImages = async (images: string[]): Promise<string[]> => {
  if (!images || images.length === 0) {
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&crop=center'];
  }

  // Filter out placeholder and invalid images
  const validImages: string[] = [];
  
  for (const image of images) {
    if (image && image !== '/placeholder.svg' && image.trim() !== '') {
      // For Supabase images, we trust they exist since they were uploaded
      if (image.includes('supabase.co/storage/v1/object/public/')) {
        validImages.push(image);
      } else {
        // For external images, validate
        const isValid = await validateImage(image);
        if (isValid) {
          validImages.push(image);
        }
      }
    }
  }

  // If no valid images found, return fallback
  return validImages.length > 0 ? validImages : 
    ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&crop=center'];
};

export const getImageLoadError = (imageSrc: string): string => {
  if (!imageSrc) return 'Image source is empty';
  if (imageSrc === '/placeholder.svg') return 'Placeholder image not replaced';
  if (!imageSrc.startsWith('http')) return 'Invalid image URL format';
  return 'Image failed to load';
};

export const logImageErrors = (propertyId: string, images: string[], errors: string[]) => {
  if (errors.length > 0) {
    console.warn(`Property ${propertyId} has image issues:`, {
      images,
      errors,
      timestamp: new Date().toISOString()
    });
  }
};