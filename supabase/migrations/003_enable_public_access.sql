-- Migración: Habilitar acceso público total a tabla pedidos
-- Fecha: 2025-11-05
-- Descripción: Eliminar todas las políticas RLS existentes y permitir acceso público completo

-- ========================================
-- PASO 1: Verificar políticas actuales
-- ========================================
SELECT
  'Políticas actuales en tabla pedidos:' as info,
  policyname,
  cmd as operacion,
  roles as roles_permitidos,
  qual as condicion_select,
  with_check as condicion_insert
FROM pg_policies
WHERE tablename = 'pedidos';

-- ========================================
-- PASO 2: Eliminar TODAS las políticas existentes
-- ========================================
-- Nota: Ejecuta estas líneas manualmente según las políticas que veas arriba
-- Reemplaza 'nombre_politica' con los nombres reales de las políticas

-- Ejemplos (descomenta y adapta según las políticas existentes):
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON pedidos;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON pedidos;
-- DROP POLICY IF EXISTS "Allow public inserts" ON pedidos;
-- DROP POLICY IF EXISTS "Allow public selects" ON pedidos;

-- Si no sabes los nombres exactos, puedes ejecutar este comando dinámicamente:
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'pedidos'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON pedidos', pol.policyname);
        RAISE NOTICE 'Política eliminada: %', pol.policyname;
    END LOOP;
END $$;

-- ========================================
-- PASO 3: Crear política de acceso público TOTAL
-- ========================================
-- Esta política permite a CUALQUIER usuario (incluyendo anon) hacer TODO

CREATE POLICY "Permitir todo público"
ON pedidos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ========================================
-- PASO 4: Verificar que RLS está habilitado pero con acceso público
-- ========================================
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'pedidos';

-- ========================================
-- PASO 5: Verificar la nueva política
-- ========================================
SELECT
  'Nueva configuración:' as info,
  policyname,
  cmd as operacion,
  roles as roles_permitidos,
  'Cualquier usuario puede hacer todo' as descripcion
FROM pg_policies
WHERE tablename = 'pedidos';

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- Deberías ver:
-- 1. Una sola política llamada "Permitir todo público"
-- 2. Operación: ALL (INSERT, SELECT, UPDATE, DELETE)
-- 3. Roles: {public}
-- 4. Sin restricciones (USING y WITH CHECK = true)
