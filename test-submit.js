import { google } from 'googleapis';
import 'dotenv/config';

async function testSubmitForm() {
  console.log('=== TEST DE ENVÍO DE FORMULARIO ===\n');

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID || '1nEsnBoYstsLWcrvzezn5hba7R-imvrFwA3HxDt9fD5k';

  try {
    // Autenticar
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await auth.authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    // Generar timestamp
    const now = new Date();
    const chileOffset = -3;
    const chileTime = new Date(now.getTime() + chileOffset * 60 * 60 * 1000);
    const day = String(chileTime.getUTCDate()).padStart(2, '0');
    const month = String(chileTime.getUTCMonth() + 1).padStart(2, '0');
    const year = chileTime.getUTCFullYear();
    const hours = String(chileTime.getUTCHours()).padStart(2, '0');
    const minutes = String(chileTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(chileTime.getUTCSeconds()).padStart(2, '0');
    const timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    // Obtener última fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Fijo_EBSA!Q:Q',
    });

    const rows = response.data.values || [];
    const nextRow = rows.length + 1;

    console.log(`Última fila: ${rows.length}`);
    console.log(`Siguiente fila: ${nextRow}`);
    console.log(`Timestamp: ${timestamp}\n`);

    // Datos de prueba
    const testData = {
      'J': 'COMENTARIO DE PRUEBA', // OBSERVACION VENDEDOR
      'K': 'VTR', // MARCA
      'P': 'TESTCODE', // CODIGO DE VENDEDOR
      'Q': timestamp, // Marca temporal
      'R': 'NUEVA', // TIPO VENTA
      'S': 'RESIDENCIAL', // SEGMENTO DE VENTA
      'T': 'HONORARIO', // AGENTE
      'BC': 'EQUIPO TEST', // EQUIPO
      'BE': 'VENDEDOR TEST', // VENDEDOR
      'AN': '12345678-9', // RUT SOLICITANTE
      'AO': 'NOMBRE APELLIDO TEST', // NOMBRE SOLICITANTE
      'AP': '', // RUT EMPRESA
      'AQ': '', // NOMBRE DE LA EMPRESA
      'AA': 'METROPOLITANA', // REGION
      'AR': 'SANTIAGO', // COMUNA
      'AS': 'CALLE TEST 123', // DIRECCION
      'AD': '987654321', // TELEFONO DE CONTACTO
      'AT': 'test@test.com', // EMAIL
      'AU': 'PLAN TEST - VTR', // PLAN
      'AG': 'ADICIONAL 1, ADICIONAL 2', // ADICIONALES
      'BA': '3', // RGU
      'AI': 'TERRENO', // TIPO DE CAMPANA
      'AJ': 'https://r2.test/rut-frontal.jpg', // RUT FRONTAL
      'AK': 'https://r2.test/rut-posterior.jpg', // RUT POSTERIOR
      'AL': 'https://r2.test/factibilidad.jpg', // FACTIBILIDAD ANDES
      'AM': 'https://r2.test/otros.jpg', // OTROS DOCUMENTOS
    };

    console.log('Datos a enviar:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    // Preparar updates
    const updates = Object.entries(testData).map(([column, value]) => ({
      range: `Fijo_EBSA!${column}${nextRow}`,
      values: [[value]],
    }));

    // Enviar a Google Sheets
    console.log(`Enviando ${updates.length} columnas a fila ${nextRow}...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });

    console.log('✓ Datos enviados exitosamente a Google Sheets');
    console.log(`\nVerifica en: https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=Q${nextRow}`);

  } catch (error) {
    console.error('✗ ERROR:', error.message);
    console.error(error.stack);
  }
}

testSubmitForm();
