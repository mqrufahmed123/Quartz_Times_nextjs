"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Film,
  ImageOff,
} from "lucide-react";
import { IProductMedia, IProductVideo } from "@/types";
import { Modal } from "@/components/common/Modal";
export interface ProductGalleryProps {
  images: IProductMedia[];
  video?: IProductVideo;
  productName: string;
}
export const ProductGallery = ({
  images,
  video,
  productName,
}: ProductGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const photos = images || [];
  const current = photos[index] || photos[0];
  const move = (delta: number) => {
    if (!photos.length) return;
    setVideoActive(false);
    setIndex((value) => (value + delta + photos.length) % photos.length);
  };
  const arrows = (
    <>
      <button
        onClick={() => move(-1)}
        className="icon-button absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-black"
        aria-label="Previous photo"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => move(1)}
        className="icon-button absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-black"
        aria-label="Next photo"
      >
        <ChevronRight size={20} />
      </button>
    </>
  );
  return (
    <div>
      <div className="qt-gallery-stage">
        {videoActive && video?.url ? (
          <video
            src={video.url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        ) : current ? (
          <button
            type="button"
            className="relative cursor-zoom-in"
            onClick={() => setLightbox(true)}
            aria-label={`Enlarge ${productName} photo ${index + 1}`}
          >
            <Image
              src={current.url}
              alt={current.alt || `${productName}, view ${index + 1}`}
              fill
              priority
              sizes="(max-width: 639px) 100vw, 55vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 qt-muted">
            <ImageOff size={36} strokeWidth={1} />
            <p className="text-sm">Photos coming soon</p>
          </div>
        )}
        {current && !videoActive && (
          <button
            onClick={() => setLightbox(true)}
            className="icon-button absolute top-4 right-4 bg-white/90 text-black"
            aria-label="Expand image"
          >
            <Maximize2 size={17} />
          </button>
        )}
        {photos.length > 1 && !videoActive && arrows}
        <span
          aria-live="polite"
          className="absolute bottom-4 left-4 bg-white/90 text-black px-3 py-1.5 text-xs rounded-full"
        >
          {videoActive
            ? "Product video"
            : photos.length
              ? `${index + 1} / ${photos.length}`
              : "No photos yet"}
        </span>
      </div>
      {(photos.length > 1 || video?.url) && (
        <div className="qt-gallery-thumbs" aria-label="Product media">
          {photos.map((photo, i) => (
            <button
              key={photo.url + i}
              onClick={() => {
                setVideoActive(false);
                setIndex(i);
              }}
              aria-pressed={!videoActive && index === i}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={photo.url}
                alt={photo.alt || `Product thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
          {video?.url && (
            <button
              onClick={() => setVideoActive(true)}
              aria-pressed={videoActive}
              aria-label="Play product video"
              className="flex flex-col items-center justify-center gap-2"
            >
              <Film size={20} />
              <span className="text-xs">Video</span>
            </button>
          )}
        </div>
      )}
      {lightbox && current && (
        <Modal
          title={`${productName} · ${index + 1} / ${photos.length}`}
          onClose={() => setLightbox(false)}
          className="qt-lightbox"
        >
          <div className="qt-lightbox-photo">
            <Image
              src={current.url}
              alt={current.alt || productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {photos.length > 1 && arrows}
          </div>
        </Modal>
      )}
    </div>
  );
};
