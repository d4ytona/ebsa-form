const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
  console.log('🔍 Probando la query de getPedidosPorEquipo...\n');

  // Simular el email del usuario (ajusta según tu usuario)
  const userEmail = 'machine@ebsaspa.cl';

  console.log('1. Buscando equipo para:', userEmail);
  const { data: equipos, error: equipoError } = await supabase
    .from('equipos_active')
    .select('nombre_equipo, email')
    .eq('email', userEmail.toLowerCase())
    .limit(1);

  if (equipoError) {
    console.error('❌ Error obteniendo equipo:', equipoError);

    // Mostrar todos los equipos disponibles
    console.log('\nℹ️  Mostrando todos los equipos disponibles:');
    const { data: todosEquipos } = await supabase
      .from('equipos_active')
      .select('email, nombre_equipo')
      .limit(10);

    if (todosEquipos) {
      todosEquipos.forEach(e => {
        console.log(`   - ${e.email} → ${e.nombre_equipo}`);
      });
    }
    return;
  }

  if (!equipos || equipos.length === 0) {
    console.log('❌ No se encontró equipo para este email');
    console.log('   Verifica que el email exista en la tabla equipos_active');

    // Mostrar todos los equipos disponibles
    console.log('\nℹ️  Mostrando todos los equipos disponibles:');
    const { data: todosEquipos } = await supabase
      .from('equipos_active')
      .select('email, nombre_equipo')
      .limit(10);

    if (todosEquipos) {
      todosEquipos.forEach(e => {
        console.log(`   - ${e.email} → ${e.nombre_equipo}`);
      });
    }
    return;
  }

  const nombreEquipo = equipos[0].nombre_equipo;
  console.log('✅ Equipo encontrado:', nombreEquipo);

  console.log('\n2. Buscando pedidos del equipo...');
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('equipo', nombreEquipo)
    .order('created_at', { ascending: false });

  if (pedidosError) {
    console.error('❌ Error obteniendo pedidos:', pedidosError);
    return;
  }

  console.log('✅ Pedidos encontrados:', pedidos?.length || 0);

  if (pedidos && pedidos.length > 0) {
    console.log('\n📄 Pedidos:');
    pedidos.forEach((p, i) => {
      console.log(`\n${i+1}. RUT: ${p.rut_solicitante}`);
      console.log(`   Equipo guardado: "${p.equipo}"`);
      console.log(`   Vendedor: ${p.vendedor}`);
      console.log(`   Dirección: ${p.direccion}, ${p.comuna}`);
    });
  } else {
    console.log('\n⚠️  No hay pedidos para el equipo:', nombreEquipo);
    console.log('\n3. Verificando todos los pedidos...');
    const { data: todosPedidos } = await supabase
      .from('pedidos')
      .select('equipo, rut_solicitante')
      .limit(10);

    if (todosPedidos && todosPedidos.length > 0) {
      console.log('Pedidos existentes en la tabla:');
      todosPedidos.forEach(p => {
        console.log(`   - RUT: ${p.rut_solicitante}, Equipo: "${p.equipo}"`);
      });
    }
  }
}

testQuery()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
