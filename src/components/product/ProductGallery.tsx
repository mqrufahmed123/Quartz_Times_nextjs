'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { IProductMedia, IProductVideo } from '@/types';

export interface ProductGalleryProps {
  images: IProductMedia[];
  video?: IProductVideo;
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  video,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = images && images.length > 0
    ? images
    : [
        {
          url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
          alt: productName,
          isPrimary: true,
        },
      ];

  const currentMedia = displayImages[selectedIndex] || displayImages[0];

  const handleNext = () => {
    setIsVideoActive(false);
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setIsVideoActive(false);
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Primary Stage */}
      <div className="relative aspect-[4/5] sm:aspect-[1/1] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm group">
        {isVideoActive && video?.url ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              src={video.url}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div
            className="w-full h-full relative cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image
              src={currentMedia.url}
              alt={currentMedia.alt || `${productName} view ${selectedIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-40" />
          </div>
        )}

        {/* Fullscreen Button */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {!isVideoActive && (
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all shadow-md"
              aria-label="Expand image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Gallery Navigation Arrows */}
        {displayImages.length > 1 && !isVideoActive && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Photo Counter Pill */}
        <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold z-10">
          {isVideoActive
            ? 'Product Video'
            : `Photo ${selectedIndex + 1} of ${displayImages.length}`}
        </div>
      </div>

      {/* Thumbnails Row */}
      {(displayImages.length > 1 || video?.url) && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {displayImages.map((img, idx) => {
            const isSelected = !isVideoActive && selectedIndex === idx;
            return (
              <button
                key={img.url + idx}
                onClick={() => {
                  setIsVideoActive(false);
                  setSelectedIndex(idx);
                }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-slate-100 dark:bg-slate-950 ${
                  isSelected
                    ? 'border-amber-500 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </button>
            );
          })}

          {video?.url && (
            <button
              onClick={() => setIsVideoActive(true)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 ${
                isVideoActive
                  ? 'border-amber-500 scale-[1.02] text-amber-500'
                  : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <Film className="w-6 h-6 mb-1 text-amber-500" />
              <span className="text-[9px] uppercase tracking-wider font-bold">
                Video
              </span>
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700 z-50"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full h-[80vh] flex items-center justify-center">
            <Image
              src={currentMedia.url}
              alt={currentMedia.alt || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-slate-200 hover:text-amber-400 border border-slate-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-slate-200 hover:text-amber-400 border border-slate-700"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
