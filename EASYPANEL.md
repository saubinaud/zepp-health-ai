# 🚀 Instalación en EasyPanel - Zepp Health AI

## Guía Rápida para EasyPanel

Sigue estos pasos para instalar **Zepp Health AI** en EasyPanel en menos de 2 minutos.

---

## 📋 Paso 1: Configurar Variables de Entorno

En tu panel de EasyPanel, ve a la sección **Environment Variables** y pega las siguientes variables:

### ⚠️ IMPORTANTES - Debes cambiarlas:

```env
# PostgreSQL - Cambia esta contraseña
POSTGRES_PASSWORD=tu_password_super_seguro_aqui

# JWT Secret - Cambia este secret (genera uno en https://www.uuidgenerator.net/)
JWT_SECRET=un_secret_aleatorio_muy_largo_y_seguro

# OpenAI API Key - OBLIGATORIO (consigue una en https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

### ✅ Opcionales - Puedes dejarlas así:

```env
POSTGRES_USER=zepp_user
POSTGRES_DB=zepp_health
POSTGRES_PORT=5432
NODE_ENV=production
PORT=3001
BACKEND_PORT=3001
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
SYNC_INTERVAL_MINUTES=60
RATE_LIMIT_REQUESTS_PER_SECOND=1
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 🔧 Paso 2: Configuración del Repositorio

1. **Conecta tu repositorio Git:**
   - Ve a **New Project** → **From Git**
   - Conecta este repositorio
   - EasyPanel detectará automáticamente el `docker-compose.yml`

2. **Servicios que se desplegarán:**
   - ✅ PostgreSQL (Base de datos)
   - ✅ Backend (API Node.js)
   - ✅ Frontend (Next.js)

---

## 🌐 Paso 3: Configurar Dominio (Opcional)

Si quieres usar un dominio personalizado:

1. En EasyPanel, ve a **Domains**
2. Agrega tu dominio (ej: `zepp.tudominio.com`)
3. Actualiza estas variables de entorno:

```env
FRONTEND_URL=https://zepp.tudominio.com
NEXT_PUBLIC_API_URL=https://api.zepp.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.zepp.tudominio.com
```

4. Configura los subdominios en EasyPanel:
   - `zepp.tudominio.com` → Frontend (puerto 3000)
   - `api.zepp.tudominio.com` → Backend (puerto 3001)

---

## 🎯 Paso 4: Deploy

1. Clic en **Deploy** o **Start**
2. Espera 3-5 minutos mientras se construyen las imágenes
3. ¡Listo! Tu aplicación estará disponible

---

## ✅ Verificación

Después del deploy, verifica que todo funcione:

### Servicios activos:
- ✅ `zepp-postgres` - Base de datos
- ✅ `zepp-backend` - API Backend
- ✅ `zepp-frontend` - Aplicación web

### URLs accesibles:
- ✅ Frontend: Tu dominio o IP asignada por EasyPanel
- ✅ Backend API: Tu dominio/api o IP:3001

---

## 🎮 Primer Uso

1. **Abre el frontend** en tu navegador
2. **Clic en "Regístrate"**
3. **Completa el formulario:**
   - Email y contraseña (para la app)
   - Email y contraseña de Zepp Life
4. **Primera sincronización** se iniciará automáticamente
5. ¡Disfruta de tu dashboard con IA! 🚀

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que `POSTGRES_PASSWORD` esté configurado
- Revisa los logs del servicio PostgreSQL en EasyPanel

### Error: "OpenAI API error"
- Verifica que `OPENAI_API_KEY` sea correcta
- Comprueba que tienes créditos en OpenAI
- Revisa los logs del backend

### Frontend no carga
- Verifica que el backend esté corriendo
- Comprueba las URLs en las variables de entorno
- Si usas dominio personalizado, verifica la configuración DNS

---

## 📊 Recursos Recomendados

### Mínimo:
- CPU: 1 core
- RAM: 1GB
- Disco: 5GB

### Recomendado:
- CPU: 2 cores
- RAM: 2GB
- Disco: 10GB

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE:

1. **Cambia SIEMPRE:**
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - Nunca uses los valores de ejemplo

2. **OpenAI API Key:**
   - Guárdala de forma segura
   - No la compartas
   - Tiene costo asociado

3. **Producción:**
   - Usa HTTPS (EasyPanel lo configura automáticamente)
   - Habilita autenticación de dos factores en tu cuenta

---

## 📞 Soporte

Si tienes problemas:
1. 📖 Lee la documentación completa en `INSTALL.md`
2. 🔍 Revisa los logs en EasyPanel
3. 🐛 Abre un issue en GitHub

---

## 🎉 ¡Todo listo!

Tu dashboard de **Zepp Health AI** está funcionando.

**Características disponibles:**
- ✅ Sincronización automática cada hora
- ✅ Análisis con IA (GPT-4)
- ✅ Notificaciones en tiempo real
- ✅ Dashboard interactivo
- ✅ Chat con IA sobre tus datos de salud

¡Disfruta monitoreando tu salud! 💪🚀
