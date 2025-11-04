import { google } from 'googleapis';
import 'dotenv/config';

async function testGoogleSheets() {
  console.log('=== TEST DE GOOGLE SHEETS ===\n');

  // 1. Verificar variables de entorno
  console.log('1. Verificando variables de entorno...');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID || '1nEsnBoYstsLWcrvzezn5hba7R-imvrFwA3HxDt9fD5k';

  console.log(`   - GOOGLE_SHEETS_CLIENT_EMAIL: ${clientEmail ? '✓ Configurado' : '✗ NO configurado'}`);
  console.log(`   - GOOGLE_SHEETS_PRIVATE_KEY: ${privateKey ? '✓ Configurado' : '✗ NO configurado'}`);
  console.log(`   - GOOGLE_SHEET_ID: ${sheetId}`);

  if (!clientEmail || !privateKey) {
    console.error('\n✗ ERROR: Faltan variables de entorno');
    console.error('Asegúrate de tener un archivo .env con:');
    console.error('  GOOGLE_SHEETS_CLIENT_EMAIL=tu-email@proyecto.iam.gserviceaccount.com');
    console.error('  GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."');
    process.exit(1);
  }

  // 2. Crear cliente JWT
  console.log('\n2. Creando cliente JWT de autenticación...');
  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log('   ✓ Cliente JWT creado');

    // 3. Intentar autenticar
    console.log('\n3. Autenticando con Google...');
    await auth.authorize();
    console.log('   ✓ Autenticación exitosa');

    // 4. Crear cliente de Sheets
    console.log('\n4. Creando cliente de Google Sheets API...');
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('   ✓ Cliente de Sheets creado');

    // 5. Obtener información del sheet
    console.log('\n5. Obteniendo información del spreadsheet...');
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    console.log(`   ✓ Spreadsheet encontrado: "${spreadsheetInfo.data.properties.title}"`);
    console.log(`   - Pestañas disponibles:`);
    spreadsheetInfo.data.sheets.forEach(sheet => {
      console.log(`     • ${sheet.properties.title}`);
    });

    // 6. Verificar que existe la pestaña Fijo_EBSA
    console.log('\n6. Verificando pestaña Fijo_EBSA...');
    const fijoSheet = spreadsheetInfo.data.sheets.find(
      sheet => sheet.properties.title === 'Fijo_EBSA'
    );

    if (!fijoSheet) {
      console.error('   ✗ ERROR: No se encontró la pestaña "Fijo_EBSA"');
      console.error('   Pestañas disponibles:', spreadsheetInfo.data.sheets.map(s => s.properties.title).join(', '));
      process.exit(1);
    }
    console.log('   ✓ Pestaña "Fijo_EBSA" encontrada');

    // 7. Buscar última fila con datos en columna N
    console.log('\n7. Buscando última fila con datos en columna N (timestamp)...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Fijo_EBSA!N:N',
    });

    const rows = response.data.values || [];
    const nextRow = rows.length + 1;
    console.log(`   ✓ Última fila con datos: ${rows.length}`);
    console.log(`   - Siguiente fila disponible: ${nextRow}`);

    // 8. Generar timestamp
    console.log('\n8. Generando timestamp...');
    const now = new Date();
    const chileOffset = -3; // UTC-3 (hora de Chile)
    const chileTime = new Date(now.getTime() + chileOffset * 60 * 60 * 1000);

    const day = String(chileTime.getUTCDate()).padStart(2, '0');
    const month = String(chileTime.getUTCMonth() + 1).padStart(2, '0');
    const year = chileTime.getUTCFullYear();
    const hours = String(chileTime.getUTCHours()).padStart(2, '0');
    const minutes = String(chileTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(chileTime.getUTCSeconds()).padStart(2, '0');

    const timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    console.log(`   ✓ Timestamp generado: ${timestamp}`);

    // 9. Escribir timestamp en columna N
    console.log(`\n9. Escribiendo timestamp en celda N${nextRow}...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Fijo_EBSA!N${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp]],
      },
    });
    console.log('   ✓ Timestamp escrito exitosamente');

    // 10. Verificar que se escribió correctamente
    console.log('\n10. Verificando escritura...');
    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `Fijo_EBSA!N${nextRow}`,
    });

    if (verifyResponse.data.values && verifyResponse.data.values[0][0] === timestamp) {
      console.log(`   ✓ Verificado: "${verifyResponse.data.values[0][0]}"`);
    } else {
      console.error('   ✗ ERROR: El valor escrito no coincide');
    }

    console.log('\n=== ✓ TEST COMPLETADO EXITOSAMENTE ===');
    console.log(`\nPuedes verificar en: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);

  } catch (error) {
    console.error('\n=== ✗ ERROR EN EL TEST ===\n');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);

    if (error.response) {
      console.error('\nRespuesta del servidor:');
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code) {
      console.error('\nCódigo de error:', error.code);
    }

    console.error('\nStack trace completo:');
    console.error(error.stack);

    console.error('\n=== POSIBLES SOLUCIONES ===');
    console.error('1. Si el error es "invalid_grant: account not found":');
    console.error('   - La Service Account no existe o fue eliminada');
    console.error('   - Crea una nueva en: https://console.cloud.google.com/iam-admin/serviceaccounts');
    console.error('   - Habilita Google Sheets API');
    console.error('   - Descarga el JSON de credenciales');
    console.error('   - Comparte el sheet con el email de la Service Account');
    console.error('');
    console.error('2. Si el error es "insufficient permissions":');
    console.error('   - El sheet no está compartido con la Service Account');
    console.error('   - Compártelo con el email:', clientEmail);
    console.error('');
    console.error('3. Si el error es "sheet not found":');
    console.error('   - Verifica que el Sheet ID sea correcto');
    console.error('   - Verifica que la pestaña "Fijo_EBSA" exista');

    process.exit(1);
  }
}

// Ejecutar test
testGoogleSheets();
