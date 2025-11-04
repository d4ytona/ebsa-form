-- Query para insertar datos de prueba en la tabla pedidos de Supabase
-- Ejecuta este query en la consola SQL de Supabase: https://supabase.com/dashboard/project/yiheqsnsbfmudmpquuco/editor

INSERT INTO pedidos (
  observacion_vendedor,
  marca,
  codigo_vendedor,
  tipo_venta,
  segmento,
  tipo_agente,
  equipo,
  vendedor,
  rut_solicitante,
  nombre_solicitante,
  rut_empresa,
  nombre_empresa,
  region,
  comuna,
  direccion,
  numero_telefono,
  email,
  plan,
  productos_adicionales,
  rgu,
  tipo_campana,
  rut_frontal_url,
  rut_posterior_url,
  factibilidad_url,
  otros_documentos_urls,
  fila_sheets
)
VALUES (
  'COMENTARIO DE PRUEBA DESDE SQL',
  'vtr',
  NULL, -- código no válido, se guarda como null
  'nueva',
  'residencial',
  'honorario',
  NULL, -- equipo null porque vendedor es manual
  NULL, -- vendedor null porque es manual
  '12345678-9',
  'NOMBRE APELLIDO TEST SQL',
  NULL, -- sin rut empresa (residencial)
  NULL, -- sin nombre empresa (residencial)
  'metropolitana',
  'santiago',
  'CALLE TEST SQL 456',
  '987654321',
  'test-sql@test.com',
  'Plan Test SQL - VTR',
  'Adicional Test 1, Adicional Test 2',
  3,
  'terreno',
  'https://r2.test/rut-frontal-sql.jpg',
  'https://r2.test/rut-posterior-sql.jpg',
  'https://r2.test/factibilidad-sql.jpg',
  'https://r2.test/otros-sql.jpg',
  999 -- número de fila ficticio para prueba
)
RETURNING *;

-- Para verificar que se insertó correctamente:
-- SELECT * FROM pedidos WHERE fila_sheets = 999;

-- Para eliminar el registro de prueba después:
-- DELETE FROM pedidos WHERE fila_sheets = 999;
