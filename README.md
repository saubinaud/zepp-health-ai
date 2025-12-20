# Zepp Health Data Dashboard con Análisis de IA

Dashboard completo para visualizar y analizar tus datos de salud del Helio Ring (Zepp/Huami) con análisis avanzado mediante OpenAI.

## Características

### Recolección Automática de Datos
- **Autenticación con Zepp API**: Integración completa con la API de Zepp/Huami
- **Sincronización automática**: Actualización cada hora de todos tus datos
- **Datos recolectados**:
  - Pasos, distancia y calorías diarias
  - Sueño (fases: profundo, ligero, REM, despierto)
  - Frecuencia cardíaca por minuto
  - HRV (variabilidad de frecuencia cardíaca)
  - Niveles de estrés
  - SpO2 (saturación de oxígeno)
  - PAI scores
  - Entrenamientos con GPS

### Análisis con Inteligencia Artificial (OpenAI)
- **Análisis diario**: Resumen y recomendaciones del día
- **Análisis semanal/mensual**: Tendencias y patrones a largo plazo
- **Chat interactivo**: Pregunta cualquier cosa sobre tus datos de salud
- **Diagnósticos integrales**: Correlaciones entre métricas (ej: sueño vs estrés)
- **Recomendaciones personalizadas**: Basadas en tu historial completo

### Sistema de Notificaciones en Tiempo Real
- **WebSockets**: Notificaciones instantáneas
- **Alertas automáticas**:
  - Frecuencia cardíaca alta/baja
  - SpO2 bajo
  - Niveles de estrés elevados
  - Metas alcanzadas (ej: 10,000 pasos)
  - Insights importantes de la IA

### Dashboard Interactivo
- **Gráficos en tiempo real**: Visualización con Recharts
- **Modo oscuro**: Toggle dark/light mode
- **Responsive**: Funciona perfectamente en móvil
- **Exportación de datos**: Descarga tus datos en JSON/CSV

## Stack Tecnológico

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL**: Base de datos relacional
- **Socket.IO**: WebSockets para notificaciones en tiempo real
- **OpenAI API**: Análisis inteligente de datos de salud
- **node-cron**: Sincronización automática programada
- **bcrypt** + **JWT**: Autenticación segura
- **crypto-js**: Encriptación de credenciales de Zepp

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**: UI components
- **Recharts**: Gráficos y visualizaciones
- **Socket.IO Client**: Notificaciones en tiempo real
- **Zustand**: State management

### DevOps
- **Docker** + **Docker Compose**: Containerización
- **PostgreSQL 16**: Base de datos
- Listo para **EasyPanel** deployment

## 🚀 Instalación Rápida

### 📦 Método Recomendado: Script Automático

La forma más rápida de instalar en tu servidor:

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd zepp-health-ai

# 2. Ejecutar script de instalación
./quick-start.sh
```

El script te guiará paso a paso y configurará todo automáticamente. ✨

---

### ☁️ Instalación en EasyPanel / Coolify

**Instalación en 5 minutos - Solo 4 clics:**

1. 📖 **Lee la guía súper simple**: [`EASYPANEL-FACIL.md`](./EASYPANEL-FACIL.md) ⭐ **RECOMENDADO**
2. 🍴 **Fork este repositorio** en GitHub (1 clic)
3. 🔗 **Conecta el repo** en EasyPanel (1 clic)
4. ⚙️ **Pega 3 variables de entorno** (copy/paste)
5. 🚀 **Deploy** (1 clic) - ¡Listo!

**No necesitas saber Git ni programación** - Solo hacer clic y copiar/pegar.

#### Variables de Entorno Mínimas (para EasyPanel):

```env
# ⚠️ OBLIGATORIAS - Debes cambiarlas:
POSTGRES_PASSWORD=tu_password_super_seguro
JWT_SECRET=secret_aleatorio_largo_y_seguro
OPENAI_API_KEY=sk-tu-api-key-de-openai

# ✅ Opcionales (valores por defecto):
POSTGRES_USER=zepp_user
POSTGRES_DB=zepp_health
NODE_ENV=production
OPENAI_MODEL=gpt-4-turbo-preview
```

📚 **Guía completa**: Ver [`INSTALL.md`](./INSTALL.md) para instrucciones detalladas.

---

### 🐳 Instalación Manual con Docker Compose

#### Requisitos Previos
- ✅ Docker y Docker Compose instalados
- ✅ Cuenta en Zepp/Huami (email y contraseña)
- ✅ API Key de OpenAI ([Consíguela aquí](https://platform.openai.com/api-keys))

#### Pasos:

**1. Clonar el repositorio**

```bash
git clone <tu-repo>
cd zepp-health-ai
```

**2. Configurar variables de entorno**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env  # o vim .env
```

**Configura estas 3 variables OBLIGATORIAS** en el archivo `.env`:

```env
POSTGRES_PASSWORD=una_password_segura_aqui
JWT_SECRET=un_secret_aleatorio_muy_largo
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

El archivo `.env.example` tiene comentarios detallados para cada variable.

**3. Iniciar con Docker**

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down
```

**4. Acceder a la aplicación**

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001
- 🗄️ **PostgreSQL**: localhost:5432

**5. Primer uso**

1. Abre http://localhost:3000 en tu navegador
2. Haz clic en **"Regístrate"**
3. Ingresa:
   - Email y contraseña (para esta app - crea uno nuevo)
   - Email y contraseña de tu cuenta Zepp Life
4. ¡La sincronización comenzará automáticamente!

---

### 📚 Documentación de Instalación

- 📖 **Guía completa**: [`INSTALL.md`](./INSTALL.md) - Instrucciones detalladas para todos los métodos
- ☁️ **EasyPanel/Coolify**: [`EASYPANEL.md`](./EASYPANEL.md) - Instalación rápida en la nube
- 🐛 **Problemas**: Ver sección de troubleshooting en `INSTALL.md`

## Uso

### Dashboard Principal
- **Resumen del día**: Métricas actuales
- **Gráficos**: HR últimas 24h, tendencias de sueño
- **Notificaciones**: Panel con alertas en tiempo real

### Sincronización Manual
- Click en "Sincronizar" en el dashboard
- Selecciona rango de fechas (opcional)
- Los datos se actualizarán automáticamente

### Análisis con IA

#### Análisis Automático
Desde el dashboard, selecciona:
- **Análisis Diario**: Insights del día actual
- **Análisis Semanal**: Últimos 7 días
- **Análisis Mensual**: Últimos 30 días

#### Chat Interactivo
Pregunta cualquier cosa:
- "¿Cómo está mi salud cardiovascular?"
- "¿Por qué dormí mal anoche?"
- "Dame recomendaciones para mejorar mi sueño"
- "¿Cuál es mi tendencia de estrés esta semana?"

## Arquitectura

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│   Backend       │
│   (Express)     │
├─────────────────┤
│ - Auth Service  │
│ - Sync Service  │
│ - AI Service    │
│ - Notification  │
└───┬─────┬───┬───┘
    │     │   │
    │     │   └─────► OpenAI API
    │     │
    │     └─────────► Zepp API
    │
┌───▼─────────────┐
│  PostgreSQL     │
│  Database       │
└─────────────────┘
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/refresh-zepp-token` - Refrescar token de Zepp

### Datos de Salud
- `GET /api/data/dashboard` - Dashboard summary
- `GET /api/data/daily/:date` - Resumen de un día
- `GET /api/data/heart-rate` - Datos de frecuencia cardíaca
- `GET /api/data/sleep` - Datos de sueño
- `GET /api/data/stress` - Datos de estrés
- `GET /api/data/spo2` - Datos de SpO2
- `GET /api/data/workouts` - Entrenamientos
- `POST /api/data/sync` - Sincronizar manualmente

### Análisis con IA
- `POST /api/ai/analyze` - Analizar datos de salud
- `POST /api/ai/chat` - Chat con IA sobre tus datos
- `GET /api/ai/history` - Historial de análisis

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas

## Base de Datos

### Tablas Principales
- `users` - Usuarios y credenciales
- `daily_summaries` - Resumen diario
- `heart_rate_readings` - FC por minuto
- `stress_readings` - Niveles de estrés
- `spo2_readings` - Saturación de oxígeno
- `pai_scores` - Scores PAI
- `workouts` - Entrenamientos
- `notifications` - Notificaciones
- `ai_analysis_history` - Historial de análisis IA
- `sync_logs` - Logs de sincronización

## Configuración Avanzada

### Umbrales de Notificaciones

Edita en `.env`:

```env
NOTIFICATION_HR_HIGH=120        # bpm
NOTIFICATION_HR_LOW=45          # bpm
NOTIFICATION_SPO2_LOW=92        # %
NOTIFICATION_STRESS_HIGH=80     # nivel de estrés
```

### Intervalo de Sincronización

```env
SYNC_INTERVAL_MINUTES=60  # Cambia a tu preferencia
```

### Modelo de OpenAI

```env
OPENAI_MODEL=gpt-4-turbo-preview  # o gpt-3.5-turbo para menor costo
OPENAI_MAX_TOKENS=2000            # Ajusta según necesidad
```

## Desarrollo Local (Sin Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### PostgreSQL

Instala PostgreSQL localmente y ejecuta:

```bash
psql -U postgres -f backend/src/db/schema.sql
```

## Deployment en EasyPanel / Coolify / Portainer

### EasyPanel y Coolify

📖 **Guía detallada**: Ver [`EASYPANEL.md`](./EASYPANEL.md)

**Resumen rápido:**

1. 🔗 Conecta tu repositorio Git en el panel
2. ⚙️ EasyPanel/Coolify detectará automáticamente el `docker-compose.yml`
3. 📝 Configura las 3 variables obligatorias:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
4. 🚀 Deploy y listo

### Portainer

1. Sube el `docker-compose.yml` a Portainer
2. Configura las variables de entorno
3. Deploy stack

### Otros servicios

El proyecto usa **Docker Compose estándar**, compatible con:
- ✅ EasyPanel
- ✅ Coolify
- ✅ Portainer
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean App Platform
- ✅ Cualquier servidor con Docker

## Seguridad

- Las credenciales de Zepp se encriptan con AES antes de almacenarse
- JWT para autenticación con expiración de 7 días
- Helmet.js para headers de seguridad
- CORS configurado correctamente
- Rate limiting en la API de Zepp (1 req/segundo)

## Solución de Problemas

### Error de autenticación con Zepp
- Verifica tus credenciales de Zepp
- Usa "Refresh Token" en el dashboard
- Revisa los logs: `docker-compose logs backend`

### Sincronización no funciona
- Verifica que el token de Zepp esté válido
- Revisa `sync_logs` en la base de datos
- Chequea los logs del cron job

### OpenAI no responde
- Verifica tu API key
- Revisa los límites de uso de tu cuenta OpenAI
- Chequea los logs: `docker-compose logs backend`

## Roadmap

- [ ] Exportación de datos a CSV/JSON
- [ ] Comparación de períodos (mes vs mes)
- [ ] Objetivos personalizados
- [ ] Integración con Google Fit / Apple Health
- [ ] Notificaciones por email
- [ ] App móvil (React Native)

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Añadir nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## Licencia

MIT License - Ver LICENSE file para detalles

## Contacto

Para preguntas o soporte, abre un issue en GitHub.

---

**Nota**: Este proyecto no está afiliado con Zepp, Huami o Xiaomi. Es un proyecto independiente que usa la API pública de Zepp.
