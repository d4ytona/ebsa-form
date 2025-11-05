-- Script de prueba para verificar la estructura de la tabla pedidos
-- Ejecutar en Supabase SQL Editor para ver las columnas exactas

-- Ver la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- Intentar un insert de prueba (comentado para no ejecutar)
/*
INSERT INTO pedidos (
  observacion_vendedor,
  marca,
  codigo_vendedor,
  tipo_venta,
  segmento,
  tipo_agente,
  equipo_id,
  vendedor_id,
  rut,
  nombres,
  apellidos,
  rut_empresa,
  nombre_empresa,
  region,
  comuna,
  direccion,
  numero_contacto,
  email,
  plan,
  productos_adicionales,
  rgu,
  tiene_internet,
  tiene_television,
  tiene_telefonia,
  velocidad_internet,
  tipo_television,
  fecha_agendamiento,
  tramo_instalacion,
  rut_frontal_url,
  rut_posterior_url,
  factibilidad_url,
  otros_documentos_urls,
  fila_sheets
) VALUES (
  'Prueba',
  'vtr',
  '12345',
  'nueva',
  'residencial',
  'honorario',
  1,
  1,
  '12345678-9',
  'Juan',
  'Pérez',
  null,
  null,
  'metropolitana',
  'Santiago',
  'Av. Test 123',
  '+56912345678',
  'test@test.com',
  'Plan Test',
  null,
  3,
  true,
  true,
  true,
  '500mb',
  'plus',
  '2025-11-10',
  'mañana',
  null,
  null,
  null,
  null,
  100
);
*/
