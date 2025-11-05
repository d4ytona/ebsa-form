/**
 * @fileoverview Función serverless para enviar datos del formulario a Google Sheets.
 * Mapea campos del formulario a columnas específicas en la pestaña Fijo_EBSA.
 * Maneja autenticación con Google Service Account y expansión automática de filas.
 *
 * Testing modular con query params:
 * - ?test=validation - Solo valida datos recibidos
 * - ?test=supabase - Solo guarda en Supabase
 * - ?test=sheets - Solo guarda en Google Sheets
 * - Sin params - Funcionamiento normal (ambos)
 */

import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

/**
 * ID de la hoja de cálculo de Google Sheets donde se almacenan los datos.
 * Se obtiene desde variables de entorno.
 * @constant {string}
 */
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * Cliente de Supabase para almacenar pedidos
 * Usa las mismas variables que el frontend (con VITE_) para evitar duplicación
 */
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Formatea la fecha y hora actual en formato DD/MM/YYYY HH:MM:SS en zona horaria de Chile.
 * @returns {string} Timestamp formateado en hora chilena
 * @example
 * formatTimestamp() // returns "27/10/2025 14:30:45"
 */
function formatTimestamp() {
  // Crear fecha en hora chilena (America/Santiago)
  const now = new Date();
  const chileTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Santiago" })
  );

  const day = String(chileTime.getDate()).padStart(2, "0");
  const month = String(chileTime.getMonth() + 1).padStart(2, "0");
  const year = chileTime.getFullYear();
  const hours = String(chileTime.getHours()).padStart(2, "0");
  const minutes = String(chileTime.getMinutes()).padStart(2, "0");
  const seconds = String(chileTime.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Configura y retorna el objeto de autenticación de Google usando Service Account.
 * Lee las credenciales desde variables de entorno.
 * @returns {GoogleAuth} Objeto de autenticación configurado con permisos de Sheets
 */
function getAuth() {
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY || "";
  const privateKey = privateKeyRaw.includes("\\n")
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : privateKeyRaw;

  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Handler principal de la función serverless para procesar envío de formularios.
 * Maneja autenticación, validación, mapeo de datos y escritura a Google Sheets.
 *
 * @async
 * @param {Object} req - Objeto de request de Vercel
 * @param {Object} req.body - Datos del formulario enviados desde el cliente
 * @param {string} req.method - Método HTTP (debe ser POST)
 * @param {Object} res - Objeto de response de Vercel
 * @returns {Promise<void>}
 *
 * @description
 * Flujo de procesamiento:
 * 1. Habilita CORS para permitir requests desde el frontend
 * 2. Valida método HTTP (solo acepta POST)
 * 3. Autentica con Google Sheets usando Service Account
 * 4. Genera timestamp en hora chilena
 * 5. Mapea datos del formulario a columnas específicas de Google Sheets
 * 6. Calcula RGU (cantidad de servicios contratados)
 * 7. Obtiene última fila con datos en la pestaña FIJO
 * 8. Verifica si se necesita expandir el sheet (< 100 filas disponibles)
 * 9. Expande automáticamente agregando 1000 filas si es necesario
 * 10. Escribe todos los datos en batch a las columnas correspondientes
 * 11. Retorna respuesta de éxito con timestamp
 *
 * Mapeo de columnas:
 * - I: Observación del vendedor
 * - J: Marca (VTR/Claro)
 * - M: Código del vendedor
 * - N: Timestamp (DD/MM/YYYY HH:MM:SS)
 * - Q: Tipo de Agente
 * - X: Región
 * - AA: Número de teléfono
 * - AC: Tipo de oferta
 * - AD: Productos Adicionales
 * - AF: Tipo de Campaña
 * - AG: RUT frontal (enlace R2)
 * - AH: RUT posterior (enlace R2)
 * - AI: Factibilidad app (enlace R2)
 * - AJ: Otros documentos (enlaces R2)
 * - AK: RUT solicitante
 * - AL: Nombre solicitante
 * - AM: RUT empresa
 * - AN: Nombre empresa
 * - AO: Comuna
 * - AP: Dirección
 * - AQ: Email
 * - AR: Plan seleccionado
 * - AX: RGU (cantidad de servicios)
 * - AZ: Equipo
 * - BA: Tipo de Venta
 * - BB: Segmento de venta
 * - BC: Tipo de Validación
 * - BD: Vendedor
 *
 * @example
 * // Request desde el frontend
 * fetch('/api/submit-form', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(formData)
 * })
 *
 * @throws {Error} Si falla la autenticación con Google
 * @throws {Error} Si falla la escritura a Google Sheets
 */
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Manejar preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Solo aceptar POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const formData = req.body;
    const testMode = req.query?.test || null; // validation, supabase, sheets, o null (normal)

    console.log("Recibiendo datos del formulario...");
    console.log("Modo de testing:", testMode || "normal");

    // === FASE 1: VALIDACIÓN DE DATOS ===
    if (testMode === "validation") {
      console.log("TEST MODE: Solo validación de datos");
      return res.status(200).json({
        success: true,
        mode: "validation",
        message: "Datos recibidos correctamente",
        data: {
          tieneVendedor: !!formData.selectedVendedor,
          tieneCodigo: !!formData.selectedCodigo,
          tieneMarca: !!formData.selectedMarca,
          tieneRut: !!formData.rut,
          tienePlan: !!formData.selectedPlan,
          camposRecibidos: Object.keys(formData).length,
        },
      });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Crear la marca temporal
    const timestamp = formatTimestamp();

    // Función helper para convertir a mayúsculas
    const toUpper = (str) => (str ? String(str).toUpperCase() : "");

    // Función helper para convertir a minúsculas
    const toLower = (str) => (str ? String(str).toLowerCase() : "");

    // Calcular RGU (cantidad de servicios)
    const rgu = [
      formData.hasInternet,
      formData.hasTelevision,
      formData.hasTelefonia,
    ].filter(Boolean).length;

    // Preparar objeto con los valores mapeados a las columnas correctas (NUEVO MAPEO)
    const columnData = {
      J: toUpper(formData.comentarioVendedor), // OBSERVACION VENDEDOR
      K: toUpper(formData.selectedMarca), // MARCA
      P: toUpper(formData.selectedCodigo), // CODIGO DE VENDEDOR (NOMBRE DE USUARIO USADO PARA VALIDAR)
      Q: timestamp, // Marca temporal (formato DD/MM/YYYY HH:MM:SS - Hora Chile)
      R: toUpper(formData.selectedTipoVenta), // TIPO VENTA
      S: toUpper(formData.selectedSegmento), // SEGMENTO DE VENTA
      T: toUpper(formData.tipoAgente), // AGENTE
      BC: toLower(formData.emailEquipo), // EQUIPO (email del equipo en minúsculas)
      BE: toUpper(formData.selectedVendedor), // VENDEDOR
      AN: toUpper(formData.rut), // RUT SOLICITANTE
      AO: toUpper(`${formData.nombres} ${formData.apellidos}`), // NOMBRE SOLICITANTE
      AP: toUpper(formData.rutEmpresa || ""), // RUT EMPRESA
      AQ: toUpper(formData.nombreEmpresa || ""), // NOMBRE DE LA EMPRESA (SIN ESPACIOS, NI PUNTOS)
      AA: toUpper(formData.region), // REGION
      AR: toUpper(formData.comuna), // COMUNA
      AS: toUpper(formData.direccion), // DIRECCION
      AD: toUpper(formData.numeroContacto), // TELEFONO DE CONTACTO (SIN +56 NI ESPACIOS)
      AT: toLower(formData.email), // EMAIL (en minúsculas)
      AU: toUpper(formData.selectedPlan), // PLAN
      AG: toUpper(formData.selectedAdicionales?.join(", ")), // ADICIONALES
      BA: rgu, // RGU
      AI: toUpper(formData.tipoCampana), // TIPO DE CAMPANA
      AJ: Array.isArray(formData.rutFrontalUrls)
        ? formData.rutFrontalUrls.join(", ")
        : "", // RUT (IMAGEN FRONTAL)
      AK: Array.isArray(formData.rutPosteriorUrls)
        ? formData.rutPosteriorUrls.join(", ")
        : "", // RUT (IMAGEN POSTERIOR)
      AL: Array.isArray(formData.factibilidadUrls)
        ? formData.factibilidadUrls.join(", ")
        : "", // FACTIBILIDAD ANDES
      AM: Array.isArray(formData.otrosDocumentosUrls)
        ? formData.otrosDocumentosUrls.join(", ")
        : "", // OTROS DOCUMENTOS
    };

    // Obtener la última fila con datos en la columna Q (timestamp)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Fijo_EBSA!Q:Q",
    });

    const rows = response.data.values || [];
    const nextRow = rows.length + 1;

    console.log(
      `Última fila con timestamp: ${rows.length}, próxima fila: ${nextRow}`
    );

    // Obtener información del sheet
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // Buscar la pestaña "Fijo_EBSA"
    const fijoSheet = sheetMetadata.data.sheets.find(
      (sheet) => sheet.properties.title === "Fijo_EBSA"
    );

    if (fijoSheet) {
      const currentRowCount = fijoSheet.properties.gridProperties.rowCount;
      const sheetId = fijoSheet.properties.sheetId;

      console.log(
        `Filas totales en sheet: ${currentRowCount}, próxima fila a usar: ${nextRow}`
      );

      // SIEMPRE agregar una nueva fila antes de escribir para asegurar que existe
      console.log("Agregando nueva fila al sheet...");

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              appendDimension: {
                sheetId: sheetId,
                dimension: "ROWS",
                length: 1, // Agregar 1 fila
              },
            },
          ],
        },
      });

      console.log("Nueva fila agregada exitosamente");
    }

    // === FASE 2: GUARDAR EN GOOGLE SHEETS ===
    // Escribir cada valor en su columna correspondiente
    const updates = Object.entries(columnData).map(([column, value]) => ({
      range: `Fijo_EBSA!${column}${nextRow}`,
      values: [[value]],
    }));

    // Solo guardar en Sheets si NO es modo test=supabase
    if (testMode !== "supabase") {
      // Hacer batch update para escribir todas las columnas a la vez
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          valueInputOption: "USER_ENTERED",
          data: updates,
        },
      });

      console.log(
        `Formulario guardado exitosamente en Sheets con timestamp: ${timestamp}`
      );
    } else {
      console.log("TEST MODE: Saltando guardado en Google Sheets");
    }

    // Si estamos en modo test=sheets, retornar aquí
    if (testMode === "sheets") {
      return res.status(200).json({
        success: true,
        mode: "sheets",
        message: "Datos guardados solo en Google Sheets",
        timestamp,
        fila: nextRow,
      });
    }

    // Verificar si vendedor y código están en las listas de Supabase
    // Para convertir a null si no están en la lista
    let vendedorParaSupabase = null;
    let codigoParaSupabase = null;
    let equipoParaSupabase = null;

    // Verificar vendedor
    if (
      formData.selectedVendedor &&
      formData.selectedVendedor.trim() &&
      formData.selectedVendedor !== " "
    ) {
      const { data: vendedorExists } = await supabase
        .from("vendedores")
        .select("id")
        .ilike("nombre", formData.selectedVendedor)
        .single();

      if (vendedorExists) {
        vendedorParaSupabase = formData.selectedVendedor;
        equipoParaSupabase = formData.equipo;
        console.log("Vendedor encontrado en lista");
      } else {
        console.log("Vendedor no encontrado en lista, se guardará como null");
      }
    } else {
      console.log("Vendedor vacío, se guardará como null");
    }

    // Verificar código
    if (
      formData.selectedCodigo &&
      formData.selectedCodigo.trim() &&
      formData.selectedCodigo !== " "
    ) {
      const { data: codigoExists } = await supabase
        .from("codigos_vendedor")
        .select("id")
        .ilike("codigo", formData.selectedCodigo)
        .single();

      if (codigoExists) {
        codigoParaSupabase = formData.selectedCodigo;
        console.log("Código encontrado en lista");
      } else {
        console.log("Código no encontrado en lista, se guardará como null");
      }
    } else {
      console.log("Código vacío, se guardará como null");
    }

    // === FASE 3: GUARDAR EN SUPABASE ===
    // Solo guardar en Supabase si NO es modo test=sheets
    let pedido = null;

    if (testMode !== "sheets") {
      console.log("=== Intentando guardar en Supabase ===");
      console.log("Datos a insertar:", {
        vendedor: vendedorParaSupabase,
        codigo: codigoParaSupabase,
        equipo: equipoParaSupabase,
        rut: formData.rut,
        marca: formData.selectedMarca
      });

      // Guardar en Supabase (con null si valores no válidos)
      const { data: pedidoData, error: supabaseError } = await supabase
      .from("pedidos")
      .insert({
        observacion_vendedor: formData.comentarioVendedor,
        marca: formData.selectedMarca,
        codigo_vendedor: codigoParaSupabase,
        tipo_venta: formData.selectedTipoVenta,
        segmento: formData.selectedSegmento,
        tipo_agente: formData.tipoAgente,
        equipo_id: equipoParaSupabase,
        vendedor_id: vendedorParaSupabase,
        rut: formData.rut,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        rut_empresa: formData.rutEmpresa || null,
        nombre_empresa: formData.nombreEmpresa || null,
        region: formData.region,
        comuna: formData.comuna,
        direccion: formData.direccion,
        numero_contacto: formData.numeroContacto,
        email: formData.email,
        plan: formData.selectedPlan,
        productos_adicionales: formData.selectedAdicionales?.join(", ") || null,
        rgu: rgu,
        tiene_internet: formData.hasInternet || false,
        tiene_television: formData.hasTelevision || false,
        tiene_telefonia: formData.hasTelefonia || false,
        velocidad_internet: formData.velocidadInternet || null,
        tipo_television: formData.tipoTelevision || null,
        fecha_agendamiento: formData.fechaAgendamiento || null,
        tramo_instalacion: formData.tramoInstalacion || null,
        rut_frontal_url:
          Array.isArray(formData.rutFrontalUrls) &&
          formData.rutFrontalUrls.length > 0
            ? formData.rutFrontalUrls.join(", ")
            : null,
        rut_posterior_url:
          Array.isArray(formData.rutPosteriorUrls) &&
          formData.rutPosteriorUrls.length > 0
            ? formData.rutPosteriorUrls.join(", ")
            : null,
        factibilidad_url:
          Array.isArray(formData.factibilidadUrls) &&
          formData.factibilidadUrls.length > 0
            ? formData.factibilidadUrls.join(", ")
            : null,
        otros_documentos_urls:
          Array.isArray(formData.otrosDocumentosUrls) &&
          formData.otrosDocumentosUrls.length > 0
            ? formData.otrosDocumentosUrls.join(", ")
            : null,
        fila_sheets: nextRow,
      })
        .select()
        .single();

      if (supabaseError) {
        console.error("=== ERROR AL GUARDAR EN SUPABASE ===");
        console.error("Error completo:", JSON.stringify(supabaseError, null, 2));
        console.error("Error code:", supabaseError.code);
        console.error("Error message:", supabaseError.message);
        console.error("Error details:", supabaseError.details);
        console.error("Error hint:", supabaseError.hint);
        // No fallar el request si Supabase falla, ya se guardó en Sheets
      } else {
        pedido = pedidoData;
        console.log("✅ Pedido guardado en Supabase con ID:", pedido.id);
      }
    } else {
      console.log("TEST MODE: Saltando guardado en Supabase");
    }

    // Si estamos en modo test=supabase, retornar aquí
    if (testMode === "supabase") {
      return res.status(200).json({
        success: true,
        mode: "supabase",
        message: "Datos guardados solo en Supabase",
        pedidoId: pedido?.id,
        vendedorValidado: !!vendedorParaSupabase,
        codigoValidado: !!codigoParaSupabase,
      });
    }

    res.status(200).json({
      success: true,
      message: "Formulario enviado exitosamente",
      timestamp,
      pedidoId: pedido?.id,
    });
  } catch (error) {
    console.error("Error al enviar formulario:", error);
    console.error("Stack trace:", error.stack);
    console.error("Datos recibidos:", JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: "Error al enviar formulario",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
