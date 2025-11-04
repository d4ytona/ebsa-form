/**
 * @fileoverview Componente para upload de archivos a Cloudflare R2.
 * Soporta captura de cámara y selección de archivos.
 */

import { useState, useRef } from 'react';

interface FileUploadProps {
  /** Categoría del documento */
  categoria: 'rut-frontal' | 'rut-posterior' | 'factibilidad-app' | 'otros-documentos';
  /** RUT del cliente para nombrar el archivo */
  rut: string;
  /** Label del botón */
  label: string;
  /** Si permite múltiples archivos (solo otros-documentos) */
  multiple?: boolean;
  /** URLs ya subidas */
  uploadedUrls: string[];
  /** Callback cuando se suben archivos */
  onUploadComplete: (urls: string[]) => void;
  /** Callback de error */
  onError?: (error: string) => void;
}

export function FileUpload({
  categoria,
  rut,
  label,
  multiple = false,
  uploadedUrls,
  onUploadComplete,
  onError
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /**
   * Subir un archivo a R2
   */
  const uploadFile = async (file: File, docNumber?: number): Promise<string | null> => {
    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      // Enviar a API
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Data,
          filename: file.name,
          contentType: file.type,
          categoria,
          rut,
          docNumber
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al subir archivo');
      }

      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Error desconocido');
      }
      return null;
    }
  };

  /**
   * Manejar selección de archivos
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress('Subiendo archivos...');

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Subiendo ${i + 1} de ${files.length}...`);

        // Para otros-documentos, pasar el número de documento
        const docNumber = categoria === 'otros-documentos'
          ? uploadedUrls.length + i + 1
          : undefined;

        const url = await uploadFile(file, docNumber);
        if (url) {
          newUrls.push(url);
        }
      }

      if (newUrls.length > 0) {
        const allUrls = multiple ? [...uploadedUrls, ...newUrls] : newUrls;
        onUploadComplete(allUrls);
        setProgress(`${newUrls.length} archivo(s) subido(s) exitosamente`);

        setTimeout(() => {
          setProgress('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      setProgress('Error al subir archivos');
    } finally {
      setUploading(false);
      // Limpiar input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  /**
   * Eliminar un archivo subido
   */
  const handleRemove = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    onUploadComplete(newUrls);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {multiple && uploadedUrls.length > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            ({uploadedUrls.length} archivo{uploadedUrls.length > 1 ? 's' : ''})
          </span>
        )}
      </label>

      {/* Botones de upload */}
      <div className="flex gap-2 mb-3">
        {/* Botón de cámara */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || (!multiple && uploadedUrls.length > 0)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Cámara
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Botón de archivo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (!multiple && uploadedUrls.length > 0)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Indicador de progreso */}
      {uploading && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">{progress}</span>
          </div>
        </div>
      )}

      {/* Progress message */}
      {!uploading && progress && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-700">{progress}</span>
        </div>
      )}

      {/* Lista de archivos subidos */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          {uploadedUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {url.split('/').pop()}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
                title="Eliminar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
