# 🚀 INSTALACIÓN DIRECTA EN EASYPANEL (SIN GIT)

## La forma MÁS SIMPLE - Solo copiar y pegar

No necesitas Git, repositorio, ni nada complicado. Solo 3 pasos:

---

## 📋 Paso 1: Copiar el Docker Compose

En EasyPanel:
1. Ve a **Services** → **Create** → **Docker Compose**
2. Copia y pega el contenido del archivo **`docker-compose.yml`** de este proyecto

O usa esta versión autocontenida más abajo ⬇️

---

## ⚙️ Paso 2: Configurar Variables de Entorno

En EasyPanel, en la sección **Environment Variables**, pega esto:

```env
# ============================================
# VARIABLES OBLIGATORIAS - Cámbialas
# ============================================

# PostgreSQL Password (elige una contraseña segura)
POSTGRES_PASSWORD=MiPasswordSegura123!

# JWT Secret (genera uno en https://www.uuidgenerator.net/)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# OpenAI API Key (consíguela en https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui

# ============================================
# OPCIONALES - Puedes dejarlas así
# ============================================

POSTGRES_USER=zepp_user
POSTGRES_DB=zepp_health
NODE_ENV=production
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
SYNC_INTERVAL_MINUTES=60
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80
```

---

## 🚀 Paso 3: Deploy

1. Haz clic en **Deploy** o **Start**
2. Espera 3-5 minutos
3. ¡Listo!

---

## 🌐 Configurar Dominio (Opcional)

Si quieres usar tu propio dominio:

### 1. En EasyPanel, configura:
- Frontend: `zepp.tudominio.com` → Puerto 3000
- Backend: `api.zepp.tudominio.com` → Puerto 3001

### 2. Actualiza estas variables de entorno:

```env
FRONTEND_URL=https://zepp.tudominio.com
NEXT_PUBLIC_API_URL=https://api.zepp.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.zepp.tudominio.com
```

### 3. Reinicia el servicio

---

## ✅ Verificación

Después del deploy, verifica:

- ✅ 3 servicios corriendo: `postgres`, `backend`, `frontend`
- ✅ Frontend accesible en la URL asignada
- ✅ Backend health check OK

---

## 🎮 Primer Uso

1. Abre la URL de tu frontend
2. Clic en **"Regístrate"**
3. Completa:
   - Email y contraseña (nueva cuenta para la app)
   - Email y contraseña de Zepp Life
4. ¡La sincronización comenzará automáticamente!

---

## 💡 Nota Importante

**NO NECESITAS:**
- ❌ Git
- ❌ Clonar repositorio
- ❌ GitHub/GitLab
- ❌ Build local
- ❌ Nada complicado

**SOLO NECESITAS:**
- ✅ Copiar el docker-compose.yml
- ✅ Configurar 3 variables
- ✅ Deploy

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"
→ Verifica que `POSTGRES_PASSWORD` esté configurado

### Error: "OpenAI API error"
→ Verifica tu `OPENAI_API_KEY` y que tengas créditos

### Frontend no carga
→ Verifica que el backend esté corriendo y las URLs estén correctas

---

## 📞 Soporte

Si tienes problemas, revisa los logs en EasyPanel o abre un issue.

---

¡Así de simple! 🎉
