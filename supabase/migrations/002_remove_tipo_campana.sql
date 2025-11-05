-- Migración: Eliminar columna tipo_campana de tabla pedidos
-- Fecha: 2025-11-05
-- Descripción: Campo tipo_campana ya no se utiliza en el formulario

-- Eliminar la columna tipo_campana
ALTER TABLE pedidos DROP COLUMN IF EXISTS tipo_campana;

-- Verificar que se eliminó la columna
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name = 'tipo_campana';

-- Si no retorna filas, la columna fue eliminada exitosamente
