import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/firebase';

/**
 * Componente reutilizable para subir imágenes a Firebase Storage
 * @param {Function} onImageUrlChange - Callback con la URL de la imagen subida
 * @param {string} path - Ruta en Storage donde guardar (default: "uploads/")
 * @param {boolean} showPreview - Mostrar preview de la imagen (default: true)
 */
export default function ImageUpload({ onImageUrlChange, path = "uploads/", showPreview = true }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Mostrar preview mientras se sube
      if (showPreview) {
        const reader = new FileReader();
        reader.onload = (evt) => setPreview(evt.target?.result);
        reader.readAsDataURL(file);
      }

      // Subir a Firebase
      const url = await uploadImage(file, path);
      
      // Llamar callback con URL
      if (onImageUrlChange) {
        onImageUrlChange(url);
      }

      setError(null);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setError(err.message || 'Error subiendo imagen');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[var(--pjc-primary)] transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          hidden
        />
        
        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        {uploading ? (
          <p className="text-sm text-gray-500">Subiendo imagen...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Haz clic para seleccionar una imagen</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {showPreview && preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
