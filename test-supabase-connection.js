/**
 * Script de prueba para verificar conexión con Supabase y estructura de tabla pedidos
 * Ejecutar con: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de entorno no encontradas');
  console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

console.log('🔗 Conectando a Supabase...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 1. Verificar estructura de tabla
    console.log('\n📋 1. Verificando estructura de tabla pedidos...');
    const { data: columns, error: columnsError } = await supabase
      .from('pedidos')
      .select('*')
      .limit(0);

    if (columnsError) {
      console.error('❌ Error al verificar estructura:', columnsError);
      return;
    }
    console.log('✅ Tabla pedidos existe y es accesible');

    // 2. Contar pedidos existentes
    console.log('\n📊 2. Contando pedidos en la tabla...');
    const { count, error: countError } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar pedidos:', countError);
    } else {
      console.log(`✅ Total de pedidos en la tabla: ${count}`);
    }

    // 3. Obtener últimos 5 pedidos
    console.log('\n📄 3. Obteniendo últimos 5 pedidos...');
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id, created_at, rut_solicitante, nombre_solicitante, nombres, apellidos, marca, tipo_venta')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pedidosError) {
      console.error('❌ Error al obtener pedidos:', pedidosError);
    } else if (!pedidos || pedidos.length === 0) {
      console.log('⚠️  No hay pedidos en la tabla');
    } else {
      console.log(`✅ Últimos ${pedidos.length} pedidos:`);
      pedidos.forEach((pedido, i) => {
        console.log(`\n   ${i + 1}. ID: ${pedido.id}`);
        console.log(`      Fecha: ${pedido.created_at}`);
        console.log(`      RUT: ${pedido.rut_solicitante}`);
        console.log(`      Nombre completo: ${pedido.nombre_solicitante}`);
        console.log(`      Nombres: ${pedido.nombres || '(null)'}`);
        console.log(`      Apellidos: ${pedido.apellidos || '(null)'}`);
        console.log(`      Marca: ${pedido.marca}`);
        console.log(`      Tipo venta: ${pedido.tipo_venta}`);
      });
    }

    // 4. Intentar insert de prueba
    console.log('\n🧪 4. Probando insert de prueba...');
    const testData = {
      marca: 'vtr',
      tipo_venta: 'nueva',
      segmento: 'residencial',
      rut_solicitante: '12345678-9',
      nombre_solicitante: 'Test Usuario',
      nombres: 'Test',
      apellidos: 'Usuario',
      region: 'metropolitana',
      comuna: 'Santiago',
      direccion: 'Calle Test 123',
      numero_telefono: '+56912345678',
      email: 'test@test.com',
      plan: 'Plan Test',
      rgu: 1,
      observacion_vendedor: 'Test desde script de verificación'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('pedidos')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al insertar pedido de prueba:');
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
    } else {
      console.log('✅ Insert de prueba exitoso!');
      console.log('   ID creado:', insertData.id);

      // Eliminar el pedido de prueba
      console.log('\n🧹 Limpiando pedido de prueba...');
      const { error: deleteError } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        console.error('❌ Error al eliminar pedido de prueba:', deleteError);
      } else {
        console.log('✅ Pedido de prueba eliminado');
      }
    }

    // 5. Verificar permisos RLS
    console.log('\n🔒 5. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('pg_policies')
      .eq('tablename', 'pedidos');

    if (policiesError) {
      console.log('⚠️  No se pudieron verificar políticas RLS (esto es normal)');
    }

  } catch (error) {
    console.error('\n❌ Error inesperado:', error);
  }
}

// Ejecutar test
testConnection()
  .then(() => {
    console.log('\n✅ Test completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test falló:', error);
    process.exit(1);
  });
