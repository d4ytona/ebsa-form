-- Script para verificar políticas RLS actuales en tabla pedidos
-- Ejecutar en Supabase SQL Editor

-- 1. Ver si RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN 'RLS HABILITADO ✓'
    ELSE 'RLS DESHABILITADO ✗'
  END as estado
FROM pg_tables
WHERE tablename = 'pedidos';

-- 2. Listar TODAS las políticas actuales
SELECT
  policyname as nombre_politica,
  cmd as operacion,
  roles as roles,
  qual as condicion_using,
  with_check as condicion_with_check
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- 3. Contar políticas
SELECT
  COUNT(*) as total_politicas,
  CASE
    WHEN COUNT(*) = 0 THEN 'Sin políticas (todo bloqueado por defecto)'
    ELSE CONCAT(COUNT(*), ' política(s) activa(s)')
  END as descripcion
FROM pg_policies
WHERE tablename = 'pedidos';
