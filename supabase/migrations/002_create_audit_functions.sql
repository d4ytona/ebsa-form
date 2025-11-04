-- =============================================
-- EBSA Form Database Schema - Part 2
-- Funciones y Triggers de Auditoría
-- =============================================

-- =============================================
-- TABLA DE AUDITORÍA CENTRAL
-- =============================================

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Índices para performance
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);
CREATE INDEX idx_audit_action ON audit_log(action);

COMMENT ON TABLE audit_log IS 'Registro central de auditoría para todas las tablas del sistema';
COMMENT ON COLUMN audit_log.changed_fields IS 'Array de nombres de campos que fueron modificados en un UPDATE';

-- =============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Obtener el usuario actual de Supabase Auth
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_updated_at_column IS 'Actualiza automáticamente updated_at y updated_by en cada UPDATE';

-- =============================================
-- FUNCIÓN: Registrar cambios en audit_log
-- =============================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  old_data_json JSONB;
  new_data_json JSONB;
  record_id_value TEXT;
BEGIN
  -- Convertir OLD y NEW a JSONB
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    old_data_json := to_jsonb(OLD);
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    new_data_json := to_jsonb(NEW);
  END IF;

  -- Detectar campos que cambiaron (solo en UPDATE)
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(new_data_json)
    WHERE new_data_json -> key IS DISTINCT FROM old_data_json -> key
      AND key NOT IN ('updated_at', 'updated_by'); -- Excluir campos de auditoría
  END IF;

  -- Obtener el ID del registro (convertido a TEXT para soportar diferentes tipos)
  IF TG_OP = 'DELETE' THEN
    record_id_value := OLD.id::TEXT;
  ELSE
    record_id_value := NEW.id::TEXT;
  END IF;

  -- Insertar registro de auditoría
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    record_id_value,
    TG_OP,
    CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN old_data_json ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN new_data_json ELSE NULL END,
    changed_fields,
    auth.uid()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_func IS 'Registra todos los cambios (INSERT/UPDATE/DELETE) en la tabla audit_log';

-- =============================================
-- FUNCIÓN: Prevenir modificación de audit_log
-- =============================================

CREATE OR REPLACE FUNCTION protect_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'No se permite modificar o eliminar registros de auditoría';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar protección a audit_log
CREATE TRIGGER protect_audit_log_trigger
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION protect_audit_log();

COMMENT ON FUNCTION protect_audit_log IS 'Protege la tabla audit_log de modificaciones y eliminaciones';

-- =============================================
-- FUNCIÓN: Soft Delete
-- =============================================

CREATE OR REPLACE FUNCTION set_deleted_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  NEW.deleted_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_deleted_at IS 'Establece deleted_at y deleted_by para soft delete';

-- =============================================
-- FUNCIÓN: Obtener usuario actual (helper)
-- =============================================

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION current_user_id IS 'Retorna el UUID del usuario autenticado actual';