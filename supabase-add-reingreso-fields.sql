-- Agregar columnas necesarias para funcionalidad de reingreso
-- Estas columnas permiten autocompletar formularios desde pedidos anteriores

-- Agregar campos de servicios (para saber qué servicios tenía el cliente)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tiene_internet BOOLEAN DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tiene_television BOOLEAN DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tiene_telefonia BOOLEAN DEFAULT false;

-- Agregar configuración de servicios (velocidad internet, tipo TV)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS velocidad_internet VARCHAR(50);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_television VARCHAR(50);

-- Agregar datos de agendamiento
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_agendamiento DATE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tramo_instalacion VARCHAR(50);

-- Agregar nombres separados (útil para autocompletado individual)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nombres VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255);

-- Comentarios
COMMENT ON COLUMN pedidos.tiene_internet IS 'Indica si el pedido incluye servicio de internet';
COMMENT ON COLUMN pedidos.tiene_television IS 'Indica si el pedido incluye servicio de televisión';
COMMENT ON COLUMN pedidos.tiene_telefonia IS 'Indica si el pedido incluye servicio de telefonía';
COMMENT ON COLUMN pedidos.velocidad_internet IS 'Velocidad del plan de internet (ej: 500mb, 1gb)';
COMMENT ON COLUMN pedidos.tipo_television IS 'Tipo de plan de TV (ej: inicia, plus, premium)';
COMMENT ON COLUMN pedidos.fecha_agendamiento IS 'Fecha programada para la instalación';
COMMENT ON COLUMN pedidos.tramo_instalacion IS 'Tramo horario para la instalación (ej: mañana, tarde)';
COMMENT ON COLUMN pedidos.nombres IS 'Nombres del solicitante (separado de apellidos)';
COMMENT ON COLUMN pedidos.apellidos IS 'Apellidos del solicitante (separado de nombres)';

-- Verificar que se agregaron las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN (
    'tiene_internet', 'tiene_television', 'tiene_telefonia',
    'velocidad_internet', 'tipo_television',
    'fecha_agendamiento', 'tramo_instalacion',
    'nombres', 'apellidos'
  )
ORDER BY column_name;
