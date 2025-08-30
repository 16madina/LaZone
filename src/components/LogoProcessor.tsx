import React, { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/utils/background-removal';

interface LogoProcessorProps {
  originalSrc: string;
  alt: string;
  className?: string;
}

const LogoProcessor: React.FC<LogoProcessorProps> = ({ originalSrc, alt, className }) => {
  const [processedSrc, setProcessedSrc] = useState<string>(originalSrc);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        
        // Fetch the original image
        const response = await fetch(originalSrc);
        const blob = await response.blob();
        
        // Load as HTMLImageElement
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedSrc(processedUrl);
        
      } catch (error) {
        console.error('Error processing logo:', error);
        // Keep original image on error
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, [originalSrc]);

  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={`${className} ${isProcessing ? 'opacity-70' : ''}`}
    />
  );
};

export default LogoProcessor;
