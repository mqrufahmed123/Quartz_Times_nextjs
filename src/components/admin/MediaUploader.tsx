'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { readImageDrop } from '@/lib/imageDrop';

export interface MediaUploaderProps {
  images: IProductMedia[];
  video?: IProductVideo;
  onChangeImages: (images: IProductMedia[]) => void;
  onChangeVideo: (video?: IProductVideo) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  video,
  onChangeImages,
  onChangeVideo,
  onUploadingChange,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'images' | 'video' | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);
  const dragDepth = useRef(0);
  const isDisabled = disabled || uploading;
  useEffect(() => { onUploadingChange?.(uploading); }, [uploading, onUploadingChange]);

  const uploadPhotos = async (readSources: () => Promise<{ files: File[]; urls: string[] }>) => {
    if (isDisabled || uploadLock.current) return;
    uploadLock.current = true;
    setUploading(true);
    setUploadType('images');
    setUploadError('');
    setUploadMessage('');
    setUploadProgress({ completed: 0, total: 0 });

    try {
      const sources = await readSources();
      const entries: Array<File | string> = [...sources.files, ...sources.urls];
      if (!entries.length) throw new Error('Drop an image file or drag an image directly from a browser tab.');
      const newImagesList: IProductMedia[] = [...images];
      const errors: string[] = [];
      let added = 0;
      setUploadProgress({ completed: 0, total: entries.length });

      for (let index = 0; index < entries.length; index++) {
        const source = entries[index];
        let sessionExpired = false;
        try {
          let request: RequestInit;
          if (typeof source === 'string') {
            request = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: source }) };
          } else {
            if (source.size > 15 * 1024 * 1024) throw new Error(`${source.name}: photos must be 15 MB or smaller.`);
            const formData = new FormData();
            formData.append('file', source);
            formData.append('type', 'image');
            request = { method: 'POST', body: formData };
          }
          const res = await fetch('/api/upload', request);
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            sessionExpired = res.status === 401;
            throw new Error(sessionExpired ? 'Your admin session expired. Sign in again before uploading.' : data.error || 'Failed to upload photo.');
          }
          newImagesList.push({
            url: data.url,
            publicId: data.publicId,
            width: data.width,
            height: data.height,
            alt: typeof source !== 'string' && source.name.length <= 150 && /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(source.name) ? source.name.replace(/\.[^/.]+$/, '') : 'Product photo',
            isPrimary: newImagesList.length === 0,
          });
          onChangeImages([...newImagesList]);
          added++;
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Failed to upload photo.');
        } finally {
          setUploadProgress({ completed: index + 1, total: entries.length });
        }
        if (sessionExpired) break;
      }
      if (added) setUploadMessage(`${added} ${added === 1 ? 'photo' : 'photos'} added. Save the product to keep your changes.`);
      if (errors.length) setUploadError(`${errors.length > 1 ? `${errors.length} photos could not be added. ` : ''}${errors[0]}`);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      uploadLock.current = false;
      setUploading(false);
      setUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) void uploadPhotos(async () => ({ files, urls: [] }));
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    void uploadPhotos(() => readImageDrop(event.dataTransfer, window.location.origin));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled || uploadLock.current) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    uploadLock.current = true;
    setUploading(true);
    setUploadType('video');
    setUploadError('');
    setUploadMessage('');

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
      uploadLock.current = false;
      setUploading(false);
      setUploadType(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const setPrimary = (index: number) => {
    if (isDisabled) return;
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChangeImages(updated);
  };

  const removeImage = (index: number) => {
    if (isDisabled) return;
    const updated = images.filter((_, i) => i !== index);
    // If the removed image was primary, set the first one as primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChangeImages(updated);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (isDisabled) return;
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
              Upload clear front, side, back, and wrist photos. HEIC photos are converted to JPG automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              disabled={isDisabled}
              accept="image/*,.heic,.heif"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {uploadType === 'images' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
              ) : (
                <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>{uploadType === 'images' ? 'Uploading…' : 'Upload Photos'}</span>
            </button>

            <input
              ref={videoInputRef}
              type="file"
              disabled={isDisabled}
              accept="video/*,.mov,.mp4"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isDisabled}
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
          <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isDisabled}
        aria-label="Upload photos or drop images here"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={event => { event.preventDefault(); if (!isDisabled) { dragDepth.current++; setIsDragging(true); } }}
        onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = isDisabled ? 'none' : 'copy'; }}
        onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setIsDragging(false); }}
        onDrop={handleDrop}
        className={`flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-wait sm:p-8 ${isDragging ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'border-slate-300 bg-slate-50 hover:border-amber-500 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-amber-500'}`}
      >
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-amber-500" /> : <Upload className={`h-8 w-8 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />}
        <span role="status" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {uploading ? uploadType === 'video' ? 'Uploading video…' : uploadProgress.total ? `Uploading photo ${Math.min(uploadProgress.completed + 1, uploadProgress.total)} of ${uploadProgress.total}…` : 'Preparing photos…' : isDragging ? 'Drop images to upload' : 'Drag & drop photos here'}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">From your computer or another browser tab · or click to browse</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG, WebP, GIF, AVIF, HEIC · Up to 15 MB per photo</span>
      </button>
      {uploadMessage && <p role="status" className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle className="h-4 w-4 shrink-0" />{uploadMessage}</p>}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
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
                  disabled={isDisabled}
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-50 dark:bg-slate-950/80 text-rose-300 hover:text-rose-100 hover:bg-rose-900/80 transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Controls */}
              <input
                type="text"
                disabled={isDisabled}
                aria-label={`Photo ${idx + 1} description`}
                value={img.alt || ''}
                onChange={event => { if (!isDisabled) onChangeImages(images.map((image, index) => index === idx ? { ...image, alt: event.target.value } : image)); }}
                placeholder="Photo description"
                className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isDisabled || idx === 0}
                    onClick={() => moveImage(idx, 'left')}
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isDisabled || idx === images.length - 1}
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
                    disabled={isDisabled}
                    onClick={() => setPrimary(idx)}
                    className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:text-amber-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Set Primary
                  </button>
                )}
              </div>
            </div>
          ))}
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
            disabled={isDisabled}
            onClick={() => { if (!isDisabled) onChangeVideo(undefined); }}
            className="text-xs text-rose-400 hover:text-rose-300 uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove Video
          </button>
        </div>
      )}
    </div>
  );
};
