# 🚀 Instalación Rápida - Zepp Health AI

Esta guía te ayudará a instalar **Zepp Health AI** en menos de 5 minutos usando Docker Compose en **EasyPanel**, **Coolify**, **Portainer** o cualquier servicio compatible.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. ✅ **Cuenta en Zepp/Huami** (email y contraseña de tu app Zepp Life)
2. ✅ **API Key de OpenAI** ([Consíguela aquí](https://platform.openai.com/api-keys))
3. ✅ **Servidor con Docker** instalado (o servicio como EasyPanel/Coolify)

---

## 🎯 Método 1: Instalación en EasyPanel (Recomendado)

### Paso 1: Preparar el repositorio

1. **Fork o clona este repositorio** en tu cuenta de GitHub/GitLab
2. O sube el código a tu propio repositorio Git

### Paso 2: Crear aplicación en EasyPanel

1. Inicia sesión en tu panel de **EasyPanel**
2. Clic en **"Create New Project"**
3. Selecciona **"From Git Repository"**
4. Conecta tu repositorio Git
5. EasyPanel detectará automáticamente el `docker-compose.yml`

### Paso 3: Configurar variables de entorno

En la sección de **Environment Variables** de EasyPanel, agrega las siguientes variables:

#### 🔴 Variables OBLIGATORIAS (debes cambiarlas):

```env
# PostgreSQL - Contraseña de la base de datos
POSTGRES_PASSWORD=tu_password_super_seguro_aqui

# JWT - Secret para autenticación
JWT_SECRET=un_secret_aleatorio_muy_largo_y_seguro

# OpenAI - TU API KEY (MUY IMPORTANTE)
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

#### 🟢 Variables OPCIONALES (tienen valores por defecto):

```env
# Base de datos
POSTGRES_USER=zepp_user
POSTGRES_DB=zepp_health
POSTGRES_PORT=5432

# Backend
NODE_ENV=production
PORT=3001
BACKEND_PORT=3001

# OpenAI - Configuración
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000

# Sincronización
SYNC_INTERVAL_MINUTES=60
RATE_LIMIT_REQUESTS_PER_SECOND=1

# Notificaciones
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80

# URLs (actualiza si usas un dominio personalizado)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Paso 4: Desplegar

1. Clic en **"Deploy"**
2. EasyPanel construirá las imágenes Docker automáticamente
3. Espera 3-5 minutos mientras se construye y despliega
4. ¡Listo! Tu aplicación estará disponible en la URL asignada

### Paso 5: Configurar dominio (Opcional)

1. En EasyPanel, ve a **Domains**
2. Agrega tu dominio personalizado
3. Actualiza las variables de entorno:
   ```env
   FRONTEND_URL=https://tudominio.com
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   NEXT_PUBLIC_WS_URL=wss://api.tudominio.com
   ```
4. Redespliega la aplicación

---

## 🐳 Método 2: Instalación en Docker Compose (Servidor propio)

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/zepp-health-ai.git
cd zepp-health-ai
```

### Paso 2: Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env
# o
vim .env
```

**Edita estas variables OBLIGATORIAS:**

- `POSTGRES_PASSWORD`: Una contraseña segura para PostgreSQL
- `JWT_SECRET`: Un secret aleatorio largo (puedes generarlo en https://www.uuidgenerator.net/)
- `OPENAI_API_KEY`: Tu API key de OpenAI (sk-...)

### Paso 3: Iniciar la aplicación

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver los logs en tiempo real
docker-compose logs -f

# Verificar que todo esté funcionando
docker-compose ps
```

### Paso 4: Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

---

## 🔧 Método 3: Instalación en Coolify

### Paso 1: Crear nuevo proyecto

1. Inicia sesión en **Coolify**
2. Clic en **"New Resource"**
3. Selecciona **"Docker Compose"**

### Paso 2: Pegar configuración

1. Copia el contenido completo del archivo `docker-compose.yml`
2. Pégalo en el editor de Coolify

### Paso 3: Configurar variables de entorno

En la sección de variables de entorno, agrega las 3 variables OBLIGATORIAS:

```env
POSTGRES_PASSWORD=tu_password_seguro
JWT_SECRET=secret_aleatorio_largo
OPENAI_API_KEY=sk-tu-api-key-openai
```

### Paso 4: Deploy

1. Clic en **"Deploy"**
2. Espera a que se construyan las imágenes
3. ¡Listo!

---

## 🎮 Primer Uso

### 1. Registrarse en la aplicación

1. Abre la URL de tu aplicación (ej: http://localhost:3000)
2. Clic en **"Regístrate"** o **"Sign Up"**
3. Completa el formulario:
   - **Email y contraseña**: Para la aplicación (crea uno nuevo)
   - **Zepp Email**: Tu email de la app Zepp Life
   - **Zepp Password**: Tu contraseña de Zepp Life

### 2. Primera sincronización

1. Una vez registrado, iniciarás sesión automáticamente
2. El sistema se autenticará con Zepp
3. La primera sincronización comenzará automáticamente
4. Verás tus datos aparecer en el dashboard

### 3. Usar el análisis con IA

1. En el dashboard, busca el botón **"Análisis con IA"**
2. Selecciona el tipo de análisis:
   - **Diario**: Análisis del día actual
   - **Semanal**: Últimos 7 días
   - **Mensual**: Últimos 30 días
3. O usa el **Chat Interactivo** para hacer preguntas específicas

---

## 🔐 Seguridad

### Contraseñas seguras

Genera contraseñas seguras usando:

- https://www.uuidgenerator.net/
- `openssl rand -base64 32`
- `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Variables de entorno sensibles

**NUNCA** compartas tu archivo `.env`. Las variables sensibles son:

- ❌ `OPENAI_API_KEY` - Tu API key de OpenAI (tiene costo)
- ❌ `JWT_SECRET` - Secret para JWT
- ❌ `POSTGRES_PASSWORD` - Contraseña de la base de datos

### CORS y URLs

Si usas un dominio personalizado, **DEBES** actualizar:

```env
FRONTEND_URL=https://tudominio.com
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.tudominio.com
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
- Verifica que PostgreSQL esté corriendo: `docker-compose ps`
- Revisa los logs: `docker-compose logs postgres`
- Asegúrate de que `POSTGRES_PASSWORD` esté configurado

### Error: "OpenAI API error" o "Unauthorized"

**Solución:**
- Verifica que tu `OPENAI_API_KEY` sea correcta
- Revisa que tengas créditos en tu cuenta de OpenAI
- Comprueba los logs: `docker-compose logs backend`

### Error: "Zepp authentication failed"

**Solución:**
- Verifica tus credenciales de Zepp (email y contraseña)
- Intenta iniciar sesión en la app Zepp Life primero
- Usa el botón "Refresh Token" en el dashboard

### Los datos no se sincronizan

**Solución:**
- Verifica los logs del backend: `docker-compose logs backend`
- Revisa la tabla `sync_logs` en la base de datos
- Comprueba que el token de Zepp sea válido

### Frontend no carga

**Solución:**
- Verifica que el backend esté corriendo: `docker-compose ps`
- Comprueba las URLs en las variables de entorno
- Revisa los logs: `docker-compose logs frontend`

---

## 📊 Comandos Útiles

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f postgres
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo el backend
docker-compose restart backend
```

### Detener y eliminar todo

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra la BD)
docker-compose down -v
```

### Actualizar la aplicación

```bash
# Detener servicios
docker-compose down

# Obtener últimos cambios
git pull

# Reconstruir y iniciar
docker-compose up -d --build
```

---

## 🎯 Verificación Post-Instalación

Después de instalar, verifica que todo funcione:

### 1. Servicios corriendo

```bash
docker-compose ps
```

Deberías ver 3 servicios **Up**:
- ✅ zepp-postgres
- ✅ zepp-backend
- ✅ zepp-frontend

### 2. Health checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

### 3. Base de datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U zepp_user -d zepp_health

# Ver tablas
\dt

# Salir
\q
```

---

## 💡 Consejos de Producción

### 1. Backups de la base de datos

Crea backups regulares:

```bash
# Hacer backup
docker-compose exec postgres pg_dump -U zepp_user zepp_health > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U zepp_user zepp_health < backup.sql
```

### 2. Monitoreo

Considera agregar:
- **Uptime Kuma**: Para monitoreo de uptime
- **Grafana + Prometheus**: Para métricas detalladas
- **Portainer**: Para gestión visual de Docker

### 3. HTTPS/SSL

Para producción, **SIEMPRE** usa HTTPS:
- EasyPanel y Coolify lo configuran automáticamente
- Para servidores propios, usa **Traefik** o **Caddy**

### 4. Recursos recomendados

Mínimo:
- **CPU**: 2 cores
- **RAM**: 2GB
- **Disco**: 10GB

Recomendado para producción:
- **CPU**: 4 cores
- **RAM**: 4GB
- **Disco**: 20GB SSD

---

## 📞 Soporte

Si tienes problemas:

1. 📖 Lee esta guía completa
2. 🔍 Revisa los logs: `docker-compose logs -f`
3. 🐛 Busca en los **Issues** del repositorio
4. ❓ Abre un nuevo **Issue** con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir

---

## 🎉 ¡Listo!

Tu dashboard de Zepp Health con IA está instalado y funcionando.

**Próximos pasos:**
1. Registra tu cuenta
2. Sincroniza tus datos de Zepp
3. Explora el análisis con IA
4. Configura las notificaciones según tus preferencias

¡Disfruta monitoreando tu salud con inteligencia artificial! 🚀💪

---

## 📝 Checklist de Instalación

- [ ] Clonado/Fork del repositorio
- [ ] Archivo `.env` creado y configurado
- [ ] `POSTGRES_PASSWORD` configurado
- [ ] `JWT_SECRET` configurado
- [ ] `OPENAI_API_KEY` configurado
- [ ] `docker-compose up -d` ejecutado
- [ ] Servicios corriendo (`docker-compose ps`)
- [ ] Frontend accesible (http://localhost:3000)
- [ ] Backend accesible (http://localhost:3001)
- [ ] Usuario registrado
- [ ] Primera sincronización completada
- [ ] Análisis con IA funcionando

✅ **Si marcaste todos, ¡estás listo!**
