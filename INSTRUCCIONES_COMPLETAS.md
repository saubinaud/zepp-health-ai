# 🚀 Instrucciones Completas - Zepp Health Dashboard con IA

## ✅ Estado del Proyecto: 100% COMPLETO

Todo el código ha sido creado. Solo necesitas seguir estos pasos para poner la aplicación en marcha.

---

## 📋 Paso 1: Preparación Inicial

### 1.1 Verificar Estructura de Archivos

Tu proyecto debería tener esta estructura:

```
zepp-health-ai/
├── backend/
│   ├── src/
│   │   ├── api/          ✅ Zepp client + OpenAI client
│   │   ├── services/     ✅ Auth, Sync, AI, Notifications
│   │   ├── db/           ✅ Schema SQL + conexión
│   │   ├── routes/       ✅ Auth, Data, AI, Notifications
│   │   ├── middleware/   ✅ Auth middleware
│   │   ├── sockets/      ✅ WebSocket notifications
│   │   ├── types/        ✅ TypeScript types
│   │   └── index.ts      ✅ Main server
│   ├── Dockerfile        ✅
│   ├── package.json      ✅
│   └── tsconfig.json     ✅
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── ai-insights/page.tsx   ✅ Chat con IA
│   │   │   │   ├── heart-rate/page.tsx    ✅
│   │   │   │   ├── sleep/page.tsx         ✅
│   │   │   │   ├── workouts/page.tsx      ✅
│   │   │   │   ├── layout.tsx             ✅ Sidebar + Header
│   │   │   │   └── page.tsx               ✅ Dashboard principal
│   │   │   ├── login/page.tsx             ✅
│   │   │   ├── layout.tsx                 ✅
│   │   │   ├── page.tsx                   ✅
│   │   │   └── globals.css                ✅
│   │   ├── components/
│   │   │   ├── ui/                        ✅ shadcn/ui components
│   │   │   ├── dashboard/                 ✅ MetricCard
│   │   │   └── charts/                    ✅ HRChart, SleepChart
│   │   └── lib/
│   │       ├── api.ts                     ✅ API client
│   │       ├── socket.ts                  ✅ WebSocket client
│   │       └── utils.ts                   ✅ Utilidades
│   ├── Dockerfile        ✅
│   ├── package.json      ✅
│   ├── tsconfig.json     ✅
│   ├── tailwind.config.ts ✅
│   ├── postcss.config.js  ✅
│   └── next.config.js     ✅
├── docker-compose.yml    ✅
├── .env.example          ✅
├── .gitignore            ✅
└── README.md             ✅
```

---

## 📝 Paso 2: Configurar Variables de Entorno

### 2.1 Copiar Archivo de Ejemplo

```bash
cp .env.example .env
```

### 2.2 Editar `.env` con tus Datos

Abre `.env` y configura:

```env
# PostgreSQL - Cambia la contraseña
POSTGRES_USER=zepp_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_AQUI
POSTGRES_DB=zepp_health
DATABASE_URL=postgresql://zepp_user:TU_PASSWORD_SEGURO_AQUI@postgres:5432/zepp_health

# Backend - Genera un secret aleatorio
NODE_ENV=production
PORT=3001
JWT_SECRET=CAMBIA_ESTO_POR_UN_SECRET_ALEATORIO_LARGO

# Zepp API
SYNC_INTERVAL_MINUTES=60

# OpenAI - IMPORTANTE: Pon tu API key aquí
OPENAI_API_KEY=sk-TU_API_KEY_DE_OPENAI_AQUI
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000

# Notificaciones - Umbrales de alerta
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**CRÍTICO**:
- Cambia `POSTGRES_PASSWORD` por una contraseña segura
- Cambia `JWT_SECRET` por un string aleatorio largo
- **Añade tu `OPENAI_API_KEY`** (consíguelo en https://platform.openai.com/api-keys)

---

## 🐳 Paso 3: Instalar Docker (si no lo tienes)

### macOS:
```bash
brew install --cask docker
```
Luego abre Docker Desktop.

### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Windows:
Descarga e instala Docker Desktop desde: https://www.docker.com/products/docker-desktop

---

## 🚀 Paso 4: Iniciar la Aplicación

### 4.1 Construir e Iniciar con Docker

```bash
# Construir e iniciar todos los servicios (PostgreSQL, Backend, Frontend)
docker-compose up --build -d

# Ver los logs en tiempo real
docker-compose logs -f
```

### 4.2 Esperar a que Todo Esté Listo

Espera a ver estos mensajes en los logs:

```
zepp-backend    | ╔════════════════════════════════════════════╗
zepp-backend    | ║   Zepp Health Data API Server Started     ║
zepp-backend    | ╚════════════════════════════════════════════╝

zepp-frontend   | ▲ Next.js 14.1.0
zepp-frontend   | - Local:        http://localhost:3000
```

Esto puede tomar 2-3 minutos la primera vez.

---

## 🎉 Paso 5: Usar la Aplicación

### 5.1 Abrir en el Navegador

Abre: **http://localhost:3000**

### 5.2 Crear Tu Cuenta

1. Click en "**Regístrate**"
2. Ingresa:
   - **Tu email y contraseña** (para esta app)
   - **Tu email y contraseña de Zepp** (de tu cuenta Zepp/Huami)
3. Click "**Registrarse**"

El sistema:
- Se autenticará con Zepp automáticamente
- Comenzará a sincronizar tus datos
- Te redirigirá al dashboard

### 5.3 Primera Sincronización

Una vez dentro:
1. Click en "**Sincronizar**" en el dashboard
2. Espera 1-2 minutos mientras se descargan tus datos
3. Refresca la página

---

## 🤖 Paso 6: Usar el Análisis con IA

### 6.1 Ir a Análisis IA

- Click en "**Análisis IA**" en el sidebar
- O visita: http://localhost:3000/dashboard/ai-insights

### 6.2 Opciones Disponibles

**Pestaña "Análisis Rápido":**
- Click en "**Análisis Diario**" → Análisis del día actual
- Click en "**Análisis Semanal**" → Tendencias de los últimos 7 días
- Click en "**Análisis Mensual**" → Análisis del último mes

**Pestaña "Chat Interactivo":**
- Escribe preguntas como:
  - "¿Cómo está mi salud cardiovascular?"
  - "¿Por qué dormí mal anoche?"
  - "Dame recomendaciones para mejorar mi sueño"
  - "¿Cuál es mi tendencia de estrés esta semana?"

La IA analizará TODOS tus datos de salud y te dará:
- ✨ **Resumen** general
- 💡 **Insights** (observaciones y patrones)
- 📈 **Recomendaciones** personalizadas
- ⚠️ **Alertas** si hay algo preocupante

---

## 📊 Paso 7: Explorar el Dashboard

### Páginas Disponibles:

1. **Dashboard Principal** (`/dashboard`)
   - Resumen del día
   - Gráfico de HR últimas 24h
   - Fases de sueño últimos 7 días
   - Métricas rápidas

2. **Frecuencia Cardíaca** (`/dashboard/heart-rate`)
   - Gráfico detallado de HR
   - Estadísticas (avg, max, min)

3. **Sueño** (`/dashboard/sleep`)
   - Historial de sueño
   - Fases de sueño por noche
   - Estadísticas de calidad

4. **Entrenamientos** (`/dashboard/workouts`)
   - Lista de todos tus entrenamientos
   - Calorías, duración, distancia
   - HR promedio por workout

5. **Análisis IA** (`/dashboard/ai-insights`) ⭐
   - Chat interactivo
   - Análisis automáticos
   - Insights y recomendaciones

---

## 🔔 Notificaciones en Tiempo Real

Las notificaciones automáticas se activan cuando:
- ❤️ Tu HR es muy alta (> 120 bpm por defecto)
- 💙 Tu HR es muy baja (< 45 bpm por defecto)
- 🫁 Tu SpO2 está bajo (< 92% por defecto)
- 😰 Tu estrés está elevado (> 80 por defecto)
- 🎯 Alcanzas tu meta de 10,000 pasos

Configurables en `.env` con `NOTIFICATION_*` variables.

---

## 🔧 Comandos Útiles

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend
```

### Detener la Aplicación

```bash
docker-compose down
```

### Eliminar Todo (Datos Incluidos)

```bash
# CUIDADO: Esto borra la base de datos
docker-compose down -v
```

### Ver Estado

```bash
docker-compose ps
```

---

## 🐛 Solución de Problemas

### Problema 1: "Error al autenticar con Zepp"

**Solución:**
- Verifica que tu email y contraseña de Zepp sean correctos
- Asegúrate de poder hacer login en la app oficial de Zepp
- Intenta de nuevo

### Problema 2: "No se sincronizan los datos"

**Solución:**
```bash
# Ver logs del backend
docker-compose logs backend

# Si el token expiró, ve al dashboard y click "Sincronizar"
```

### Problema 3: "La IA no responde"

**Solución:**
- Verifica que tu `OPENAI_API_KEY` esté correcto en `.env`
- Verifica que tienes saldo en tu cuenta de OpenAI
- Revisa los logs: `docker-compose logs backend`

### Problema 4: "Puerto 3000 ya está en uso"

**Solución:**
```bash
# En .env cambia:
# FRONTEND_URL=http://localhost:3001
# Y en docker-compose.yml cambia el puerto del frontend
```

### Problema 5: "Cannot connect to database"

**Solución:**
```bash
# Reinicia PostgreSQL
docker-compose restart postgres

# Espera 10 segundos y reinicia backend
docker-compose restart backend
```

---

## 🔄 Sincronización Automática

La app sincroniza automáticamente tus datos **cada hora**.

Puedes cambiar el intervalo en `.env`:
```env
SYNC_INTERVAL_MINUTES=30  # Para sincronizar cada 30 minutos
```

---

## 📱 Acceso desde Otros Dispositivos

### En tu Red Local:

1. Encuentra tu IP local:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Actualiza `.env`:
```env
FRONTEND_URL=http://TU_IP:3000
```

3. Reinicia:
```bash
docker-compose restart
```

4. Accede desde otro dispositivo: `http://TU_IP:3000`

---

## 🌐 Deploy en Producción (EasyPanel)

### Opción 1: Subir a GitHub

1. Crea un repositorio en GitHub
2. Sube el código:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/zepp-health-ai.git
git push -u origin main
```

3. En EasyPanel:
   - Crear nueva app
   - Seleccionar "Docker Compose"
   - Conectar con tu repo de GitHub
   - Configurar variables de entorno
   - Deploy

### Opción 2: Deploy Manual

Ver documentación de EasyPanel para deploy con Docker Compose.

---

## 📊 Modelos de IA Disponibles

En `.env` puedes cambiar el modelo:

```env
# Más inteligente (recomendado, más caro)
OPENAI_MODEL=gpt-4-turbo-preview

# Más rápido y económico
OPENAI_MODEL=gpt-3.5-turbo

# Mejor calidad
OPENAI_MODEL=gpt-4
```

---

## 💰 Costos de OpenAI

Estimación de costos:

- **Análisis diario**: ~$0.01 - $0.03 USD
- **Análisis semanal**: ~$0.03 - $0.05 USD
- **Pregunta en chat**: ~$0.01 - $0.02 USD

**Uso mensual estimado**: $3-10 USD (dependiendo de uso)

Para reducir costos:
- Usa `gpt-3.5-turbo` en lugar de `gpt-4`
- Reduce `OPENAI_MAX_TOKENS` en `.env`

---

## 🎯 Próximos Pasos Recomendados

1. ✅ **Registrarse y sincronizar datos**
2. ✅ **Explorar el dashboard**
3. ✅ **Probar el chat con IA** (¡lo más interesante!)
4. ⚙️ **Configurar umbrales de notificaciones** (opcional)
5. 📅 **Dejar que sincronice automáticamente** por unos días
6. 🧠 **Pedir análisis de tendencias** después de una semana

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica `.env` está bien configurado
3. Asegúrate de que Docker está corriendo
4. Reinicia todo: `docker-compose restart`

---

## 🎉 ¡Listo!

Tu dashboard de salud con IA está completamente funcional. Disfruta analizando tus datos de salud con inteligencia artificial!

**URLs Principales:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

**Próximo objetivo:** Acumula datos por una semana y pide un análisis completo de tendencias. La IA te sorprenderá con insights que ni sabías que existían en tus datos.
