#!/bin/bash

# ========================================
# SCRIPT DE INICIO - Zepp Health AI App
# ========================================

echo "🚀 Iniciando Zepp Health AI Application..."
echo ""

# Ir al directorio del proyecto
cd "/Users/sebastien/Desktop/Zepp app ai"

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Copiando .env.example a .env..."
    cp .env.example .env
    echo ""
    echo "⚙️  IMPORTANTE: Edita el archivo .env y configura:"
    echo "   - POSTGRES_PASSWORD (contraseña segura)"
    echo "   - JWT_SECRET (string aleatorio largo)"
    echo "   - OPENAI_API_KEY (tu clave de OpenAI)"
    echo ""
    echo "Comando: nano .env"
    echo ""
    echo "Cuando termines, ejecuta este script de nuevo."
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    echo "Por favor, inicia Docker Desktop y ejecuta este script de nuevo."
    exit 1
fi

echo "✅ Docker está corriendo"
echo ""

# Detener containers existentes si los hay
echo "🛑 Deteniendo containers existentes (si los hay)..."
docker-compose down 2>/dev/null

echo ""
echo "🏗️  Construyendo e iniciando servicios..."
echo "⏳ Esto puede tomar 3-5 minutos la primera vez..."
echo ""

# Iniciar servicios
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo ""
echo "⏳ Esperando a que los servicios estén listos..."
echo ""

# Esperar 30 segundos
for i in {30..1}; do
    echo -ne "Esperando... $i segundos\r"
    sleep 1
done

echo ""
echo ""

# Verificar estado de containers
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo ""

# Verificar health checks
echo "🏥 Verificando health checks..."
sleep 10

BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' zepp-backend 2>/dev/null || echo "starting")
FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' zepp-frontend 2>/dev/null || echo "starting")
POSTGRES_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' zepp-postgres 2>/dev/null || echo "starting")

echo "   PostgreSQL: $POSTGRES_HEALTH"
echo "   Backend:    $BACKEND_HEALTH"
echo "   Frontend:   $FRONTEND_HEALTH"
echo ""

if [ "$BACKEND_HEALTH" = "healthy" ] && [ "$FRONTEND_HEALTH" = "healthy" ]; then
    echo "✅ ¡Todos los servicios están listos!"
else
    echo "⚠️  Los servicios están iniciando..."
    echo "   Esto puede tomar 1-2 minutos más."
    echo ""
    echo "   Ver logs: docker-compose logs -f"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 ¡Aplicación Iniciada!"
echo ""
echo "📱 URLs disponibles:"
echo "   Frontend:     http://localhost:3000"
echo "   API Backend:  http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs:     docker-compose logs -f"
echo "   Reiniciar:    docker-compose restart"
echo "   Detener:      docker-compose down"
echo ""
echo "📚 Documentación:"
echo "   - MEJORAS_Y_COMO_INICIAR.md"
echo "   - GUIA_INSTALACION_VPS.md"
echo "   - README.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Preguntar si quiere ver los logs
read -p "¿Quieres ver los logs en tiempo real? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    docker-compose logs -f
fi
