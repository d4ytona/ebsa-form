-- Eliminar columna fecha_nacimiento de la tabla pedidos
-- Esta columna ya no se utiliza en el formulario

-- Eliminar la columna
ALTER TABLE pedidos DROP COLUMN IF EXISTS fecha_nacimiento;

-- Verificar que se eliminó
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;
