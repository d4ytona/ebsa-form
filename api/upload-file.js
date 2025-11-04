/**
 * @fileoverview Función serverless para subir archivos a Cloudflare R2.
 * Maneja la autenticación y upload de documentos (RUT, factibilidad, otros).
 *
 * Naming convention:
 * - RUT frontal: rut-frontal/{RUT}-frontal.{ext}
 * - RUT posterior: rut-posterior/{RUT}-posterior.{ext}
 * - Factibilidad: factibilidad-app/{RUT}-factibilidad.{ext}
 * - Otros documentos: otros-documentos/{RUT}-doc-{N}.{ext} (N = 1, 2, 3...)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Configuración del cliente S3 para Cloudflare R2
 */
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Tipos de archivo permitidos
 */
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Mapeo de categorías a carpetas y sufijos
 */
const CATEGORIA_CONFIG = {
  'rut-frontal': { folder: 'rut-frontal', suffix: 'frontal' },
  'rut-posterior': { folder: 'rut-posterior', suffix: 'posterior' },
  'factibilidad-app': { folder: 'factibilidad-app', suffix: 'factibilidad' },
  'otros-documentos': { folder: 'otros-documentos', suffix: 'doc' }
};

/**
 * Tamaño máximo de archivo: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Sanitizar RUT para nombre de archivo (remover puntos y guión)
 */
function sanitizeRut(rut) {
  return rut.replace(/[.-]/g, '');
}

/**
 * Handler principal para upload de archivos
 *
 * @param {Object} req - Request de Vercel
 * @param {Object} res - Response de Vercel
 *
 * @description
 * Request body:
 * {
 *   file: string (base64),
 *   filename: string,
 *   contentType: string,
 *   categoria: string ('rut-frontal' | 'rut-posterior' | 'factibilidad-app' | 'otros-documentos'),
 *   rut: string (RUT del cliente, formato: 12345678-9),
 *   docNumber: number (opcional, solo para otros-documentos)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   url: string (URL pública del archivo),
 *   key: string (key en R2)
 * }
 */
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('=== Inicio de upload-file ===');
    const { file, filename, contentType, categoria, rut, docNumber } = req.body;

    console.log('Datos recibidos:', {
      hasFile: !!file,
      filename,
      contentType,
      categoria,
      rut,
      docNumber,
      fileSize: file ? file.length : 0
    });

    // Validaciones
    if (!file || !filename || !contentType || !categoria || !rut) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: file, filename, contentType, categoria, rut'
      });
    }

    // Validar categoría
    if (!CATEGORIA_CONFIG[categoria]) {
      return res.status(400).json({
        success: false,
        message: `Categoría no válida: ${categoria}. Permitidas: ${Object.keys(CATEGORIA_CONFIG).join(', ')}`
      });
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES[contentType]) {
      return res.status(400).json({
        success: false,
        message: `Tipo de archivo no permitido: ${contentType}. Permitidos: ${Object.keys(ALLOWED_TYPES).join(', ')}`
      });
    }

    // Convertir base64 a Buffer
    const base64Data = file.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validar tamaño
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Archivo demasiado grande. Máximo: 10MB, recibido: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Construir nombre de archivo
    const extension = ALLOWED_TYPES[contentType];
    const rutSanitized = sanitizeRut(rut);
    const config = CATEGORIA_CONFIG[categoria];

    let fileName;
    if (categoria === 'otros-documentos') {
      // Para otros documentos: {RUT}-doc-{N}.{ext}
      const docNum = docNumber || 1;
      fileName = `${rutSanitized}-${config.suffix}-${docNum}.${extension}`;
    } else {
      // Para documentos únicos: {RUT}-{suffix}.{ext}
      fileName = `${rutSanitized}-${config.suffix}.${extension}`;
    }

    const key = `${config.folder}/${fileName}`;

    console.log(`Subiendo archivo: ${key} (${buffer.length} bytes)`);
    console.log('Variables R2:', {
      accountId: process.env.R2_ACCOUNT_ID?.substring(0, 8) + '...',
      bucketName: process.env.R2_BUCKET_NAME,
      hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
    });

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        originalName: filename,
        categoria: categoria,
        rut: rut,
        uploadedAt: new Date().toISOString()
      }
    });

    console.log('Enviando comando a R2...');
    await S3.send(command);
    console.log('Comando enviado exitosamente');

    // Construir URL pública usando el dominio personalizado
    const publicUrl = `https://ebsaspa.cl/${key}`;

    console.log(`Archivo subido exitosamente: ${publicUrl}`);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      key: key,
      size: buffer.length,
      contentType: contentType,
      filename: fileName
    });

  } catch (error) {
    console.error('=== Error al subir archivo a R2 ===');
    console.error('Error completo:', error);
    console.error('Stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message,
      errorName: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
