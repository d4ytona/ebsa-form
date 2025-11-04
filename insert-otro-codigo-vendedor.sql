-- ========================================
-- Insertar código "otro" para casos especiales
-- ========================================

-- Insertar código "otro" en la tabla codigos_vendedor
INSERT INTO codigos_vendedor (codigo, activo)
VALUES ('otro', true)
ON CONFLICT (codigo) DO UPDATE
SET activo = true;

-- ========================================
-- Insertar vendedor "otro" en cada equipo
-- ========================================

-- Insertar vendedor "otro" para cada equipo existente
INSERT INTO vendedores (nombre, email, telefono, tipo, equipo_id, activo)
SELECT
  'otro' as nombre,
  NULL as email,
  NULL as telefono,
  'honorario' as tipo,
  id as equipo_id,
  true as activo
FROM equipos
WHERE activo = true
ON CONFLICT (nombre, equipo_id) DO UPDATE
SET activo = true;

-- Verificar que se insertaron correctamente
SELECT 'Códigos "otro":', COUNT(*) FROM codigos_vendedor WHERE codigo = 'otro';
SELECT 'Vendedores "otro":', COUNT(*) FROM vendedores WHERE nombre = 'otro';
