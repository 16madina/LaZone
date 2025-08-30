import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  title?: string;
  onImageChange?: (index: number) => void;
}

export default function ImageGallery({ 
  images, 
  initialIndex = 0, 
  title = "",
  onImageChange 
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Sync external index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
  };

  // Touch/Swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  // Mouse functionality for desktop
  const onMouseStart = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  return (
    <>
      {/* Main Gallery View */}
      <div className="relative">
        {/* Main Image */}
        <div 
          className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted cursor-pointer group"
          onClick={() => handleImageClick(currentIndex)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseStart}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseEnd}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay to indicate clickable */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-2 rounded-lg">
              Cliquer pour agrandir
            </div>
          </div>


          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex 
                    ? "border-primary scale-105" 
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators for mobile */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/50 hover:bg-muted-foreground/75"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-full w-full h-full p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Main image in modal - click to navigate */}
            <div 
              className="relative max-w-full max-h-full cursor-pointer select-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                
                // Click on left side = previous, right side = next
                if (x < width / 2) {
                  prevImage();
                } else {
                  nextImage();
                }
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseStart}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseEnd}
            >
              <img
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </div>

            {/* Image counter in modal */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation hint */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
              <p>Glissez ou cliquez sur les côtés pour naviguer</p>
              <p className="text-xs mt-1">Appuyez sur Échap pour fermer</p>
            </div>

            {/* Thumbnail strip in modal */}
            {images.length > 1 && images.length <= 8 && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={cn(
                      "flex-shrink-0 w-12 h-8 rounded overflow-hidden border transition-all duration-200",
                      index === currentIndex 
                        ? "border-white scale-110" 
                        : "border-white/30 hover:border-white/60"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}