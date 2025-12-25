# Configuración Cloudflare + EasyPanel

## 🚨 Problema Principal

El error era intentar usar puerto 80 directamente, pero **EasyPanel ya tiene un reverse proxy en ese puerto**.

## ✅ Arquitectura Correcta

```
Internet
  ↓
Cloudflare (443)
  ↓
EasyPanel Reverse Proxy (80/443)
  ↓
  ├─→ zepp.nodumstudio.com → Frontend (8081)
  └─→ api.zepp.nodumstudio.com → Backend (8080)
```

### Configuración de Puertos

| Servicio | Puerto Interno Docker | Puerto Expuesto | Dominio |
|----------|---------------------|-----------------|---------|
| Frontend | 3000 | **8081** | zepp.nodumstudio.com |
| Backend | 8080 | **8080** | api.zepp.nodumstudio.com |
| PostgreSQL | 5432 | (no expuesto) | - |

**IMPORTANTE**: EasyPanel maneja el routing de 80/443 → 8080/8081

---

## 📋 Pasos de Configuración

### 1️⃣ En Cloudflare

#### A. Configurar DNS
```
Tipo: A
Nombre: zepp
Contenido: [IP_DE_TU_VPS]
Proxy: ✅ Activado (nube naranja 🟠)
TTL: Auto

Tipo: A
Nombre: api.zepp
Contenido: [IP_DE_TU_VPS]
Proxy: ✅ Activado (nube naranja 🟠)
TTL: Auto
```

#### B. Configurar SSL/TLS
1. Ve a **SSL/TLS** → **Overview**
2. Selecciona: **Full** o **Full (strict)**
   - ⚠️ NO uses "Flexible" (causará loops de redirección)

#### C. (Opcional) Always Use HTTPS
1. Ve a **SSL/TLS** → **Edge Certificates**
2. Activa: **Always Use HTTPS**

---

### 2️⃣ En EasyPanel

#### A. Configurar Variables de Entorno

**IMPORTANTE**: Asegúrate de que tu archivo `.env` tenga:

```env
# Puertos internos (EasyPanel reverse proxy maneja 80/443)
FRONTEND_PORT=8081
BACKEND_PORT=8080

# URLs con HTTPS y WSS (Cloudflare maneja SSL)
FRONTEND_URL=https://zepp.nodumstudio.com
NEXT_PUBLIC_API_URL=https://api.zepp.nodumstudio.com
NEXT_PUBLIC_WS_URL=wss://api.zepp.nodumstudio.com

# Secrets (completa estos valores)
POSTGRES_PASSWORD=[TU_PASSWORD_SEGURA]
JWT_SECRET=[TU_JWT_SECRET]
OPENAI_API_KEY=[TU_OPENAI_API_KEY]
```

#### B. Configurar Dominios en EasyPanel

**Frontend:**
- Dominio: `zepp.nodumstudio.com`
- Puerto: **8081** (interno - EasyPanel maneja el routing)
- HTTPS: Activado (EasyPanel reverse proxy lo maneja)

**Backend:**
- Dominio: `api.zepp.nodumstudio.com`
- Puerto: **8080** (interno)
- HTTPS: Activado (EasyPanel reverse proxy lo maneja)

#### C. Rebuild de Contenedores

**⚠️ MUY IMPORTANTE**: Después de cambiar `NEXT_PUBLIC_*` variables:

1. Detén todos los contenedores
2. Elimina los contenedores antiguos
3. Haz rebuild completo (no solo restart)

Esto es porque Next.js **embebe** las variables `NEXT_PUBLIC_*` en tiempo de compilación.

---

### 3️⃣ Verificar la Configuración

#### A. Verificar DNS
```bash
# Debe apuntar a tu VPS
dig zepp.nodumstudio.com
dig api.zepp.nodumstudio.com
```

#### B. Verificar Puertos
```bash
# Verifica que los contenedores estén escuchando
docker ps
# Deberías ver:
# - frontend: 0.0.0.0:8081->3000/tcp
# - backend: 0.0.0.0:8080->8080/tcp
```

#### C. Verificar Logs
```bash
# Ver logs del frontend
docker compose logs frontend -f

# Ver logs del backend
docker compose logs backend -f

# El backend debe mostrar: "Server running on port 8080"
```

---

## 🔍 Troubleshooting

### Error: Bad Gateway

**Causas comunes:**
1. ✅ Cloudflare SSL/TLS en "Flexible" → Cambiar a "Full"
2. ✅ Puertos incorrectos en EasyPanel (usar 8081 y 8080)
3. ✅ Variables NEXT_PUBLIC_* no actualizadas (falta rebuild)
4. ✅ Firewall bloqueando puertos 8080/8081

### Error: Port 80 already allocated

**Causa:** Intentando usar puerto 80 directamente

**Solución:**
- NO uses puerto 80 en docker-compose
- EasyPanel tiene su reverse proxy en puerto 80
- Usa puertos altos como 8080, 8081, etc.

**Solución:**
```bash
# 1. Verifica que los contenedores estén corriendo
docker compose ps

# 2. Verifica los logs
docker compose logs

# 3. Rebuild completo
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Error: ERR_SSL_VERSION_OR_CIPHER_MISMATCH

**Causa:** SSL/TLS en Cloudflare mal configurado

**Solución:**
- Cloudflare → SSL/TLS → Cambiar a "Full" o "Full (strict)"

### WebSocket no conecta

**Causa:** WSS no configurado correctamente

**Solución:**
1. Verificar que `NEXT_PUBLIC_WS_URL=wss://api.zepp.nodumstudio.com`
2. Hacer rebuild del frontend
3. En Cloudflare → Network → Activar "WebSockets"

---

## 📝 Checklist Final

- [ ] DNS en Cloudflare apuntando a tu VPS
- [ ] Proxy activado (🟠) en ambos dominios
- [ ] SSL/TLS en "Full" o "Full (strict)"
- [ ] Archivo .env actualizado con puertos 8081 y 8080
- [ ] Variables NEXT_PUBLIC_* con https:// y wss://
- [ ] Secrets configurados (POSTGRES_PASSWORD, JWT_SECRET, OPENAI_API_KEY)
- [ ] Rebuild completo de contenedores hecho
- [ ] Dominios en EasyPanel apuntando a puertos 8081 y 8080
- [ ] Logs sin errores

---

## 🎯 Resultado Esperado

✅ `https://zepp.nodumstudio.com` → Frontend funcionando
✅ `https://api.zepp.nodumstudio.com/health` → Backend respondiendo
✅ WebSocket conectando correctamente
✅ Sin errores de CORS
✅ Sin Bad Gateway

---

## 💡 Notas Importantes

1. **Cloudflare maneja el SSL/TLS**: No necesitas configurar certificados en tu VPS
2. **EasyPanel maneja el routing**: Mapea los dominios a los puertos internos
3. **Next.js variables en build time**: Cambios en NEXT_PUBLIC_* requieren rebuild
4. **WebSockets requieren WSS**: Usa `wss://` en producción con Cloudflare
