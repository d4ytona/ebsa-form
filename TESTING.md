# Guía de Testing Modular - EBSA Form

Este documento explica cómo probar cada componente del formulario de manera independiente.

## Sistema de Testing Modular

El endpoint `/api/submit-form` ahora soporta testing modular mediante query parameters.

### Modos de Testing

#### 1. Test de Validación (Solo recepción de datos)
**URL**: `/api/submit-form?test=validation`

**Qué hace**:
- ✅ Recibe los datos del formulario
- ✅ Valida que los campos lleguen correctamente
- ❌ NO guarda en Google Sheets
- ❌ NO guarda en Supabase

**Respuesta esperada**:
```json
{
  "success": true,
  "mode": "validation",
  "message": "Datos recibidos correctamente",
  "data": {
    "tieneVendedor": true,
    "tieneCodigo": true,
    "tieneMarca": true,
    "tieneRut": true,
    "tienePlan": true,
    "camposRecibidos": 45
  }
}
```

**Cómo probarlo en local**:
1. Llenar el formulario normalmente
2. Abrir consola del navegador (F12)
3. Antes de enviar, pegar:
```javascript
// Interceptar el fetch y agregar ?test=validation
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/api/submit-form')) {
    args[0] = args[0] + '?test=validation';
  }
  return originalFetch.apply(this, args);
};
```
4. Enviar el formulario
5. Ver en Network tab que retorna solo validación

---

#### 2. Test de Supabase (Solo base de datos)
**URL**: `/api/submit-form?test=supabase`

**Qué hace**:
- ✅ Recibe los datos del formulario
- ✅ Guarda en Supabase (tabla `pedidos`)
- ✅ Valida vendedor y código contra las listas
- ❌ NO guarda en Google Sheets

**Respuesta esperada**:
```json
{
  "success": true,
  "mode": "supabase",
  "message": "Datos guardados solo en Supabase",
  "pedidoId": 123,
  "vendedorValidado": true,
  "codigoValidado": true
}
```

**Cómo probarlo en local**:
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/api/submit-form')) {
    args[0] = args[0] + '?test=supabase';
  }
  return originalFetch.apply(this, args);
};
```

**Verificación**:
- Ir a Supabase Dashboard → Table Editor → pedidos
- Verificar que aparece el nuevo pedido con el ID retornado

---

#### 3. Test de Google Sheets (Solo hoja de cálculo)
**URL**: `/api/submit-form?test=sheets`

**Qué hace**:
- ✅ Recibe los datos del formulario
- ✅ Guarda en Google Sheets (pestaña `Fijo_EBSA`)
- ✅ Agrega nueva fila automáticamente
- ❌ NO guarda en Supabase

**Respuesta esperada**:
```json
{
  "success": true,
  "mode": "sheets",
  "message": "Datos guardados solo en Google Sheets",
  "timestamp": "04/11/2025 12:30:45",
  "fila": 156
}
```

**Cómo probarlo en local**:
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/api/submit-form')) {
    args[0] = args[0] + '?test=sheets';
  }
  return originalFetch.apply(this, args);
};
```

**Verificación**:
- Abrir Google Sheets
- Ir a pestaña `Fijo_EBSA`
- Ir a la fila indicada en la respuesta
- Verificar que los datos estén correctos

---

#### 4. Modo Normal (Funcionamiento completo)
**URL**: `/api/submit-form` (sin query params)

**Qué hace**:
- ✅ Recibe los datos del formulario
- ✅ Guarda en Google Sheets
- ✅ Guarda en Supabase
- ✅ Valida vendedor y código

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Formulario enviado exitosamente",
  "timestamp": "04/11/2025 12:30:45",
  "pedidoId": 123
}
```

---

## Flujo de Testing Recomendado

### Paso 1: Probar Validación
```bash
# Local
npm run dev
# Abrir http://localhost:5173
# Llenar formulario
# Ejecutar script de interceptación con ?test=validation
# Enviar y verificar respuesta
```

✅ Si funciona: Los datos se envían correctamente desde el frontend
❌ Si falla: Revisar Form.tsx y handleSubmit

---

### Paso 2: Probar Supabase
```bash
# Usar ?test=supabase
# Enviar formulario
# Verificar en Supabase Dashboard que aparece el pedido
```

✅ Si funciona: La integración con Supabase está OK
❌ Si falla: Revisar variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

---

### Paso 3: Probar Google Sheets
```bash
# Usar ?test=sheets
# Enviar formulario
# Verificar en Google Sheets que aparece la fila
```

✅ Si funciona: La integración con Google Sheets está OK
❌ Si falla: Revisar GOOGLE_SHEETS_PRIVATE_KEY y GOOGLE_SHEET_ID

---

### Paso 4: Probar Completo
```bash
# Sin query params
# Enviar formulario
# Verificar ambos: Supabase Y Google Sheets
```

---

## Testing en Producción (Vercel)

Para probar en producción sin modificar el código:

1. Abrir https://formulario.ebsaspa.cl
2. Llenar el formulario
3. Abrir consola (F12)
4. Pegar el script de interceptación según el modo
5. Enviar formulario
6. Verificar respuesta en Network tab

**Nota**: Los scripts de interceptación solo afectan esa sesión del navegador.

---

## Logs en Vercel

Para ver los logs en tiempo real:

```bash
# Ver logs generales
vercel logs https://formulario.ebsaspa.cl --since 5m

# Ver solo errores
vercel logs https://formulario.ebsaspa.cl --since 5m 2>&1 | grep -i "error"

# Ver logs del submit-form
vercel logs https://formulario.ebsaspa.cl --since 5m 2>&1 | grep -i "formulario"
```

---

## Variables de Entorno Necesarias

### Para Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Para Google Sheets:
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

### Para R2 (upload de archivos):
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

---

## Próximos Pasos

1. ✅ Test de validación
2. ✅ Test de Supabase
3. ✅ Test de Google Sheets
4. ⏳ Diagnosticar error en `/api/upload-file`
5. ⏳ Agregar indicadores de archivos en confirmación
