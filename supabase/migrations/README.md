# Migraciones de Base de Datos - EBSA Form

Este directorio contiene las migraciones SQL para la base de datos de Supabase.

## Orden de Ejecución

Las migraciones deben ejecutarse en orden numérico:

### 001_add_nombres_apellidos.sql
**Descripción**: Agrega columnas `nombres` y `apellidos` a la tabla `pedidos`

**Propósito**: Separar el nombre completo del solicitante en campos individuales para:
- Mejor manejo de datos en reingresos
- Facilitar búsquedas y filtros
- Mantener consistencia en autocompletado de formularios

**Ejecutar**:
```sql
-- Copiar y pegar el contenido del archivo en Supabase SQL Editor
```

### 002_remove_tipo_campana.sql
**Descripción**: Elimina la columna `tipo_campana` de la tabla `pedidos`

**Propósito**: Limpiar columnas que ya no se utilizan en el formulario

**Ejecutar**:
```sql
-- Copiar y pegar el contenido del archivo en Supabase SQL Editor
```

## Cómo Aplicar Migraciones

1. Ve al dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a la sección "SQL Editor"
4. Copia el contenido de cada archivo SQL en orden
5. Ejecuta cada migración
6. Verifica los resultados con las queries de verificación incluidas

## Estructura de la Tabla Pedidos (Después de Migraciones)

```
pedidos
├── id (uuid, PK)
├── created_at (timestamp)
├── marca (varchar)
├── tipo_oferta (varchar)
├── observacion_vendedor (text)
├── tipo_validacion (varchar)
├── codigo_vendedor (varchar)
├── tipo_venta (varchar)
├── segmento (varchar)
├── tipo_agente (varchar)
├── equipo (varchar)
├── vendedor (varchar)
├── rut_solicitante (varchar)
├── nombre_solicitante (varchar)
├── nombres (varchar) ← NUEVO
├── apellidos (varchar) ← NUEVO
├── rut_empresa (varchar)
├── nombre_empresa (varchar)
├── region (varchar)
├── comuna (varchar)
├── direccion (text)
├── numero_telefono (varchar)
├── email (varchar)
├── plan (text)
├── productos_adicionales (text)
├── rgu (integer)
├── rut_frontal_url (text)
├── rut_posterior_url (text)
├── factibilidad_url (text)
├── otros_documentos_urls (text)
└── fila_sheets (integer)
```

## Rollback (Revertir)

Si necesitas revertir las migraciones:

### Revertir 002_remove_tipo_campana.sql
```sql
ALTER TABLE pedidos ADD COLUMN tipo_campana VARCHAR(255);
```

### Revertir 001_add_nombres_apellidos.sql
```sql
ALTER TABLE pedidos DROP COLUMN IF EXISTS nombres;
ALTER TABLE pedidos DROP COLUMN IF EXISTS apellidos;
```

## Notas

- Todas las migraciones usan `IF EXISTS` / `IF NOT EXISTS` para ser idempotentes
- Se pueden ejecutar múltiples veces sin causar errores
- Siempre verifica los resultados después de ejecutar
