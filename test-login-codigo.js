// Test de login con código de usuario
// Ejecutar en consola del navegador en https://formulario.ebsaspa.cl

async function testLoginCodigo(codigo, password) {
  const supabaseUrl = 'https://yiheqsnsbfmudmpquuco.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaGVxc25zYmZtdWRtcHF1dWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1NjQsImV4cCI6MjA3NjQ2NjU2NH0._WTB2GY1i29M19x4N_TuMNzAGnFhko-Ekle9bUQHfS4';

  // Crear cliente (si no existe ya)
  if (!window.supabase) {
    console.error('❌ Supabase client no disponible');
    return;
  }

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  console.log('🔍 PASO 1: Buscando email para código:', codigo);

  // Buscar el email del código
  const { data: equipo, error: queryError } = await supabase
    .from('equipos')
    .select('email')
    .eq('codigo_usuario', codigo)
    .single();

  console.log('📊 Resultado búsqueda:', { equipo, queryError });

  if (queryError) {
    console.error('❌ Error en búsqueda:', queryError);
    return { error: queryError };
  }

  if (!equipo) {
    console.error('❌ Código no encontrado');
    return { error: 'Código no válido' };
  }

  console.log('✅ Email encontrado:', equipo.email);
  console.log('🔐 PASO 2: Intentando login con email y password...');

  // Intentar login con el email encontrado
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: equipo.email,
    password: password,
  });

  console.log('📊 Resultado login:', { authData, loginError });

  if (loginError) {
    console.error('❌ Error en login:', loginError);
    return { error: loginError };
  }

  console.log('✅ Login exitoso!');
  return { success: true, user: authData.user };
}

// Ejemplo de uso:
// testLoginCodigo('100101', 'tu_password_aqui')

console.log('✅ Script cargado. Ejecuta: testLoginCodigo("100101", "tu_password")');
