-- Agregar columna codigo_usuario a la tabla equipos
-- Esta columna permitirá login con código además de email

ALTER TABLE equipos
ADD COLUMN IF NOT EXISTS codigo_usuario VARCHAR(10) UNIQUE;

-- Agregar comentario a la columna
COMMENT ON COLUMN equipos.codigo_usuario IS 'Código numérico único para login alternativo (ej: 100103)';

-- Crear índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_equipos_codigo_usuario ON equipos(codigo_usuario);

-- Insertar/actualizar códigos de usuario para cada equipo
UPDATE equipos SET codigo_usuario = '100103' WHERE email = 'eliasf@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200101' WHERE email = 'elias.tapia@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200603' WHERE email = 'ismael.fernandez@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200401' WHERE email = 'valeria.diaz@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200508' WHERE email = 'esteban.celis@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200301' WHERE email = 'felipe.castillo@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200302' WHERE email = 'luis.torres@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200303' WHERE email = 'roberto.padilla@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200304' WHERE email = 'valentina.agostini@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200501' WHERE email = 'gonzalo.bernal@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '200506' WHERE email = 'franco.munoz@ebsaspa.cl';
UPDATE equipos SET codigo_usuario = '300102' WHERE email = 'jorge.fuenzalida@ebsaspa.cl';

-- Verificar que se insertaron correctamente
SELECT email, codigo_usuario, nombre
FROM equipos
WHERE codigo_usuario IS NOT NULL
ORDER BY codigo_usuario;
