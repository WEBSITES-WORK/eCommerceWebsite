import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Handles image file uploads directly to Supabase Storage
 */
export const handleStorageUpload = async (url, method, data) => {
  if (!isSupabaseConfigured || method !== 'post') return null;

  if (url === '/upload' || url === '/upload/' || url.includes('/upload')) {
    // Check if data is FormData
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const files = [];

      // Check single image field
      const single = data.get('image');
      if (single && single instanceof File) {
        files.push(single);
      }

      // Check multiple images field
      const multiple = data.getAll('images');
      if (multiple && multiple.length > 0) {
        multiple.forEach((f) => {
          if (f instanceof File) files.push(f);
        });
      }

      if (files.length === 0) {
        throw new Error('No files found in upload request');
      }

      const uploadedResults = [];

      for (const file of files) {
        const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
        const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('[Supabase Storage Upload Error]:', uploadError);
          throw new Error(uploadError.message || 'Failed to upload image to Supabase Storage');
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedResults.push({
          url: urlData.publicUrl,
          path: filePath,
          name: file.name,
          size: file.size,
        });
      }

      if (url.includes('/multiple') || files.length > 1) {
        return {
          success: true,
          message: 'Files uploaded successfully',
          data: uploadedResults,
        };
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        data: uploadedResults[0],
      };
    }
  }

  return null;
};
