-- =============================================
-- EBSA Form Database Schema - Part 6
-- Inserción de Datos: Códigos de Vendedor, Equipos y Vendedores
-- =============================================

-- =============================================
-- INSERTAR CÓDIGOS DE VENDEDOR (SOLO EBSA)
-- =============================================

INSERT INTO codigos_vendedor (codigo, activo) VALUES
('aagostini', true),
('aespina', true),
('agraterol', true),
('amoyam', true),
('aulloaf', true),
('bgaray', true),
('carayair', true),
('cetapia', true),
('cmundaca', true),
('cnunezm', true),
('cpalmap', true),
('ecelis', true),
('egonzalezy', true),
('einzunza', true),
('etapiac', true),
('evaldesf', true),
('fcontreras', true),
('fortegaz', true),
('fsotob', true),
('gagostini', true),
('jhgonzalez', true),
('kulloa', true),
('ltorresg', true),
('lumunoz', true),
('macastroli', true),
('mcarrascoe', true),
('meduran', true),
('mgalvezm', true),
('mifernandezm', true),
('mzunigas', true),
('onavarrete', true),
('pcorreap', true),
('rpadilla', true),
('rsalinasg', true),
('skmedina', true),
('slarag', true),
('tcornejo', true),
('ugonzalezm', true),
('vadiazs', true),
('vgallegos', true);

-- =============================================
-- INSERTAR EQUIPOS
-- =============================================

INSERT INTO equipos (email, nombre_equipo, supervisor, activo) VALUES
('jose.solano@ebsaspa.cl', 'test', 'jose solano', true),
('canal.digital@ebsaspa.cl', 'canal digital', 'braulio salinas', true),
('machine@ebsaspa.cl', 'machine', 'yetzabeth martinez', true),
('notrex@ebsaspa.cl', 'notrex', 'yetzabeth martinez', true),
('elias.tapia@ebsaspa.cl', 'elias tapia', 'elias tapia', true),
('valeria.diaz@ebsaspa.cl', 'valeria diaz', 'elias tapia', true),
('esteban.celis@ebsaspa.cl', 'esteban celis', 'elias tapia', true),
('ismael.fernandez@ebsaspa.cl', 'ismael fernandez', 'elias tapia', true),
('felipe.castillo@ebsaspa.cl', 'felipe castillo', 'cristian letelier', true),
('luis.torres@ebsaspa.cl', 'luis torres', 'cristian letelier', true),
('roberto.padilla@ebsaspa.cl', 'roberto padilla', 'cristian letelier', true),
('valentina.agostini@ebsaspa.cl', 'valentina agostini', 'cristian letelier', true),
('gonzalo.bernal@ebsaspa.cl', 'gonzalo bernal', 'cristian letelier', true),
('franco.munoz@ebsaspa.cl', 'franco munoz', 'francisco silva', true),
('ariel.palacios@ebsaspa.cl', 'ariel palacios', 'francisco silva', true),
('gerald.alarcon@ebsaspa.cl', 'gerald alarcon', 'francisco silva', true),
('jorge.fuenzalida@ebsaspa.cl', 'jorge fuenzalida', 'jorge fuenzalida', true);

-- =============================================
-- INSERTAR VENDEDORES
-- =============================================

-- Equipo: Test (ID 1)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('test', 'contratado', 1, true),
('braulio salinas', 'contratado', 1, true);

-- Equipo: Canal digital (ID 2)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('canal digital', 'contratado', 2, true);

-- Equipo: Machine (ID 3)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('adriana farías', 'honorario', 3, true),
('daniela ormeño', 'honorario', 3, true),
('david espejo', 'honorario', 3, true),
('desiree oropeza', 'honorario', 3, true),
('fabiana quintero', 'honorario', 3, true),
('franklin prieto', 'honorario', 3, true),
('gledys romero', 'honorario', 3, true),
('gregoria martinez', 'honorario', 3, true),
('jenny alizo', 'honorario', 3, true),
('jesus lopez', 'honorario', 3, true),
('nereida hernandez', 'honorario', 3, true),
('victor machado', 'honorario', 3, true);

-- Equipo: Notrex (ID 4)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('adriana noguera', 'honorario', 4, true),
('andres alvarado', 'honorario', 4, true),
('keiny gonzalez', 'honorario', 4, true),
('lucia boscan', 'honorario', 4, true),
('luis bermudez', 'honorario', 4, true),
('nolbelys carruyo', 'honorario', 4, true),
('omayra cardenas', 'honorario', 4, true),
('pierina puche', 'honorario', 4, true),
('saul reyes', 'honorario', 4, true),
('saray benega', 'honorario', 4, true);

-- Equipo: Elias tapia (ID 5)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('aileen ulloa', 'contratado', 5, true),
('andres muñoz', 'contratado', 5, true),
('celeste venegas', 'contratado', 5, true),
('diego villalobos', 'contratado', 5, true),
('elias tapia', 'contratado', 5, true),
('elizabeth valdes', 'contratado', 5, true),
('gabriel fernandez', 'contratado', 5, true),
('luz leiva', 'contratado', 5, true),
('marcela mancilla', 'contratado', 5, true),
('matias concha', 'contratado', 5, true),
('paola correa', 'contratado', 5, true),
('yuleicy rodriguez', 'contratado', 5, true);

-- Equipo: Valeria diaz (ID 6)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('ana maria moya', 'contratado', 6, true),
('angela sanchez', 'contratado', 6, true),
('barbara garay', 'contratado', 6, true),
('charlie sepulveda', 'contratado', 6, true),
('cristopher romero', 'contratado', 6, true),
('elias insunza (free)', 'contratado', 6, true),
('estephanie medina', 'contratado', 6, true),
('georgina chepe', 'contratado', 6, true),
('hector ramirez', 'contratado', 6, true),
('jessica oliva', 'contratado', 6, true),
('kyle ulloa', 'contratado', 6, true),
('marco castro', 'contratado', 6, true),
('miriam seguel', 'contratado', 6, true),
('nicolas lastra', 'contratado', 6, true),
('olga montecinos', 'contratado', 6, true),
('olivia navarrete', 'contratado', 6, true),
('silvana lara', 'contratado', 6, true),
('tania cornejo', 'contratado', 6, true),
('tania vergara', 'contratado', 6, true),
('valeria diaz', 'contratado', 6, true);

-- Equipo: Esteban celis (ID 7)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('constanza palma', 'contratado', 7, true),
('cristian tache', 'contratado', 7, true),
('esteban celis', 'contratado', 7, true),
('mariana carrasco', 'contratado', 7, true),
('valery gallegos', 'contratado', 7, true);

-- Equipo: Ismael fernandez (ID 8)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('ismael fernandez', 'contratado', 8, true);

-- Equipo: Felipe castillo (ID 9)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('elizabeth rojas', 'contratado', 9, true),
('felipe castillo', 'contratado', 9, true);

-- Equipo: Luis torres (ID 10)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('amanda torres', 'contratado', 10, true),
('ana rodriguez', 'contratado', 10, true),
('ayerim rojas', 'contratado', 10, true),
('estefania rojas', 'contratado', 10, true),
('fran solarte', 'contratado', 10, true),
('jacky castillo', 'contratado', 10, true),
('jean carlos maripan', 'contratado', 10, true),
('kote araneda', 'contratado', 10, true),
('lilian marino', 'contratado', 10, true),
('luis torres', 'contratado', 10, true),
('luris nieves', 'contratado', 10, true),
('maria molero', 'contratado', 10, true),
('mariangel garcia', 'contratado', 10, true),
('paraguay 2.0', 'contratado', 10, true),
('roberto novoa', 'contratado', 10, true),
('sadi ramirez', 'contratado', 10, true),
('sebastian salas', 'contratado', 10, true),
('veronica miranda', 'contratado', 10, true);

-- Equipo: Roberto padilla (ID 11)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('catalina araya', 'contratado', 11, true),
('damaris parra', 'contratado', 11, true),
('duvan gonzalez', 'contratado', 11, true),
('francesca contreras', 'contratado', 11, true),
('georgina pacheco', 'contratado', 11, true),
('manuel galvez', 'contratado', 11, true),
('margarita zuñiga', 'contratado', 11, true),
('michelle llanca', 'contratado', 11, true),
('miguel córdoba', 'contratado', 11, true),
('norma ortiz', 'contratado', 11, true),
('rafael torres', 'contratado', 11, true),
('roberto padilla', 'contratado', 11, true),
('silvia leal', 'contratado', 11, true),
('víctor diaz', 'contratado', 11, true),
('violeta saez', 'contratado', 11, true);

-- Equipo: Valentina agostini (ID 12)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('esteban gonzalez', 'contratado', 12, true),
('karina videla', 'contratado', 12, true),
('makarena sanchez', 'contratado', 12, true),
('valentina agostini', 'contratado', 12, true);

-- Equipo: Gonzalo bernal (ID 13)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('felipe gonzalez', 'contratado', 13, true),
('gonzalo bernal', 'contratado', 13, true),
('jhonny morales', 'contratado', 13, true),
('karla tapia', 'contratado', 13, true),
('nicol vargas', 'contratado', 13, true),
('pablo patiño', 'contratado', 13, true),
('pablo plaza', 'contratado', 13, true),
('rosa valencia', 'contratado', 13, true),
('sergio toro', 'contratado', 13, true),
('thierry leon', 'contratado', 13, true);

-- Equipo: Franco munoz (ID 14)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('franco munoz', 'contratado', 14, true);

-- Equipo: Ariel palacios (ID 15)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('ariel palacios', 'contratado', 15, true);

-- Equipo: Gerald alarcon (ID 16)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('gerald alarcon', 'contratado', 16, true);

-- Equipo: Jorge fuenzalida (ID 17)
INSERT INTO vendedores (nombre, tipo, equipo_id, activo) VALUES
('barbara tapia', 'contratado', 17, true),
('cristian aguila', 'contratado', 17, true),
('dina herrera', 'contratado', 17, true),
('gaston diaz', 'contratado', 17, true),
('jacky castillo', 'contratado', 17, true),
('jocelyn lazo', 'contratado', 17, true),
('jorge fuenzalida', 'contratado', 17, true),
('jose miranda', 'contratado', 17, true),
('lucía duarte', 'contratado', 17, true),
('marcos droguett', 'contratado', 17, true),
('maria troncozo', 'contratado', 17, true),
('maritza arriagada', 'contratado', 17, true),
('natalia hernandez', 'contratado', 17, true),
('nisset polanco', 'contratado', 17, true);
