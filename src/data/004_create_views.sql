-- =============================================
-- EBSA Form Database Schema - Part 4
-- Vistas para Datos Activos (excluyen soft-deleted)
-- =============================================

-- =============================================
-- VISTA: regiones_active
-- =============================================

CREATE VIEW regiones_active AS
  SELECT * FROM regiones WHERE deleted_at IS NULL;

COMMENT ON VIEW regiones_active IS 'Regiones activas (excluye soft-deleted)';

-- =============================================
-- VISTA: comunas_active
-- =============================================

CREATE VIEW comunas_active AS
  SELECT * FROM comunas WHERE deleted_at IS NULL;

COMMENT ON VIEW comunas_active IS 'Comunas activas (excluye soft-deleted)';

-- =============================================
-- VISTA: codigos_vendedor_active
-- =============================================

CREATE VIEW codigos_vendedor_active AS
  SELECT * FROM codigos_vendedor
  WHERE deleted_at IS NULL AND activo = TRUE;

COMMENT ON VIEW codigos_vendedor_active IS 'Códigos de vendedor activos y no eliminados';

-- =============================================
-- VISTA: codigos_vendedor_con_estado
-- =============================================

CREATE VIEW codigos_vendedor_con_estado AS
  SELECT
    id,
    codigo,
    activo,
    CASE
      WHEN deleted_at IS NOT NULL THEN 'eliminado'
      WHEN activo = FALSE THEN 'inactivo'
      ELSE 'activo'
    END as estado,
    created_at,
    updated_at,
    deleted_at
  FROM codigos_vendedor;

COMMENT ON VIEW codigos_vendedor_con_estado IS 'Códigos con su estado calculado (activo/inactivo/eliminado)';

-- =============================================
-- VISTA: planes_active
-- =============================================

CREATE VIEW planes_active AS
  SELECT * FROM planes
  WHERE deleted_at IS NULL
    AND disponible = TRUE
    AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE);

COMMENT ON VIEW planes_active IS 'Planes disponibles dentro del rango de vigencia';

-- =============================================
-- VISTA: productos_adicionales_active
-- =============================================

CREATE VIEW productos_adicionales_active AS
  SELECT * FROM productos_adicionales
  WHERE deleted_at IS NULL AND disponible = TRUE;

COMMENT ON VIEW productos_adicionales_active IS 'Productos adicionales disponibles';

-- =============================================
-- VISTA: feriados_active
-- =============================================

CREATE VIEW feriados_active AS
  SELECT * FROM feriados WHERE deleted_at IS NULL;

COMMENT ON VIEW feriados_active IS 'Feriados activos';

-- =============================================
-- VISTA: tramos_horarios_active
-- =============================================

CREATE VIEW tramos_horarios_active AS
  SELECT * FROM tramos_horarios WHERE deleted_at IS NULL;

COMMENT ON VIEW tramos_horarios_active IS 'Tramos horarios activos';

-- =============================================
-- VISTA: equipos_active
-- =============================================

CREATE VIEW equipos_active AS
  SELECT * FROM equipos
  WHERE deleted_at IS NULL AND activo = TRUE;

COMMENT ON VIEW equipos_active IS 'Equipos activos';

-- =============================================
-- VISTA: vendedores_active
-- =============================================

CREATE VIEW vendedores_active AS
  SELECT * FROM vendedores
  WHERE deleted_at IS NULL AND activo = TRUE;

COMMENT ON VIEW vendedores_active IS 'Vendedores activos';

-- =============================================
-- VISTA COMBINADA: vendedores_con_equipo
-- =============================================

CREATE VIEW vendedores_con_equipo AS
  SELECT
    v.id,
    v.nombre,
    v.email,
    v.telefono,
    v.tipo,
    v.activo,
    e.id as equipo_id,
    e.email as equipo_email,
    e.nombre_equipo,
    e.supervisor,
    v.created_at,
    v.updated_at
  FROM vendedores v
  JOIN equipos e ON v.equipo_id = e.id
  WHERE v.deleted_at IS NULL AND e.deleted_at IS NULL;

COMMENT ON VIEW vendedores_con_equipo IS 'Vendedores con información de su equipo';

-- =============================================
-- VISTA COMBINADA: vendedores_con_equipo_active
-- =============================================

CREATE VIEW vendedores_con_equipo_active AS
  SELECT
    v.id,
    v.nombre,
    v.email,
    v.telefono,
    v.tipo,
    e.id as equipo_id,
    e.email as equipo_email,
    e.nombre_equipo,
    e.supervisor
  FROM vendedores v
  JOIN equipos e ON v.equipo_id = e.id
  WHERE v.deleted_at IS NULL
    AND e.deleted_at IS NULL
    AND v.activo = TRUE
    AND e.activo = TRUE;

COMMENT ON VIEW vendedores_con_equipo_active IS 'Vendedores activos con sus equipos activos';

-- =============================================
-- VISTA COMBINADA: comunas_con_region
-- =============================================

CREATE VIEW comunas_con_region AS
  SELECT
    c.id,
    c.nombre as comuna,
    r.id as region_id,
    r.nombre as region,
    c.created_at,
    c.updated_at
  FROM comunas c
  JOIN regiones r ON c.region_id = r.id
  WHERE c.deleted_at IS NULL AND r.deleted_at IS NULL;

COMMENT ON VIEW comunas_con_region IS 'Comunas con información de su región';

-- =============================================
-- VISTA: planes_por_marca_y_segmento
-- =============================================

CREATE VIEW planes_por_marca_y_segmento AS
  SELECT
    marca,
    segmento,
    categoria,
    COUNT(*) as total_planes,
    COUNT(*) FILTER (WHERE disponible = TRUE) as planes_disponibles,
    AVG(precio) as precio_promedio
  FROM planes
  WHERE deleted_at IS NULL
  GROUP BY marca, segmento, categoria;

COMMENT ON VIEW planes_por_marca_y_segmento IS 'Resumen de planes agrupados por marca, segmento y categoría';
