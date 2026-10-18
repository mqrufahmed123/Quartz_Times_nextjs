'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Star,
  Film,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { IProductMedia, IProductVideo } from '@/types';

export interface MediaUploaderProps {
  images: IProductMedia[];
  video?: IProductVideo;
  onChangeImages: (images: IProductMedia[]) => void;
  onChangeVideo: (video?: IProductVideo) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  video,
  onChangeImages,
  onChangeVideo,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'images' | 'video' | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadType('images');
    setUploadError('');

    try {
      const newImagesList: IProductMedia[] = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload photo to Cloudinary');
        }

        const data = await res.json();
        newImagesList.push({
          url: data.url,
          publicId: data.publicId,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: newImagesList.length === 0, // make first image primary by default
        });
      }

      onChangeImages(newImagesList);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
      setUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadType('video');
    setUploadError('');

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload video');
      }

      const data = await res.json();
      onChangeVideo({
        url: data.url,
        publicId: data.publicId,
        thumbnailUrl: data.thumbnailUrl,
      });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading video.');
    } finally {
      setUploading(false);
      setUploadType(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChangeImages(updated);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If the removed image was primary, set the first one as primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChangeImages(updated);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChangeImages(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Action Area */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 font-semibold block">
              Product Photos
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload clear front, side, back, and wrist photos. Supports HEIC, JPG, and PNG.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {uploadType === 'images' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
              ) : (
                <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>{uploadType === 'images' ? 'Uploading...' : 'Upload Photos'}</span>
            </button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,.mov,.mp4"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {uploadType === 'video' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
              ) : (
                <Film className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>{uploadType === 'video' ? 'Uploading...' : video?.url ? 'Replace Video' : 'Add Video'}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.url + idx}
              className={`relative rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-950 p-1 space-y-2 transition-all ${
                img.isPrimary
                  ? 'border-amber-500 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:border-slate-600'
              }`}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                <Image
                  src={img.url}
                  alt={img.alt || `Product photo ${idx + 1}`}
                  fill
                  className="object-cover"
                />

                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Primary Cover</span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-50 dark:bg-slate-950/80 text-rose-300 hover:text-rose-100 hover:bg-rose-900/80 transition-colors shadow-md"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, 'left')}
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, 'right')}
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:text-amber-400 transition-colors"
                  >
                    Set Primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3 bg-slate-50 dark:bg-slate-950/40">
          <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No photos added yet. Click &ldquo;Upload Photos&rdquo; to begin.
          </p>
        </div>
      )}

      {/* Video Preview if present */}
      {video?.url && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Product Video Attached</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-xs">{video.url}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeVideo(undefined)}
            className="text-xs text-rose-400 hover:text-rose-300 uppercase tracking-wider"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>
  );
};
