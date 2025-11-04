-- =============================================
-- EBSA Form Database Schema - Part 1
-- Tipos ENUM
-- =============================================

-- =============================================
-- CREAR TIPOS ENUM
-- =============================================

CREATE TYPE numero_region AS ENUM ('i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi');
CREATE TYPE tipo_marca AS ENUM ('vtr', 'claro');
CREATE TYPE tipo_campana AS ENUM ('terreno', 'contacto', 'publicidad');
CREATE TYPE tipo_validacion AS ENUM ('facial', 'cuestionario', 'excepcion');
CREATE TYPE tipo_venta AS ENUM ('nueva', 'paquetizacion', 'reingreso', 'pago_puf');
CREATE TYPE tipo_vendedor AS ENUM ('honorario', 'contratado');
CREATE TYPE tipo_segmento AS ENUM ('residencial', 'negocio', 'convenio');
CREATE TYPE tipo_plan_tv AS ENUM ('inicia', 'plus', 'premium');
CREATE TYPE categoria_rgu AS ENUM ('1_rgu', '2_rgu', '3_rgu', 'paquetizacion');
CREATE TYPE categoria_adicional AS ENUM ('decodificadores', 'extensores', 'canales', 'descuentos');
CREATE TYPE velocidad_internet AS ENUM ('500mb', '600mb', '800mb', '940mb');

-- =============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =============================================

COMMENT ON TYPE numero_region IS 'Número de región en romano (i a xvi) - usado como ID';
COMMENT ON TYPE tipo_marca IS 'Marcas disponibles: VTR, Claro';
COMMENT ON TYPE tipo_campana IS 'Tipos de campaña: Terreno, Contacto, Publicidad';
COMMENT ON TYPE tipo_validacion IS 'Tipos de validación: Facial, Cuestionario, Excepción';
COMMENT ON TYPE tipo_venta IS 'Tipos de venta: Nueva, Paquetización, Reingreso, Pago PUF';
COMMENT ON TYPE tipo_vendedor IS 'Tipos de vendedor: Honorario, Contratado';
COMMENT ON TYPE tipo_segmento IS 'Segmentos de mercado: Residencial, Negocio, Convenio';
COMMENT ON TYPE tipo_plan_tv IS 'Planes de TV: Inicia, Plus, Premium';
COMMENT ON TYPE categoria_rgu IS 'Categorías RGU: 1_RGU, 2_RGU, 3_RGU, Paquetización';
COMMENT ON TYPE categoria_adicional IS 'Categorías de productos adicionales';
COMMENT ON TYPE velocidad_internet IS 'Velocidades de internet disponibles';
