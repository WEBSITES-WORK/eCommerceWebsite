import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Star,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Reusable Product Image Uploader Component
 *
 * @param {Array<string>} images - Array of image URL strings
 * @param {Function} onChange - Callback receiving updated array of image URLs
 * @param {number} maxImages - Maximum number of allowable images (default 8)
 */
const ImageUploader = ({ images = [], onChange, maxImages = 8, dark = false }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Validate a single file
  const validateFile = (file) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `File "${file.name}" is not a supported format. Please upload JPG, PNG, WebP, or GIF.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowable size is 5MB.`;
    }
    return null;
  };

  // Handle file uploads (single or multiple)
  const handleFiles = async (fileList) => {
    setErrorMessage('');
    const files = Array.from(fileList);
    if (!files.length) return;

    // Check count limit
    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      setErrorMessage(`You can only add ${remainingSlots} more ${remainingSlots === 1 ? 'image' : 'images'} (maximum ${maxImages}).`);
      showToast(`Limit reached. Maximum ${maxImages} images allowed.`, 'error');
      return;
    }

    // Validate all files
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        showToast(error, 'error');
        return;
      }
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      if (files.length === 1) {
        formData.append('image', files[0]);
      } else {
        files.forEach((file) => formData.append('images', file));
      }

      const endpoint = files.length === 1 ? '/upload' : '/upload/multiple';

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setUploadProgress(100);

      if (res.success && res.data) {
        let newUrls = [];
        if (Array.isArray(res.data)) {
          newUrls = res.data.map((item) => item.url);
        } else if (res.data.url) {
          newUrls = [res.data.url];
        }

        const updatedImages = [...images, ...newUrls];
        onChange(updatedImages);
        showToast(`Successfully uploaded ${newUrls.length} ${newUrls.length === 1 ? 'image' : 'images'}`, 'success');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err.response?.data?.message || err.message || 'Image upload failed. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Replace a specific image
  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      showToast(error, 'error');
      return;
    }

    const oldUrl = images[replacingIndex];

    try {
      setUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('image', file);
      if (oldUrl) formData.append('old_url', oldUrl);

      const res = await api.post('/upload/replace', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setUploadProgress(100);

      if (res.success && res.data?.url) {
        const updated = [...images];
        updated[replacingIndex] = res.data.url;
        onChange(updated);
        showToast('Image replaced successfully', 'success');
      }
    } catch (err) {
      console.error('Replace failed:', err);
      showToast(err.message || 'Failed to replace image', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setReplacingIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Remove an image
  const handleRemove = async (indexToRemove) => {
    const urlToRemove = images[indexToRemove];
    const updated = images.filter((_, i) => i !== indexToRemove);
    onChange(updated);

    if (urlToRemove) {
      api.delete('/upload', { data: { url: urlToRemove } }).catch((err) => {
        console.warn('Background delete warning:', err);
      });
    }
    showToast('Image removed', 'info');
  };

  // Set an image as primary (move to index 0)
  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    const updated = [target, ...remaining];
    onChange(updated);
    showToast('Primary cover image updated', 'success');
  };

  // Move image position (reorder)
  const handleMove = (index, direction) => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  // Manual URL append
  const handleAddManualUrl = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    if (images.length >= maxImages) {
      showToast(`Maximum limit of ${maxImages} images reached`, 'error');
      return;
    }

    onChange([...images, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlInput(false);
    showToast('Image URL added', 'success');
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Header controls & stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${dark ? 'text-[#F5F7FA]' : 'text-slate-900'}`}>Product Gallery</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            dark ? 'bg-[#101318] text-[#A5ACB8] border border-[#252B35]' : 'bg-slate-100 text-slate-600'
          }`}>
            {images.length} / {maxImages} images
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 transition"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL Input' : 'Add via URL'}
        </button>
      </div>

      {/* Manual URL Input Dropdown */}
      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className={`flex gap-2 p-3 rounded-2xl border ${
          dark ? 'bg-[#101318] border-[#252B35]' : 'bg-slate-50 border-slate-200'
        }`}>
          <input
            type="url"
            placeholder="Paste external image URL (e.g. https://images.unsplash.com/...)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-xl outline-none border focus:border-emerald-500 ${
              dark
                ? 'bg-[#151922] border-[#252B35] text-[#F5F7FA] placeholder-[#707887]'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
          >
            Add URL
          </button>
        </form>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in ${
          dark ? 'bg-rose-950/40 border border-rose-900/60 text-rose-300' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Image Validation Error</p>
            <p className="text-[11px] mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-400 hover:text-rose-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className={`p-3 rounded-2xl space-y-1.5 animate-in fade-in border ${
          dark ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className={`flex justify-between text-[11px] font-bold ${
            dark ? 'text-emerald-400' : 'text-emerald-800'
          }`}>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              Uploading & optimizing images...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            dark ? 'bg-[#151922]' : 'bg-emerald-200'
          }`}>
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Drag & Drop Zone (if room allows) */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : dark
              ? 'border-[#252B35] hover:border-emerald-500/80 bg-[#101318]/60 hover:bg-[#151922]'
              : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
              dark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold ${dark ? 'text-[#F5F7FA]' : 'text-slate-800'}`}>
                Click to browse or drag and drop images here
              </p>
              <p className={`text-[11px] mt-0.5 ${dark ? 'text-[#707887]' : 'text-slate-400'}`}>
                PNG, JPG, WebP, or GIF up to 5MB each · Maximum {maxImages} images
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
          {images.map((url, idx) => {
            const isPrimary = idx === 0;

            return (
              <div
                key={url + idx}
                className={`group relative rounded-2xl overflow-hidden border transition shadow-xs ${
                  dark ? 'bg-[#101318]' : 'bg-white'
                } ${
                  isPrimary
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : dark
                    ? 'border-[#252B35] hover:border-[#353D4B]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Thumbnail Image */}
                <div className={`aspect-square w-full relative overflow-hidden ${dark ? 'bg-[#151922]' : 'bg-slate-50'}`}>
                  <img
                    src={url}
                    alt={`Product view ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> Cover
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/70 hover:bg-emerald-600 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition shadow-sm flex items-center gap-1 backdrop-blur-xs"
                      title="Set as Primary Cover Image"
                    >
                      <Star className="w-3 h-3" /> Make Cover
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-sm backdrop-blur-xs"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Hover Action Bar */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-between text-white text-[10px]">
                    {/* Reorder Arrows */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'left')}
                        className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(idx, 'right')}
                        className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Move right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Replace Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIndex(idx);
                        replaceInputRef.current?.click();
                      }}
                      className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/40 font-bold transition flex items-center gap-1"
                      title="Replace with new file"
                    >
                      <RefreshCw className="w-3 h-3" /> Replace
                    </button>
                  </div>
                </div>

                {/* Footer slot indicator */}
                <div className={`p-2 border-t flex items-center justify-between text-[10px] font-medium ${
                  dark ? 'border-[#252B35] text-[#A5ACB8]' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>Photo {idx + 1}</span>
                  <span className={`truncate max-w-[90px] font-mono text-[9px] ${
                    dark ? 'text-[#707887]' : 'text-slate-400'
                  }`}>
                    {url.split('/').pop()}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add more tile if below maxImages */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`aspect-square rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center gap-1 ${
                dark
                  ? 'border-[#252B35] hover:border-emerald-500 bg-[#101318]/50 text-[#707887] hover:text-emerald-400'
                  : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-400 hover:text-emerald-600'
              }`}
            >
              <Plus className="w-6 h-6" />
              <span className="text-[11px] font-bold">Add Photo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
