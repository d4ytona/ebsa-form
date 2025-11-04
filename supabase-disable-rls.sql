-- Desactivar Row Level Security (RLS) en todas las tablas
-- ADVERTENCIA: Esto permite acceso completo a todas las tablas desde el cliente
-- Solo usar en desarrollo o si no necesitas restricciones de seguridad

-- Opción 1: Desactivar RLS completamente (más simple)
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_vendedor DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tramos_horarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE planes DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si prefieres mantener RLS pero dar acceso completo (descomentar si prefieres esta opción)
-- DROP POLICY IF EXISTS "Allow all access to pedidos" ON pedidos;
-- CREATE POLICY "Allow all access to pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Allow all access to vendedores" ON vendedores;
-- CREATE POLICY "Allow all access to vendedores" ON vendedores FOR ALL USING (true) WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Allow all access to codigos_vendedor" ON codigos_vendedor;
-- CREATE POLICY "Allow all access to codigos_vendedor" ON codigos_vendedor FOR ALL USING (true) WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Allow all access to equipos" ON equipos;
-- CREATE POLICY "Allow all access to equipos" ON equipos FOR ALL USING (true) WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Allow all access to tramos_horarios" ON tramos_horarios;
-- CREATE POLICY "Allow all access to tramos_horarios" ON tramos_horarios FOR ALL USING (true) WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Allow all access to planes" ON planes;
-- CREATE POLICY "Allow all access to planes" ON planes FOR ALL USING (true) WITH CHECK (true);

-- Verificar estado de RLS en todas las tablas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
