-- Migración: Agregar columnas nombres y apellidos a tabla pedidos
-- Fecha: 2025-11-05
-- Descripción: Separar nombre_solicitante en nombres y apellidos para mejor manejo de datos

-- Agregar columnas nombres y apellidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nombres VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255);

-- Comentarios
COMMENT ON COLUMN pedidos.nombres IS 'Nombres del solicitante (separado de apellidos)';
COMMENT ON COLUMN pedidos.apellidos IS 'Apellidos del solicitante (separado de nombres)';

-- Verificar que se agregaron las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN ('nombres', 'apellidos')
ORDER BY column_name;
