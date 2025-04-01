'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobilePreviewProps {
  images: Array<{
    url: string;
    link: string;
    caption?: string;
    displayAspectRatio: string;
    aspectRatio: string;
  }>;
  type: string;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ images, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      handleNext();
    }
    if (touchEnd - touchStart > 75) {
      // Swipe right
      handlePrev();
    }
  };

  useEffect(() => {
    const interval = type === 'carousel' ? setInterval(handleNext, 3000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [type]);

  const hasInconsistentAspectRatios = () => {
    if (images.length <= 1) return false;
    const firstAspectRatio = images[0].displayAspectRatio;
    return images.some(img => img.displayAspectRatio !== firstAspectRatio);
  };

  const hasAspectRatioMismatch = (img: { displayAspectRatio: string; aspectRatio: string; }) => {
    return img.displayAspectRatio !== img.aspectRatio;
  };

  const getAspectRatioStyle = (aspectRatio: string) => {
    const [width, height] = aspectRatio.split(':').map(Number);
    return {
      paddingTop: `${(height / width) * 100}%`
    };
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile frame */}
      <div className="mx-auto w-[375px] h-[812px] bg-white rounded-[60px] shadow-xl border-8 border-gray-800 relative overflow-hidden">
        {/* Status bar */}
        <div className="h-6 bg-black">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative mt-4 bg-gray-900">
          <div 
            className="relative w-full"
            style={getAspectRatioStyle(images[currentIndex].aspectRatio)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center overflow-hidden ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={image.url}
                  alt={`Slide ${index}`}
                  fill
                  className="object-contain"
                  sizes="375px"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>

          {type === 'carousel' && images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-10"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {(hasInconsistentAspectRatios() || hasAspectRatioMismatch(images[currentIndex])) && (
          <div className="px-4 py-2 mt-8 text-sm">
            <p className="text-yellow-600 font-medium">⚠️ Aspect Ratio Issues:</p>
            {hasInconsistentAspectRatios() && (
              <p className="text-gray-600 mt-1">• Images have different aspect ratios which may cause inconsistent display</p>
            )}
            {hasAspectRatioMismatch(images[currentIndex]) && (
              <p className="text-gray-600 mt-1">• Current image's aspect ratio ({images[currentIndex].displayAspectRatio}) doesn't match selected ratio ({images[currentIndex].aspectRatio})</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};