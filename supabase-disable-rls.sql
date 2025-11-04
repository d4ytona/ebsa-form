-- Desactivar Row Level Security (RLS) en todas las tablas
-- ADVERTENCIA: Esto permite acceso completo a todas las tablas desde el cliente
-- Solo usar en desarrollo o si no necesitas restricciones de seguridad

-- Desactivar RLS en tabla pedidos
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla vendedores (si existe)
ALTER TABLE vendedores DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla codigos_vendedor (si existe)
ALTER TABLE codigos_vendedor DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla equipos (si existe)
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla tramos_horarios (si existe)
ALTER TABLE tramos_horarios DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS en tabla planes (si existe)
ALTER TABLE planes DISABLE ROW LEVEL SECURITY;

-- Verificar estado de RLS en todas las tablas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
