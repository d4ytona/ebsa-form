-- =============================================
-- EBSA Form Database Schema - Part 7
-- Inserción de Datos: Configuración (Tramos, Productos Adicionales)
-- =============================================

-- =============================================
-- INSERTAR TRAMOS HORARIOS
-- =============================================

INSERT INTO tramos_horarios (id, inicio, fin) VALUES
('a', '10:00', '13:00'),
('b', '13:00', '16:00'),
('c', '16:00', '19:00');

-- =============================================
-- INSERTAR PRODUCTOS ADICIONALES
-- =============================================

-- Decodificadores
INSERT INTO productos_adicionales (nombre, categoria, precio, descuento, disponible) VALUES
('d-box smart hd', 'decodificadores', 2990, 0, true),
('d-box smart', 'decodificadores', 3990, 0, true);

-- Extensores
INSERT INTO productos_adicionales (nombre, categoria, precio, descuento, disponible) VALUES
('extensor smart desk', 'extensores', 3000, 0, true);

-- Canales
INSERT INTO productos_adicionales (nombre, categoria, precio, descuento, disponible) VALUES
('tnt sports premium gratis por 2 meses', 'canales', 0, 0, true);

-- Descuentos
INSERT INTO productos_adicionales (nombre, categoria, precio, descuento, disponible) VALUES
('descuento de $10.000 en la primera boleta', 'descuentos', -10000, 0, true);

-- =============================================
-- INSERTAR FERIADOS 2025
-- =============================================

INSERT INTO feriados (fecha, nombre) VALUES
('2025-01-01', 'año nuevo'),
('2025-04-18', 'viernes santo'),
('2025-04-19', 'sábado santo'),
('2025-05-01', 'día nacional del trabajo'),
('2025-05-21', 'día de las glorias navales'),
('2025-06-20', 'día nacional de los pueblos indígenas'),
('2025-06-29', 'san pedro y san pablo'),
('2025-07-16', 'día de la virgen del carmen'),
('2025-08-15', 'asunción de la virgen'),
('2025-09-18', 'independencia nacional'),
('2025-09-19', 'día de las glorias del ejército'),
('2025-10-12', 'encuentro de dos mundos'),
('2025-10-31', 'día de las iglesias evangélicas y protestantes'),
('2025-11-01', 'día de todos los santos'),
('2025-12-08', 'inmaculada concepción'),
('2025-12-25', 'navidad');

-- Nota: Los domingos no se incluyen en la tabla ya que son feriados recurrentes
-- y pueden manejarse mediante lógica en la aplicación (día de semana = 0)
-- Fechas de elecciones (29 junio, 16 noviembre, 14 diciembre) no incluidas
-- ya que están marcadas como "Por Confirmar" en el CSV oficial
