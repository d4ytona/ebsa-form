-- Tabla simple para almacenar pedidos del formulario
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Datos del formulario
  marca VARCHAR(50),
  tipo_oferta VARCHAR(100),
  observacion_vendedor TEXT,
  tipo_validacion VARCHAR(100),
  codigo_vendedor VARCHAR(100),
  tipo_venta VARCHAR(100),
  segmento VARCHAR(50),
  tipo_agente VARCHAR(100),
  equipo VARCHAR(255),
  vendedor VARCHAR(255),

  rut_solicitante VARCHAR(20),
  nombre_solicitante VARCHAR(255),
  rut_empresa VARCHAR(20),
  nombre_empresa VARCHAR(255),

  region VARCHAR(100),
  comuna VARCHAR(100),
  direccion TEXT,
  numero_telefono VARCHAR(20),
  email VARCHAR(255),

  plan TEXT,
  productos_adicionales TEXT,
  rgu INTEGER,
  tipo_campana VARCHAR(100),

  -- Enlaces a archivos R2
  rut_frontal_url TEXT,
  rut_posterior_url TEXT,
  factibilidad_url TEXT,
  otros_documentos_urls TEXT,

  -- Referencia a Sheets
  fila_sheets INTEGER
);

CREATE INDEX idx_pedidos_created_at ON pedidos(created_at DESC);
