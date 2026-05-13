import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';

/**
 * Ejemplo de uso del componente ImageUpload
 * Esta página muestra cómo integrar carga de imágenes en cualquier formulario
 */
export default function ImageUploadExample() {
  const [imageUrl, setImageUrl] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    console.log('Imagen subida:', url);
  };

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ejemplo: Carga de Imágenes</h1>
        <p className="text-gray-600 mb-8">
          Sube imágenes a Firebase Storage y recibe la URL para usarla en tu aplicación.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Carga tu imagen</h2>
          
          <ImageUpload
            onImageUrlChange={handleImageUrlChange}
            path="ejemplos/"
            showPreview={true}
          />

          {imageUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">✓ Imagen subida correctamente!</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={imageUrl}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono text-gray-700 bg-white"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm transition"
                >
                  {copiedToClipboard ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Vista previa en tu HTML:</p>
                <img
                  src={imageUrl}
                  alt="Imagen subida"
                  className="w-full max-w-md h-auto rounded-lg"
                />
              </div>

              <div className="mt-4 p-3 bg-gray-800 text-green-400 rounded font-mono text-xs overflow-auto">
                <p>{'<img src="' + imageUrl + '" />'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cómo integrar en tus componentes</h2>
          
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <pre className="text-xs text-gray-800 font-mono">
{`import ImageUpload from '../components/ImageUpload';
import { useState } from 'react';

export default function MyComponent() {
  const [imageUrl, setImageUrl] = useState(null);

  return (
    <div>
      <ImageUpload
        onImageUrlChange={setImageUrl}
        path="my-uploads/"
        showPreview={true}
      />

      {imageUrl && (
        <img src={imageUrl} alt="Subida" />
      )}
    </div>
  );
}`}
            </pre>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="font-semibold text-gray-700 text-sm">Props del componente:</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li><strong>onImageUrlChange</strong>: Callback que recibe la URL cuando se sube</li>
                <li><strong>path</strong>: Ruta en Firebase Storage (default: "uploads/")</li>
                <li><strong>showPreview</strong>: Mostrar preview mientras se sube (default: true)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
