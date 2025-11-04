-- Función RPC para obtener valores de un ENUM en PostgreSQL
-- Esta función permite extraer dinámicamente los valores de cualquier tipo ENUM

CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  enum_values text[];
BEGIN
  -- Obtener todos los valores del ENUM especificado
  SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
  INTO enum_values
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname = enum_name;

  RETURN enum_values;
END;
$$;

-- Ejemplo de uso:
-- SELECT get_enum_values('tipo_campana');
-- Retorna: {"terreno", "contacto", "publicidad"}
