# 💻 Desarrollo Local (Sin Docker)

Si prefieres desarrollar sin Docker, sigue estos pasos.

---

## 📋 Requisitos Previos

- **Node.js 20+**: https://nodejs.org/
- **PostgreSQL 16+**: https://www.postgresql.org/download/
- **npm** o **yarn**

---

## 🗄️ Configurar PostgreSQL

### Opción 1: PostgreSQL Local

```bash
# Instalar PostgreSQL
# macOS
brew install postgresql@16

# Linux (Ubuntu)
sudo apt-get install postgresql-16

# Iniciar servicio
brew services start postgresql@16  # macOS
sudo service postgresql start       # Linux

# Crear base de datos
createdb zepp_health

# Ejecutar schema
psql zepp_health < backend/src/db/schema.sql
```

### Opción 2: PostgreSQL en Docker

```bash
docker run -d \
  --name zepp-postgres \
  -e POSTGRES_USER=zepp_user \
  -e POSTGRES_PASSWORD=zepp_password \
  -e POSTGRES_DB=zepp_health \
  -p 5432:5432 \
  postgres:16-alpine

# Ejecutar schema
docker exec -i zepp-postgres psql -U zepp_user -d zepp_health < backend/src/db/schema.sql
```

---

## 🔧 Configurar Backend

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar `.env`

Crea `backend/.env`:

```env
DATABASE_URL=postgresql://zepp_user:zepp_password@localhost:5432/zepp_health
NODE_ENV=development
PORT=3001
JWT_SECRET=tu_secret_jwt_aleatorio_largo
SYNC_INTERVAL_MINUTES=60
OPENAI_API_KEY=sk-tu-api-key-de-openai
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80
FRONTEND_URL=http://localhost:3000
```

### 3. Ejecutar Backend

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

Backend corriendo en: http://localhost:3001

---

## 🎨 Configurar Frontend

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Configurar `.env.local`

Crea `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Ejecutar Frontend

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

Frontend corriendo en: http://localhost:3000

---

## 🔄 Workflow de Desarrollo

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: PostgreSQL (si usas Docker)
```bash
docker logs -f zepp-postgres
```

---

## 🧪 Testing

### Probar Backend con curl

```bash
# Health check
curl http://localhost:3001/health

# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "zeppEmail": "tu@zepp.com",
    "zeppPassword": "tupasswordzepp"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Guardar el token que te devuelve
export TOKEN="eyJhbGc..."

# Dashboard
curl http://localhost:3001/api/data/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Análisis IA
curl -X POST http://localhost:3001/api/ai/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "daily"}'
```

---

## 🐛 Debug

### Backend

Añade breakpoints en VSCode:

**`.vscode/launch.json`**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Frontend

Next.js tiene debug automático en el navegador.

---

## 📊 Ver Base de Datos

### Con psql

```bash
psql zepp_health

# Ver tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Ver datos del día
SELECT * FROM daily_summaries ORDER BY date DESC LIMIT 10;

# Ver notificaciones
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

# Salir
\q
```

### Con pgAdmin

1. Instala pgAdmin: https://www.pgadmin.org/download/
2. Conecta a `localhost:5432`
3. Explora las tablas visualmente

---

## 🔧 Scripts Útiles

### Resetear Base de Datos

```bash
# CUIDADO: Esto borra todos los datos
psql zepp_health < backend/src/db/schema.sql
```

### Limpiar node_modules

```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules && npm install
```

### Build de Producción

```bash
# Backend
cd backend
npm run build
# Los archivos compilados estarán en backend/dist/

# Frontend
cd frontend
npm run build
# Los archivos compilados estarán en frontend/.next/
```

---

## 🚀 Deployment Local

### Ejecutar en Producción Local

```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm start
```

---

## 📦 Instalar Herramientas de Desarrollo

```bash
# TypeScript globalmente
npm install -g typescript

# Nodemon globalmente
npm install -g nodemon

# ts-node globalmente
npm install -g ts-node
```

---

## 🔍 Monitorear Logs

### Backend
Los logs del backend se muestran en la consola con Morgan.

### Frontend
Los logs de Next.js se muestran en la consola del navegador y terminal.

### Base de Datos
```bash
# Ver logs de PostgreSQL (macOS)
tail -f /usr/local/var/log/postgresql@16.log

# Docker
docker logs -f zepp-postgres
```

---

## ⚡ Hot Reload

Ambos proyectos tienen hot reload activado:

- **Backend**: Nodemon reinicia automáticamente al cambiar archivos
- **Frontend**: Next.js recarga automáticamente al cambiar archivos

---

## 🎯 Siguientes Pasos

1. Familiarízate con la estructura del código
2. Revisa los tipos en `backend/src/types/`
3. Explora los servicios en `backend/src/services/`
4. Prueba modificar componentes en `frontend/src/components/`

---

## 💡 Tips de Desarrollo

### Backend
- Usa `console.log()` para debug rápido
- Los errores se logean automáticamente
- Revisa `backend/src/index.ts` para el flujo principal

### Frontend
- Usa React DevTools en Chrome
- Los hooks están en `frontend/src/hooks/`
- La API client está en `frontend/src/lib/api.ts`

---

## 🔐 Seguridad en Desarrollo

En desarrollo es seguro usar:
```env
JWT_SECRET=dev_secret_not_for_production
```

Pero en producción usa un secret aleatorio largo.

---

¡Ahora estás listo para desarrollar localmente! 🚀
