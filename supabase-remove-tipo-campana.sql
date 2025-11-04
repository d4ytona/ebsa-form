-- Eliminar columna tipo_campana y su ENUM de la tabla pedidos
-- Esta columna ya no se utiliza en el formulario

-- Paso 1: Eliminar la columna (esto eliminará automáticamente la dependencia del ENUM)
ALTER TABLE pedidos DROP COLUMN IF EXISTS tipo_campana;

-- Paso 2: Eliminar el tipo ENUM si existe
DROP TYPE IF EXISTS tipo_campana;

-- Verificar que se eliminaron
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;
