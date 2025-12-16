import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageGallery = ({ images, initialIndex = 0, onClose }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) setPosition({ x: 0, y: 0 });
  };

  const handleDrag = (_: any, info: { offset: { x: number; y: number } }) => {
    if (scale > 1) {
      setPosition({
        x: position.x + info.offset.x,
        y: position.y + info.offset.y,
      });
    }
  };

  const handleSwipe = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (scale === 1) {
      const swipeThreshold = 50;
      if (info.offset.x > swipeThreshold || info.velocity.x > 500) {
        handlePrev();
      } else if (info.offset.x < -swipeThreshold || info.velocity.x < -500) {
        handleNext();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/95 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <span className="text-primary-foreground font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-primary-foreground disabled:opacity-30"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-primary-foreground disabled:opacity-30"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-primary-foreground"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            drag={scale === 1 ? 'x' : true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={scale === 1 ? handleSwipe : handleDrag}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <motion.img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                scale,
                x: position.x,
                y: position.y,
              }}
              draggable={false}
              onDoubleClick={() => {
                if (scale === 1) {
                  setScale(2);
                } else {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center text-primary-foreground"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center text-primary-foreground"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4">
          <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide">
            {images.map((img, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIndex(idx);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  idx === currentIndex ? 'border-primary' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
