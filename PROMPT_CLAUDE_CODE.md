# Prompt para Claude Code: Zepp Health Data Dashboard

## Contexto del proyecto

Quiero crear una aplicación web que extraiga y visualice TODOS mis datos de salud desde la API de Zepp/Huami (tengo un Helio Ring). La app debe permitirme loguearme con mis credenciales de Zepp, extraer mis datos automáticamente, y mostrarlos en un dashboard visual.

## Stack técnico preferido

- **Frontend**: React + Tailwind CSS + shadcn/ui (o Next.js si prefieres)
- **Backend**: Node.js/Express o Python FastAPI
- **Base de datos**: SQLite (simple) o PostgreSQL
- **Gráficos**: Recharts o Chart.js
- **Deployment**: Docker-ready para deployar en EasyPanel

## Funcionalidades requeridas

### 1. Autenticación con Zepp API

La API de Zepp/Huami funciona así:

```
Paso 1: POST a https://api-user.huami.com/registrations/{email}/tokens
- Body (form-urlencoded):
  - client_id: "HuaMi"
  - password: {user_password}
  - redirect_uri: "https://s3-us-west-2.amazonws.com/hm-registration/successs498.html"
  - token: "access"
- Respuesta: 303 redirect con access token en URL

Paso 2: POST a https://account.huami.com/v2/client/login
- Body (form-urlencoded):
  - app_name: "com.xiaomi.hm.health"
  - app_version: "6.3.5"
  - code: {access_token_del_paso_1}
  - country_code: "ES"
  - device_id: {hash_md5_del_email}
  - device_model: "web"
  - grant_type: "access_token"
  - third_name: "huami"
- Respuesta: JSON con token_info.app_token y token_info.user_id
```

### 2. Endpoints de datos a consumir

Todos requieren header `apptoken: {app_token}` + `appPlatform: web` + `appname: com.xiaomi.hm.health`

| Endpoint | Datos | Params |
|----------|-------|--------|
| `GET https://api-mifit-de2.huami.com/v1/data/band_data.json` | Pasos, sueño, HR | `query_type=summary&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` |
| `GET https://api-mifit-de2.huami.com/v1/data/band_data.json` | HR por minuto (blob binario) | `query_type=detail&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` |
| `GET https://api-mifit-de2.huami.com/v1/sport/run/history.json` | Lista de workouts | - |
| `GET https://api-mifit-de2.huami.com/v1/sport/run/detail.json` | Detalle workout con GPS | `trackid={id}&source={source}` |
| `GET https://api-mifit-de2.huami.com/users/{user_id}/healthStress` | Estrés | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| `GET https://api-mifit-de2.huami.com/users/{user_id}/spo2` | SpO2 | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| `GET https://api-mifit-de2.huami.com/users/{user_id}/pai` | PAI | `from=YYYY-MM-DD&to=YYYY-MM-DD` |

### 3. Decodificación de datos

El campo `summary` en band_data viene como base64 que decodifica a JSON:
```javascript
const decoded = JSON.parse(Buffer.from(summary, 'base64').toString('utf8'));
```

El campo `data_hr` es un blob binario de 2880 bytes = 1440 valores short (uno por minuto):
```javascript
// Cada 2 bytes es un valor de HR (big-endian)
// 254 y 255 son valores especiales (sin lectura)
for (let i = 0; i < buffer.length; i += 2) {
  const hr = buffer.readUInt16BE(i);
  if (hr < 254) {
    // HR válido para el minuto i/2
  }
}
```

### 4. Páginas/Vistas del dashboard

1. **Login**: Formulario email + password de Zepp
2. **Dashboard principal**: 
   - Resumen del día (pasos, calorías, sueño, HRV)
   - Gráfico de HR de las últimas 24h
   - Tendencia de sueño últimos 7 días
3. **Histórico de pasos**: Gráfico de barras por día
4. **Análisis de sueño**: Duración, fases, hora de dormir/despertar
5. **Heart Rate**: Gráfico detallado por minuto, promedios, máx/mín
6. **Workouts**: Lista de entrenamientos con métricas
7. **Configuración**: 
   - Cambiar credenciales
   - Forzar sync manual
   - Exportar datos a JSON/CSV

### 5. Features adicionales

- **Sync automático**: Job que corre cada hora para traer nuevos datos
- **Cache/DB local**: Guardar datos localmente para no llamar a la API cada vez
- **Modo oscuro**: Toggle dark/light
- **Responsive**: Que funcione bien en móvil
- **Exportar**: Botón para descargar mis datos en JSON o CSV

## Estructura de archivos sugerida

```
zepp-dashboard/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── zepp-client.ts    # Cliente para API de Zepp
│   │   │   └── routes.ts
│   │   ├── services/
│   │   │   ├── auth.ts           # Autenticación Zepp
│   │   │   ├── sync.ts           # Sync de datos
│   │   │   └── decoder.ts        # Decodificar blobs binarios
│   │   ├── db/
│   │   │   └── schema.ts         # Modelos de datos
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HRChart.tsx
│   │   │   ├── SleepChart.tsx
│   │   │   └── StepsChart.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Settings.tsx
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Variables de entorno necesarias

```env
# Backend
DATABASE_URL=sqlite:./data/zepp.db
JWT_SECRET=random_secret_for_sessions
SYNC_INTERVAL_MINUTES=60

# Las credenciales de Zepp las ingresa el usuario en el login, no van en .env
```

## Consideraciones importantes

1. **No hardcodear credenciales**: El usuario las ingresa en el login
2. **Guardar el app_token encriptado** en la DB para no re-autenticar cada vez
3. **Rate limiting**: No hacer más de 1 request/segundo a la API de Zepp
4. **El token expira**: Implementar refresh automático si falla un request
5. **Manejo de errores**: La API a veces devuelve datos vacíos, manejar gracefully

## Empezar con

Primero crea la estructura del proyecto y el cliente de API de Zepp con la autenticación funcionando. Después avanzamos con el frontend y las visualizaciones.

---

¿Alguna pregunta antes de empezar?
