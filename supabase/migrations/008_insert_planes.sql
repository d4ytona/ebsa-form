-- =============================================
-- EBSA Form Database Schema - Part 8
-- Inserción de Datos: Planes VTR Residencial y Negocio
-- =============================================

-- =============================================
-- PLANES VTR RESIDENCIAL - 1 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('internet hogar', 'vtr', 'residencial', '1_rgu', 21990, 5000, NULL, '12 meses', 1, true, '500mb', false, NULL, false, true),
('internet hogar sports', 'vtr', 'residencial', '1_rgu', 27990, 5000, NULL, '12 meses', 1, true, '500mb', false, NULL, false, true),
('fibra hogar', 'vtr', 'residencial', '1_rgu', 21990, 5000, NULL, '12 meses', 1, true, '600mb', false, NULL, false, true),
('fibra hogar sports', 'vtr', 'residencial', '1_rgu', 27990, 5000, NULL, '12 meses', 1, true, '600mb', false, NULL, false, true),
('fibra avanzado', 'vtr', 'residencial', '1_rgu', 23990, 9000, 11000, '12 meses', 1, true, '800mb', false, NULL, false, true),
('fibra avanzado sports', 'vtr', 'residencial', '1_rgu', 29990, 6000, NULL, '12 meses', 1, true, '800mb', false, NULL, false, true),
('fibra experto', 'vtr', 'residencial', '1_rgu', 29990, 8000, NULL, '12 meses', 1, true, '940mb', false, NULL, false, true),
('fibra experto sports', 'vtr', 'residencial', '1_rgu', 35990, 8000, NULL, '12 meses', 1, true, '940mb', false, NULL, false, true),
('stream tv plus', 'vtr', 'residencial', '1_rgu', 22990, NULL, NULL, 'por siempre', 1, false, NULL, true, 'plus', false, true),
('stream tv premium', 'vtr', 'residencial', '1_rgu', 28990, NULL, NULL, 'por siempre', 1, false, NULL, true, 'premium', false, true),
('fono ilimitado 600 móvil', 'vtr', 'residencial', '1_rgu', 12990, NULL, NULL, 'por siempre', 1, false, NULL, false, NULL, true, true);

-- =============================================
-- PLANES VTR RESIDENCIAL - 2 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('2 play inicia internet hogar', 'vtr', 'residencial', '2_rgu', 41990, 17000, NULL, '12 meses', 2, true, '500mb', true, 'inicia', false, true),
('2 play plus internet hogar', 'vtr', 'residencial', '2_rgu', 41990, 11000, 15000, '12 meses', 2, true, '500mb', true, 'plus', false, true),
('2 play premium internet hogar', 'vtr', 'residencial', '2_rgu', 46990, 13000, 19000, '12 meses', 2, true, '500mb', true, 'premium', false, true),
('internet hogar + fono ilimitado 600 móvil', 'vtr', 'residencial', '2_rgu', 23990, 0, NULL, '12 meses', 2, true, '500mb', false, NULL, true, true),
('2 play inicia fibra hogar', 'vtr', 'residencial', '2_rgu', 41990, 17000, NULL, '12 meses', 2, true, '600mb', true, 'inicia', false, true),
('2 play plus fibra hogar', 'vtr', 'residencial', '2_rgu', 41990, 11000, 15000, '12 meses', 2, true, '600mb', true, 'plus', false, true),
('2 play premium fibra hogar', 'vtr', 'residencial', '2_rgu', 46990, 13000, 19000, '12 meses', 2, true, '600mb', true, 'premium', false, true),
('fibra hogar + fono ilimitado 600 móvil', 'vtr', 'residencial', '2_rgu', 23990, 0, NULL, '12 meses', 2, true, '600mb', false, NULL, true, true),
('2 play inicia fibra avanzado', 'vtr', 'residencial', '2_rgu', 42990, 16000, NULL, '12 meses', 2, true, '800mb', true, 'inicia', false, true),
('2 play plus fibra avanzado', 'vtr', 'residencial', '2_rgu', 42990, 9000, 14000, '12 meses', 2, true, '800mb', true, 'plus', false, true),
('2 play premium fibra avanzado', 'vtr', 'residencial', '2_rgu', 47990, 9000, 16000, '12 meses', 2, true, '800mb', true, 'premium', false, true),
('fibra avanzado + fono ilimitado 600 móvil', 'vtr', 'residencial', '2_rgu', 26990, 0, NULL, '12 meses', 2, true, '800mb', false, NULL, true, true),
('2 play inicia fibra experto', 'vtr', 'residencial', '2_rgu', 47990, 17000, NULL, '12 meses', 2, true, '940mb', true, 'inicia', false, true),
('2 play plus fibra experto', 'vtr', 'residencial', '2_rgu', 47990, 11000, 15000, '12 meses', 2, true, '940mb', true, 'plus', false, true),
('2 play premium fibra experto', 'vtr', 'residencial', '2_rgu', 52990, 12000, 18000, '12 meses', 2, true, '940mb', true, 'premium', false, true),
('fibra experto + fono ilimitado 600 móvil', 'vtr', 'residencial', '2_rgu', 35990, 0, NULL, '12 meses', 2, true, '940mb', false, NULL, true, true);

-- =============================================
-- PLANES VTR RESIDENCIAL - 3 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('3 play inicia internet hogar', 'vtr', 'residencial', '3_rgu', 46990, 21000, NULL, '12 meses', 3, true, '500mb', true, 'inicia', true, true),
('3 play plus internet hogar', 'vtr', 'residencial', '3_rgu', 46990, 15000, 19000, '12 meses', 3, true, '500mb', true, 'plus', true, true),
('3 play premium internet hogar', 'vtr', 'residencial', '3_rgu', 51990, 17000, 23000, '12 meses', 3, true, '500mb', true, 'premium', true, true),
('3 play inicia fibra hogar', 'vtr', 'residencial', '3_rgu', 46990, 21000, NULL, '12 meses', 3, true, '600mb', true, 'inicia', true, true),
('3 play plus fibra hogar', 'vtr', 'residencial', '3_rgu', 47990, 16000, 19000, '12 meses', 3, true, '600mb', true, 'plus', true, true),
('3 play premium fibra hogar', 'vtr', 'residencial', '3_rgu', 51990, 17000, 23000, '12 meses', 3, true, '600mb', true, 'premium', true, true),
('3 play inicia fibra avanzado', 'vtr', 'residencial', '3_rgu', 47990, 20000, NULL, '12 meses', 3, true, '800mb', true, 'inicia', true, true),
('3 play plus fibra avanzado', 'vtr', 'residencial', '3_rgu', 47990, 13000, 18000, '12 meses', 3, true, '800mb', true, 'plus', true, true),
('3 play premium fibra avanzado', 'vtr', 'residencial', '3_rgu', 53900, 13990, 20910, '12 meses', 3, true, '800mb', true, 'premium', true, true),
('3 play inicia fibra experto', 'vtr', 'residencial', '3_rgu', 52990, 21000, NULL, '12 meses', 3, true, '940mb', true, 'inicia', true, true),
('3 play plus fibra experto', 'vtr', 'residencial', '3_rgu', 52990, 15000, 19000, '12 meses', 3, true, '940mb', true, 'plus', true, true),
('3 play premium fibra experto', 'vtr', 'residencial', '3_rgu', 58990, 17000, 23000, '12 meses', 3, true, '940mb', true, 'premium', true, true);

-- =============================================
-- PLANES VTR RESIDENCIAL - PAQUETIZACIÓN
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('3 play inicia internet hogar', 'vtr', 'residencial', 'paquetizacion', 46990, 21000, NULL, '12 meses', 2, true, '500mb', true, 'inicia', true, true),
('3 play plus internet hogar', 'vtr', 'residencial', 'paquetizacion', 46990, 15000, 19000, '12 meses', 2, true, '500mb', true, 'plus', true, true),
('3 play premium internet hogar', 'vtr', 'residencial', 'paquetizacion', 51990, 17000, 23000, '12 meses', 2, true, '500mb', true, 'premium', true, true),
('3 play inicia fibra hogar', 'vtr', 'residencial', 'paquetizacion', 46990, 21000, NULL, '12 meses', 2, true, '600mb', true, 'inicia', true, true),
('3 play plus fibra hogar', 'vtr', 'residencial', 'paquetizacion', 47990, 16000, 19000, '12 meses', 2, true, '600mb', true, 'plus', true, true),
('3 play premium fibra hogar', 'vtr', 'residencial', 'paquetizacion', 51990, 17000, 23000, '12 meses', 2, true, '600mb', true, 'premium', true, true),
('3 play inicia fibra avanzado', 'vtr', 'residencial', 'paquetizacion', 47990, 20000, NULL, '12 meses', 2, true, '800mb', true, 'inicia', true, true),
('3 play plus fibra avanzado', 'vtr', 'residencial', 'paquetizacion', 47990, 13000, 18000, '12 meses', 2, true, '800mb', true, 'plus', true, true),
('3 play premium fibra avanzado', 'vtr', 'residencial', 'paquetizacion', 53900, 13990, 20910, '12 meses', 2, true, '800mb', true, 'premium', true, true),
('3 play inicia fibra experto', 'vtr', 'residencial', 'paquetizacion', 52990, 21000, NULL, '12 meses', 2, true, '940mb', true, 'inicia', true, true),
('3 play plus fibra experto', 'vtr', 'residencial', 'paquetizacion', 52990, 15000, 19000, '12 meses', 2, true, '940mb', true, 'plus', true, true),
('3 play premium fibra experto', 'vtr', 'residencial', 'paquetizacion', 52990, 15000, 19000, '12 meses', 2, true, '940mb', true, 'premium', true, true);

-- =============================================
-- PLANES VTR NEGOCIO - 1 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('internet negocios', 'vtr', 'negocio', '1_rgu', 0, 0, NULL, '12 meses', 1, true, '500mb', false, NULL, false, true),
('tv negocios', 'vtr', 'negocio', '1_rgu', 0, 0, NULL, '12 meses', 1, false, NULL, true, NULL, false, true),
('fono ilimitado 600 negocios', 'vtr', 'negocio', '1_rgu', 0, 0, NULL, '12 meses', 1, false, NULL, false, NULL, true, true);

-- =============================================
-- PLANES VTR NEGOCIO - 2 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('2 play negocios más', 'vtr', 'negocio', '2_rgu', 0, 0, NULL, '12 meses', 2, true, '500mb', true, NULL, false, true),
('2 play negocios conectado', 'vtr', 'negocio', '2_rgu', 0, 0, NULL, '12 meses', 2, true, '500mb', false, NULL, true, true);

-- =============================================
-- PLANES VTR NEGOCIO - 3 RGU
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('3 play negocios mas', 'vtr', 'negocio', '3_rgu', 0, 0, NULL, '12 meses', 3, true, '500mb', true, NULL, true, true);

-- =============================================
-- PLANES VTR NEGOCIO - PAQUETIZACIÓN
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('3 play negocios mas', 'vtr', 'negocio', 'paquetizacion', 0, 0, NULL, '12 meses', 2, true, '500mb', true, NULL, true, true);

-- =============================================
-- PLANES CLARO RESIDENCIAL - 1 RGU (1P)
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('fibra hogar', 'claro', 'residencial', '1_rgu', 21990, 6000, NULL, '12 meses', 1, true, '600mb', false, NULL, false, true),
('fibra hogar sport', 'claro', 'residencial', '1_rgu', 27990, 6000, NULL, '12 meses', 1, true, '600mb', false, NULL, false, true),
('fibra avanzado', 'claro', 'residencial', '1_rgu', 23990, 7000, NULL, '12 meses', 1, true, '800mb', false, NULL, false, true),
('fibra avanzado sport', 'claro', 'residencial', '1_rgu', 29990, 7000, NULL, '12 meses', 1, true, '800mb', false, NULL, false, true),
('fibra experto', 'claro', 'residencial', '1_rgu', 29990, 9000, NULL, '12 meses', 1, true, '940mb', false, NULL, false, true),
('fibra experto sport', 'claro', 'residencial', '1_rgu', 35990, 9000, NULL, '12 meses', 1, true, '940mb', false, NULL, false, true);

-- =============================================
-- PLANES CLARO RESIDENCIAL - 2 RGU (2P)
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('2 play fibra hogar + fono', 'claro', 'residencial', '2_rgu', 29990, 6000, NULL, '12 meses', 2, true, '600mb', false, NULL, true, true),
('2 play inicia fibra hogar', 'claro', 'residencial', '2_rgu', 36990, 10000, NULL, '12 meses', 2, true, '600mb', true, 'inicia', false, true),
('2 play plus fibra hogar', 'claro', 'residencial', '2_rgu', 41990, 12000, NULL, '12 meses', 2, true, '600mb', true, 'plus', false, true),
('2 play premium fibra hogar', 'claro', 'residencial', '2_rgu', 46690, 14000, NULL, '12 meses', 2, true, '600mb', true, 'premium', false, true),
('2 play fibra avanzado + fono', 'claro', 'residencial', '2_rgu', 33990, 8000, NULL, '12 meses', 2, true, '800mb', false, NULL, true, true),
('2 play inicia fibra avanzado', 'claro', 'residencial', '2_rgu', 37990, 10000, NULL, '12 meses', 2, true, '800mb', true, 'inicia', false, true),
('2 play plus fibra avanzado', 'claro', 'residencial', '2_rgu', 42990, 10000, NULL, '12 meses', 2, true, '800mb', true, 'plus', false, true),
('2 play premium fibra avanzado', 'claro', 'residencial', '2_rgu', 47990, 10000, NULL, '12 meses', 2, true, '800mb', true, 'premium', false, true),
('2 play fibra experto + fono', 'claro', 'residencial', '2_rgu', 37990, 8000, NULL, '12 meses', 2, true, '940mb', false, NULL, true, true),
('2 play inicia fibra experto', 'claro', 'residencial', '2_rgu', 40990, 10000, NULL, '12 meses', 2, true, '940mb', true, 'inicia', false, true),
('2 play plus fibra experto', 'claro', 'residencial', '2_rgu', 47990, 12000, NULL, '12 meses', 2, true, '940mb', true, 'plus', false, true),
('2 play premium fibra experto', 'claro', 'residencial', '2_rgu', 52990, 13000, NULL, '12 meses', 2, true, '940mb', true, 'premium', false, true);

-- =============================================
-- PLANES CLARO RESIDENCIAL - 3 RGU (3P)
-- =============================================

INSERT INTO planes (nombre, marca, segmento, categoria, precio, descuento_nacional, descuento_especial, duracion, rgu, internet_activo, internet_velocidad, television_activa, television_plan, telefonia_activa, disponible) VALUES
('3 play inicia fibra hogar', 'claro', 'residencial', '3_rgu', 38990, 11000, NULL, '12 meses', 3, true, '600mb', true, 'inicia', true, true),
('3 play plus fibra hogar', 'claro', 'residencial', '3_rgu', 46690, 12000, NULL, '12 meses', 3, true, '600mb', true, 'plus', true, true),
('3 play premium fibra hogar', 'claro', 'residencial', '3_rgu', 51990, 14000, NULL, '12 meses', 3, true, '600mb', true, 'premium', true, true),
('3 play inicia fibra avanzado', 'claro', 'residencial', '3_rgu', 40990, 11000, NULL, '12 meses', 3, true, '800mb', true, 'inicia', true, true),
('3 play plus fibra avanzado', 'claro', 'residencial', '3_rgu', 47990, 11000, NULL, '12 meses', 3, true, '800mb', true, 'plus', true, true),
('3 play premium fibra avanzado', 'claro', 'residencial', '3_rgu', 53990, 14000, NULL, '12 meses', 3, true, '800mb', true, 'premium', true, true),
('3 play inicia fibra experto', 'claro', 'residencial', '3_rgu', 46990, 14000, NULL, '12 meses', 3, true, '940mb', true, 'inicia', true, true),
('3 play plus fibra experto', 'claro', 'residencial', '3_rgu', 52990, 14000, NULL, '12 meses', 3, true, '940mb', true, 'plus', true, true),
('3 play premium fibra experto', 'claro', 'residencial', '3_rgu', 58990, 17000, NULL, '12 meses', 3, true, '940mb', true, 'premium', true, true);
