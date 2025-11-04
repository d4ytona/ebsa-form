-- =============================================
-- EBSA Form Database Schema - Part 3
-- Tablas Principales con Auditoría y Soft Delete
-- =============================================

-- =============================================
-- TABLA: regiones
-- =============================================

CREATE TABLE regiones (
  id numero_region PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_regiones_nombre ON regiones(nombre);

-- Triggers
CREATE TRIGGER update_regiones_updated_at
  BEFORE UPDATE ON regiones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_regiones
  AFTER INSERT OR UPDATE OR DELETE ON regiones
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE regiones IS 'Regiones de Chile usando número romano como ID';
COMMENT ON COLUMN regiones.id IS 'Número romano de la región (i, ii, iii, etc.)';
COMMENT ON COLUMN regiones.nombre IS 'Nombre de la región en minúsculas';

-- =============================================
-- TABLA: comunas
-- =============================================

CREATE TABLE comunas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  region_id numero_region NOT NULL REFERENCES regiones(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id),

  UNIQUE(nombre, region_id)
);

CREATE INDEX idx_comunas_region ON comunas(region_id);
CREATE INDEX idx_comunas_nombre ON comunas(nombre);

-- Triggers
CREATE TRIGGER update_comunas_updated_at
  BEFORE UPDATE ON comunas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_comunas
  AFTER INSERT OR UPDATE OR DELETE ON comunas
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE comunas IS 'Comunas de Chile asociadas a regiones';
COMMENT ON COLUMN comunas.nombre IS 'Nombre de la comuna en minúsculas';

-- =============================================
-- TABLA: codigos_vendedor
-- =============================================

CREATE TABLE codigos_vendedor (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE NOT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_codigos_activo ON codigos_vendedor(activo) WHERE activo = TRUE;
CREATE INDEX idx_codigos_codigo ON codigos_vendedor(codigo);

-- Triggers
CREATE TRIGGER update_codigos_vendedor_updated_at
  BEFORE UPDATE ON codigos_vendedor
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_codigos_vendedor
  AFTER INSERT OR UPDATE OR DELETE ON codigos_vendedor
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE codigos_vendedor IS 'Códigos de vendedores (cambian frecuentemente)';
COMMENT ON COLUMN codigos_vendedor.activo IS 'Permite desactivar códigos sin eliminarlos (soft disable)';
COMMENT ON COLUMN codigos_vendedor.codigo IS 'Código del vendedor en minúsculas';

-- =============================================
-- TABLA: planes
-- =============================================

CREATE TABLE planes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  marca tipo_marca NOT NULL,
  segmento tipo_segmento NOT NULL,
  categoria categoria_rgu NOT NULL,
  precio INTEGER NOT NULL DEFAULT 0,
  descuento_nacional INTEGER DEFAULT 0,
  descuento_especial INTEGER DEFAULT NULL,
  duracion VARCHAR(50) NOT NULL,
  rgu INTEGER NOT NULL CHECK (rgu >= 1 AND rgu <= 3),

  -- Servicios
  internet_activo BOOLEAN DEFAULT FALSE,
  internet_velocidad velocidad_internet DEFAULT NULL,
  television_activa BOOLEAN DEFAULT FALSE,
  television_plan tipo_plan_tv DEFAULT NULL,
  telefonia_activa BOOLEAN DEFAULT FALSE,

  -- Disponibilidad
  disponible BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_inicio DATE DEFAULT NULL,
  fecha_fin DATE DEFAULT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_planes_marca ON planes(marca);
CREATE INDEX idx_planes_segmento ON planes(segmento);
CREATE INDEX idx_planes_categoria ON planes(categoria);
CREATE INDEX idx_planes_disponible ON planes(disponible) WHERE disponible = TRUE;
CREATE INDEX idx_planes_fecha_vigencia ON planes(fecha_inicio, fecha_fin);
CREATE INDEX idx_planes_rgu ON planes(rgu);

-- Triggers
CREATE TRIGGER update_planes_updated_at
  BEFORE UPDATE ON planes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_planes
  AFTER INSERT OR UPDATE OR DELETE ON planes
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE planes IS 'Planes de servicios (residencial, negocio, convenio) por marca';
COMMENT ON COLUMN planes.marca IS 'Marca del plan (vtr, claro)';
COMMENT ON COLUMN planes.disponible IS 'Controla disponibilidad del plan sin eliminarlo';
COMMENT ON COLUMN planes.fecha_inicio IS 'Fecha de inicio de vigencia del plan';
COMMENT ON COLUMN planes.fecha_fin IS 'Fecha de fin de vigencia del plan';

-- =============================================
-- TABLA: productos_adicionales
-- =============================================

CREATE TABLE productos_adicionales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  categoria categoria_adicional NOT NULL,
  precio INTEGER NOT NULL DEFAULT 0,
  descuento INTEGER DEFAULT 0,
  disponible BOOLEAN DEFAULT TRUE NOT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_productos_categoria ON productos_adicionales(categoria);
CREATE INDEX idx_productos_disponible ON productos_adicionales(disponible) WHERE disponible = TRUE;

-- Triggers
CREATE TRIGGER update_productos_adicionales_updated_at
  BEFORE UPDATE ON productos_adicionales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_productos_adicionales
  AFTER INSERT OR UPDATE OR DELETE ON productos_adicionales
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE productos_adicionales IS 'Productos adicionales (decodificadores, extensores, canales, descuentos)';
COMMENT ON COLUMN productos_adicionales.disponible IS 'Controla disponibilidad del producto sin eliminarlo';

-- =============================================
-- TABLA: feriados
-- =============================================

CREATE TABLE feriados (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  nombre VARCHAR(200),

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_feriados_fecha ON feriados(fecha);

-- Triggers
CREATE TRIGGER update_feriados_updated_at
  BEFORE UPDATE ON feriados
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_feriados
  AFTER INSERT OR UPDATE OR DELETE ON feriados
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE feriados IS 'Días feriados en Chile';

-- =============================================
-- TABLA: tramos_horarios
-- =============================================

CREATE TABLE tramos_horarios (
  id VARCHAR(10) PRIMARY KEY,
  inicio TIME NOT NULL,
  fin TIME NOT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Triggers
CREATE TRIGGER update_tramos_horarios_updated_at
  BEFORE UPDATE ON tramos_horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_tramos_horarios
  AFTER INSERT OR UPDATE OR DELETE ON tramos_horarios
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE tramos_horarios IS 'Tramos horarios para agendamiento (a, b, c)';
COMMENT ON COLUMN tramos_horarios.id IS 'ID manual: a, b, c (tú lo escribes)';

-- =============================================
-- TABLA: equipos
-- =============================================

CREATE TABLE equipos (
  id SERIAL PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  nombre_equipo VARCHAR(200) NOT NULL,
  supervisor VARCHAR(200) NOT NULL,
  activo BOOLEAN DEFAULT TRUE NOT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_equipos_email ON equipos(email);
CREATE INDEX idx_equipos_activo ON equipos(activo) WHERE activo = TRUE;

-- Triggers
CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON equipos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_equipos
  AFTER INSERT OR UPDATE OR DELETE ON equipos
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE equipos IS 'Equipos de ventas con supervisor';
COMMENT ON COLUMN equipos.activo IS 'Permite desactivar equipos sin eliminarlos';

-- =============================================
-- TABLA: vendedores
-- =============================================

CREATE TABLE vendedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  tipo tipo_vendedor NOT NULL,
  equipo_id INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT TRUE NOT NULL,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  deleted_by UUID REFERENCES auth.users(id),

  UNIQUE(nombre, equipo_id)
);

CREATE INDEX idx_vendedores_equipo ON vendedores(equipo_id);
CREATE INDEX idx_vendedores_tipo ON vendedores(tipo);
CREATE INDEX idx_vendedores_activo ON vendedores(activo) WHERE activo = TRUE;

-- Triggers
CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON vendedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_vendedores
  AFTER INSERT OR UPDATE OR DELETE ON vendedores
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TABLE vendedores IS 'Vendedores asociados a equipos';
COMMENT ON COLUMN vendedores.tipo IS 'Tipo de contrato: honorario o contratado';
COMMENT ON COLUMN vendedores.activo IS 'Permite desactivar vendedores sin eliminarlos';
