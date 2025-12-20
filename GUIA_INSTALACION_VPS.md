# 🚀 Guía de Instalación en VPS (nodumstudio.com)

## ✨ Nuevas Funcionalidades Añadidas

### 🤖 Predicciones de Salud con IA
- **Detecta riesgos**: Enfermedades respiratorias, cardiovasculares, fatiga crónica
- **Análisis preventivo**: La IA predice posibles problemas antes de que ocurran
- **Recomendaciones personalizadas**: Basadas en tus patrones de salud

### 💪 Análisis Avanzado de Ejercicios
- **Performance score**: Calificación de cada entrenamiento
- **Tiempo de recuperación**: Cuántas horas necesitas descansar
- **Fortalezas y debilidades**: Qué estás haciendo bien y qué mejorar
- **Comparación histórica**: vs. tus entrenamientos anteriores
- **Recomendaciones de mejora**: Sugerencias específicas para cada área

### 📝 Check-ins Diarios (Estilo Whoop)
- **Preguntas diarias** sobre tu bienestar:
  - ¿Cómo dormiste?
  - ¿Cómo te sientes de energía?
  - ¿Cómo está tu ánimo?
  - ¿Qué tan estresado estás?
  - Nivel de hidratación
  - Dolor muscular
- **Contexto subjetivo** para mejorar análisis de IA

### ⚙️ Configuración de API Key Personal
- **Tu propia API key de OpenAI**: Usa tu clave si quieres
- **Control de costos**: Monitorea tu propio uso
- **Opcional**: Usa la global si prefieres

---

## 📋 Requisitos del VPS

Mínimo recomendado:
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 20 GB SSD
- **OS**: Ubuntu 22.04 LTS o superior

---

## 🔧 Paso 1: Preparar el VPS

### 1.1 Conectar al VPS

```bash
ssh root@nodumstudio.com
# O con tu usuario
ssh tu_usuario@nodumstudio.com
```

### 1.2 Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario a grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 1.4 Instalar Git

```bash
sudo apt install git -y
```

---

## 📦 Paso 2: Clonar el Proyecto

```bash
# Crear directorio para aplicaciones
cd /home/$USER
mkdir -p apps
cd apps

# Opción A: Si tienes el proyecto en GitHub
git clone https://github.com/tu-usuario/zepp-health-ai.git

# Opción B: Si tienes el proyecto local, súbelo con scp
# Desde tu Mac:
# scp -r "/Users/sebastien/Desktop/Zepp app ai" usuario@nodumstudio.com:/home/usuario/apps/zepp-health-ai

# Entrar al directorio
cd zepp-health-ai
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar con nano o vim
nano .env
```

**Configuración OBLIGATORIA para VPS:**

```env
# PostgreSQL - CAMBIA LA CONTRASEÑA
POSTGRES_USER=zepp_user
POSTGRES_PASSWORD=TU_PASSWORD_SUPER_SEGURA_AQUI
POSTGRES_DB=zepp_health
POSTGRES_PORT=5432

# Backend - GENERA UN SECRET ALEATORIO LARGO
NODE_ENV=production
PORT=3001
JWT_SECRET=cambia_esto_por_un_string_muy_largo_y_aleatorio_123456789

# Zepp API
SYNC_INTERVAL_MINUTES=60
RATE_LIMIT_REQUESTS_PER_SECOND=1

# OpenAI - TU API KEY
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000

# Notificaciones
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HR_HIGH=120
NOTIFICATION_HR_LOW=45
NOTIFICATION_SPO2_LOW=92
NOTIFICATION_STRESS_HIGH=80

# URLs - IMPORTANTE: Cambia por tu dominio
FRONTEND_URL=https://nodumstudio.com
NEXT_PUBLIC_API_URL=https://nodumstudio.com/api
NEXT_PUBLIC_WS_URL=wss://nodumstudio.com

# Puertos (opcional cambiar)
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

**Guardar**: Ctrl+X, luego Y, luego Enter

---

## 🐳 Paso 4: Iniciar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f
```

**Espera a ver**:
```
zepp-backend    | ╔════════════════════════════════════════════╗
zepp-backend    | ║   Zepp Health Data API Server Started     ║
zepp-frontend   | ▲ Next.js 14.1.0
```

Esto toma 3-5 minutos la primera vez.

---

## 🌐 Paso 5: Configurar Nginx (Reverse Proxy)

### 5.1 Instalar Nginx

```bash
sudo apt install nginx -y
```

### 5.2 Crear Configuración

```bash
sudo nano /etc/nginx/sites-available/zepp-health
```

**Pega esta configuración:**

```nginx
# Frontend
server {
    listen 80;
    server_name nodumstudio.com www.nodumstudio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket para notificaciones
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Activar Configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/zepp-health /etc/nginx/sites-enabled/

# Eliminar default si existe
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Paso 6: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d nodumstudio.com -d www.nodumstudio.com

# Seguir las instrucciones (ingresa tu email, acepta términos)
```

Certbot configurará automáticamente HTTPS y renovará el certificado.

---

## 🎯 Paso 7: Verificar que Todo Funciona

### 7.1 Verificar Servicios

```bash
# Ver estado de containers
docker-compose ps

# Todos deberían estar "Up" y "healthy"
```

### 7.2 Abrir en Navegador

```
https://nodumstudio.com
```

¡Deberías ver la pantalla de login!

---

## 📊 Uso de las Nuevas Funcionalidades

### 1. Check-in Diario

1. Cada día, ve a la app
2. Verás un modal/banner con preguntas diarias
3. Responde cómo dormiste, tu energía, ánimo, etc.
4. Esto mejora las predicciones de IA

**API Endpoint:**
```bash
POST /api/health/checkin
{
  "sleep_quality": 4,
  "energy_level": 3,
  "mood": 5,
  "stress_level": 2,
  "hydration_level": 4,
  "muscle_soreness": 1
}
```

### 2. Predicciones de Salud

1. Ve a "Salud" → "Predicciones"
2. Click "Generar Predicción"
3. La IA analizará tus últimos 30 días
4. Te dirá:
   - Tipo de riesgo (respiratorio, cardiovascular, etc.)
   - Nivel de riesgo (bajo/medio/alto)
   - Factores de riesgo
   - Recomendaciones

**API Endpoint:**
```bash
POST /api/health/predictions/generate
```

### 3. Análisis de Ejercicios

1. Ve a "Entrenamientos"
2. Click en un entrenamiento
3. Click "Analizar con IA"
4. Verás:
   - Performance score (0-100)
   - Tiempo de recuperación necesario
   - Fortalezas y debilidades
   - Sugerencias de mejora
   - Comparación con tus promedios

**API Endpoint:**
```bash
POST /api/health/workout-analysis/{workoutId}
```

### 4. Configurar Tu API Key de OpenAI

1. Ve a "Configuración"
2. Sección "OpenAI API Key"
3. Ingresa tu clave
4. Guarda

Ahora todos tus análisis usarán TU clave en lugar de la global.

**API Endpoint:**
```bash
PUT /api/settings/openai-key
{
  "apiKey": "sk-tu-clave-aqui"
}
```

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

# Solo postgres
docker-compose logs -f postgres
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend

# Reconstruir y reiniciar
docker-compose up --build -d
```

### Detener/Iniciar

```bash
# Detener
docker-compose down

# Iniciar
docker-compose up -d

# Detener y eliminar TODOS los datos (CUIDADO)
docker-compose down -v
```

### Backup de Base de Datos

```bash
# Crear backup
docker exec zepp-postgres pg_dump -U zepp_user zepp_health > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20250120.sql | docker exec -i zepp-postgres psql -U zepp_user -d zepp_health
```

---

## 🔒 Seguridad Adicional

### Firewall (UFW)

```bash
# Instalar UFW
sudo apt install ufw -y

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

### Fail2Ban (Protección contra brute force)

```bash
# Instalar
sudo apt install fail2ban -y

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📈 Monitoreo

### Ver Uso de Recursos

```bash
# CPU y RAM de containers
docker stats

# Espacio en disco
df -h

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 ¡Listo!

Tu aplicación ahora está:
- ✅ Corriendo en producción
- ✅ Accesible desde cualquier dispositivo
- ✅ Con SSL/HTTPS configurado
- ✅ Con todas las nuevas funcionalidades
- ✅ Respaldada por Docker

**URLs:**
- Frontend: https://nodumstudio.com
- API Backend: https://nodumstudio.com/api
- Health Check: https://nodumstudio.com/api/health

---

## 🆘 Solución de Problemas

### Error: "Container unhealthy"

```bash
# Ver logs del container problemático
docker-compose logs backend

# Reiniciar
docker-compose restart backend
```

### Error: "Database connection failed"

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Reiniciar postgres
docker-compose restart postgres

# Esperar 10 segundos y reiniciar backend
sleep 10 && docker-compose restart backend
```

### Error: "Port already in use"

```bash
# Ver qué está usando el puerto 3000
sudo lsof -i :3000

# Matar el proceso
sudo kill -9 <PID>

# O cambiar puerto en .env
FRONTEND_PORT=3002
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica `.env` esté bien configurado
3. Asegúrate de que todos los containers estén "healthy"
4. Reinicia: `docker-compose restart`

¡Disfruta de tu dashboard de salud mejorado! 🚀💪🧠
