#!/bin/bash

# ============================================
# ZEPP HEALTH AI - SCRIPT DE INICIO RÁPIDO
# ============================================
# Este script te ayuda a configurar y ejecutar
# la aplicación de forma rápida y sencilla
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   ZEPP HEALTH AI - INSTALACIÓN RÁPIDA     ║"
echo "║   Dashboard con Análisis de IA             ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Docker
echo -e "${BLUE}[1/6]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Por favor instala Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    echo "Por favor instala Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker está instalado${NC}"

# Verificar si ya existe .env
echo -e "\n${BLUE}[2/6]${NC} Configurando variables de entorno..."

if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  El archivo .env ya existe${NC}"
    read -p "¿Deseas sobrescribirlo? (s/N): " overwrite
    if [[ ! $overwrite =~ ^[Ss]$ ]]; then
        echo -e "${GREEN}✅ Usando .env existente${NC}"
    else
        rm .env
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado desde .env.example${NC}"
    fi
else
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado desde .env.example${NC}"
fi

# Solicitar configuración
echo -e "\n${BLUE}[3/6]${NC} Configuración de variables obligatorias..."
echo -e "${YELLOW}Necesitas configurar 3 variables importantes:${NC}"

# OpenAI API Key
echo -e "\n${YELLOW}1. OPENAI_API_KEY${NC}"
echo "   Consigue tu API key en: https://platform.openai.com/api-keys"
read -p "   Ingresa tu API Key de OpenAI: " openai_key

if [ -z "$openai_key" ]; then
    echo -e "${RED}❌ La API Key de OpenAI es obligatoria${NC}"
    exit 1
fi

# PostgreSQL Password
echo -e "\n${YELLOW}2. POSTGRES_PASSWORD${NC}"
echo "   Contraseña para la base de datos PostgreSQL"
read -sp "   Ingresa una contraseña segura: " postgres_pass
echo

if [ -z "$postgres_pass" ]; then
    echo -e "${RED}❌ La contraseña de PostgreSQL es obligatoria${NC}"
    exit 1
fi

# JWT Secret
echo -e "\n${YELLOW}3. JWT_SECRET${NC}"
echo "   Secret para autenticación JWT (se generará automáticamente)"
jwt_secret=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "cambiar-este-secret-por-uno-aleatorio-$(date +%s)")

# Actualizar .env
echo -e "\n${BLUE}[4/6]${NC} Actualizando archivo .env..."

sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$openai_key|g" .env
sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$postgres_pass|g" .env
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|g" .env
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://zepp_user:$postgres_pass@postgres:5432/zepp_health|g" .env

rm -f .env.bak

echo -e "${GREEN}✅ Variables configuradas correctamente${NC}"

# Configuración opcional
echo -e "\n${BLUE}¿Deseas configurar opciones avanzadas?${NC} (N/s)"
read -p "URLs personalizadas, modelo de OpenAI, etc.: " advanced

if [[ $advanced =~ ^[Ss]$ ]]; then
    echo -e "\n${YELLOW}Modelo de OpenAI (actual: gpt-4-turbo-preview)${NC}"
    echo "1. gpt-4-turbo-preview (más preciso, más caro)"
    echo "2. gpt-3.5-turbo (más rápido, más barato)"
    read -p "Selecciona (1/2) [1]: " model_choice

    if [ "$model_choice" == "2" ]; then
        sed -i.bak "s|OPENAI_MODEL=.*|OPENAI_MODEL=gpt-3.5-turbo|g" .env
        echo -e "${GREEN}✅ Modelo cambiado a gpt-3.5-turbo${NC}"
    fi

    rm -f .env.bak
fi

# Construir e iniciar
echo -e "\n${BLUE}[5/6]${NC} Construyendo e iniciando servicios..."
echo -e "${YELLOW}Esto puede tardar 3-5 minutos la primera vez...${NC}"

docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo -e "\n${BLUE}[6/6]${NC} Esperando a que los servicios estén listos..."

max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose ps | grep -q "Up"; then
        # Verificar que el backend esté respondiendo
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            break
        fi
    fi

    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

echo ""

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Los servicios están iniciando pero pueden no estar completamente listos${NC}"
    echo -e "${YELLOW}   Revisa los logs con: docker-compose logs -f${NC}"
else
    echo -e "${GREEN}✅ Servicios iniciados correctamente${NC}"
fi

# Resumen
echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ INSTALACIÓN COMPLETADA           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📊 Accede a la aplicación:${NC}"
echo -e "   ${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "   ${GREEN}Backend:${NC}  http://localhost:3001"

echo -e "\n${BLUE}📝 Próximos pasos:${NC}"
echo "   1. Abre http://localhost:3000 en tu navegador"
echo "   2. Haz clic en 'Regístrate'"
echo "   3. Ingresa tus credenciales de Zepp Life"
echo "   4. ¡Disfruta de tu dashboard con IA!"

echo -e "\n${BLUE}📚 Comandos útiles:${NC}"
echo -e "   ${YELLOW}Ver logs:${NC}        docker-compose logs -f"
echo -e "   ${YELLOW}Detener:${NC}         docker-compose down"
echo -e "   ${YELLOW}Reiniciar:${NC}       docker-compose restart"
echo -e "   ${YELLOW}Estado:${NC}          docker-compose ps"

echo -e "\n${BLUE}💡 Documentación completa:${NC} Ver INSTALL.md"

echo -e "\n${GREEN}¡Disfruta monitoreando tu salud con IA! 🚀💪${NC}\n"
