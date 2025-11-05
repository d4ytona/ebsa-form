-- Script completo para resolver permisos en tabla pedidos
-- Ejecutar TODO este script de una vez en Supabase SQL Editor

-- ========================================
-- PASO 1: Verificar permisos de la tabla
-- ========================================
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'pedidos'
ORDER BY grantee, privilege_type;

-- ========================================
-- PASO 2: Otorgar permisos GRANT directos
-- ========================================
-- Estos permisos son diferentes de las políticas RLS
-- Son permisos a nivel de PostgreSQL

-- Otorgar todos los permisos a anon (usuario anónimo del frontend)
GRANT ALL ON pedidos TO anon;

-- Otorgar todos los permisos a authenticated (usuarios autenticados)
GRANT ALL ON pedidos TO authenticated;

-- Otorgar permisos al rol public (por si acaso)
GRANT ALL ON pedidos TO public;

-- ========================================
-- PASO 3: Otorgar permisos de secuencia (para IDs)
-- ========================================
-- Si la tabla usa una secuencia para el ID
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- ========================================
-- PASO 4: Verificar que RLS está habilitado con políticas correctas
-- ========================================
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'pedidos';

-- ========================================
-- PASO 5: Verificar política
-- ========================================
SELECT
  policyname,
  cmd as operacion,
  roles
FROM pg_policies
WHERE tablename = 'pedidos';

-- ========================================
-- PASO 6: Verificar permisos otorgados
-- ========================================
SELECT
  'Permisos después de la corrección:' as info,
  grantee,
  string_agg(privilege_type, ', ') as permisos
FROM information_schema.role_table_grants
WHERE table_name = 'pedidos'
GROUP BY grantee
ORDER BY grantee;

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- Deberías ver permisos para:
-- - anon: SELECT, INSERT, UPDATE, DELETE
-- - authenticated: SELECT, INSERT, UPDATE, DELETE
-- - Política RLS: "Permitir todo público" para ALL operations
