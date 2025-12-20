# 🎯 LEE ESTO PRIMERO

## 🚀 INICIO RÁPIDO (1 minuto)

### Opción 1: Script Automático (Recomendado)

```bash
cd "/Users/sebastien/Desktop/Zepp app ai"
./COMANDOS_PARA_INICIAR.sh
```

### Opción 2: Comandos Manuales

```bash
cd "/Users/sebastien/Desktop/Zepp app ai"
cp .env.example .env
nano .env  # Edita: POSTGRES_PASSWORD, JWT_SECRET, OPENAI_API_KEY
docker-compose up --build -d
```

### Abre tu navegador:
```
http://localhost:3000
```

---

## ✨ NUEVAS FUNCIONALIDADES (Mejoradas)

### 🔮 1. Predicciones de Salud
**Te dice si te puedes enfermar pronto**
- Analiza 30 días de datos
- Detecta riesgos cardiovasculares, respiratorios, fatiga
- Recomendaciones preventivas

### 💪 2. Análisis Avanzado de Ejercicios
**Te dice cómo mejorar cada entrenamiento**
- Performance score (0-100)
- Qué mejorar específicamente
- Tiempo de recuperación necesario
- Comparación con tus promedios

### 📝 3. Check-ins Diarios (Estilo Whoop)
**Preguntas diarias para mejor análisis**
- ¿Cómo dormiste?
- ¿Cómo te sientes?
- Nivel de energía, ánimo, estrés
- Mejora las predicciones de IA

### ⚙️ 4. Tu Propia API Key de OpenAI
**Usa tu clave si quieres**
- Control de costos
- Privacidad
- Opcional (puedes usar la global)

---

## 📚 DOCUMENTACIÓN

### Para Desarrollo Local:
- **`MEJORAS_Y_COMO_INICIAR.md`** ← Todo sobre las nuevas funcionalidades
- **`INSTRUCCIONES_COMPLETAS.md`** ← Guía paso a paso detallada
- **`README.md`** ← Documentación técnica completa

### Para Instalar en VPS:
- **`GUIA_INSTALACION_VPS.md`** ← Desplegar en nodumstudio.com

---

## ⚙️ CONFIGURACIÓN MÍNIMA REQUERIDA

Edita `.env` y cambia estas 3 líneas:

```env
POSTGRES_PASSWORD=cambia_esto_ahora
JWT_SECRET=string_aleatorio_muy_largo_aqui
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui
```

---

## 🎯 PRIMEROS PASOS

1. ✅ Iniciar la app (script o comandos)
2. ✅ Abrir http://localhost:3000
3. ✅ Registrarte con tus credenciales de Zepp
4. ✅ Sincronizar datos (botón "Sincronizar")
5. ✅ Hacer tu primer check-in diario
6. ✅ Generar predicción de salud (después de 7 días)
7. ✅ Analizar un workout con IA

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Ver estado
docker-compose ps
```

---

## 🌐 Para Instalar en VPS

Lee: **`GUIA_INSTALACION_VPS.md`**

Resumen:
1. SSH a tu VPS
2. Instalar Docker
3. Clonar proyecto
4. Configurar .env con tu dominio
5. docker-compose up -d
6. Configurar Nginx + SSL

---

## 🆘 Si Algo No Funciona

```bash
# Ver logs del problema
docker-compose logs -f backend

# Reiniciar todo
docker-compose restart

# Empezar de cero (CUIDADO: borra datos)
docker-compose down -v
docker-compose up --build -d
```

---

## 🎉 ¡Listo!

Tu app tiene ahora:
- ✅ Predicciones de salud con IA
- ✅ Análisis avanzado de ejercicios
- ✅ Check-ins diarios
- ✅ API key personal
- ✅ Docker Compose optimizado
- ✅ Listo para VPS/producción

**¿Qué esperas? ¡Iníciala ahora!** 🚀

```bash
./COMANDOS_PARA_INICIAR.sh
```
