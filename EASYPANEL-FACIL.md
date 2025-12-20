# 🚀 INSTALACIÓN EN EASYPANEL - LA FORMA MÁS FÁCIL

## ¿Git o sin Git? Te lo explico simple:

### ✅ CON GIT (Recomendado - 2 minutos)
EasyPanel se encarga de TODO automáticamente:
- ✅ Descarga el código solo
- ✅ Construye las imágenes Docker solo
- ✅ Inicia los servicios solo
- ✅ **Tú solo configuras 3 variables**

### ❌ SIN GIT (Más complicado)
Tendrías que:
- ❌ Subir manualmente todos los archivos a EasyPanel
- ❌ O construir las imágenes Docker tú mismo
- ❌ O subirlas a Docker Hub primero
- ❌ **Más pasos, más complicado**

---

## 🎯 MÉTODO RECOMENDADO: Con Git (super simple)

### Paso 1: Haz Fork del repositorio (1 clic)

1. Ve a: https://github.com/saubinaud/zepp-health-ai
2. Haz clic en el botón **"Fork"** arriba a la derecha
3. ¡Listo! Ahora tienes tu propia copia

**NO necesitas saber Git, solo hacer 1 clic en Fork**

---

### Paso 2: Conectar en EasyPanel (1 minuto)

1. Abre tu panel de **EasyPanel**
2. Ve a **Projects** → **New Project**
3. Selecciona **"From Git Repository"**
4. Conecta tu cuenta de GitHub (1 clic)
5. Selecciona el repositorio **zepp-health-ai** que forkeaste
6. EasyPanel detecta automáticamente el `docker-compose.yml`
7. Clic en **"Continue"** o **"Next"**

---

### Paso 3: Configurar Variables (2 minutos)

En la sección **Environment Variables**, pega esto:

```env
# ⚠️ OBLIGATORIAS - Cambia estos valores:

POSTGRES_PASSWORD=MiPasswordSegura2024!
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

**Donde conseguir cada una:**

1. **POSTGRES_PASSWORD**: Inventa una contraseña segura cualquiera
2. **JWT_SECRET**: Ve a https://www.uuidgenerator.net/ y copia el UUID que aparece
3. **OPENAI_API_KEY**: Ve a https://platform.openai.com/api-keys y crea una nueva

---

### Paso 4: Deploy (1 clic)

1. Haz clic en **"Deploy"** o **"Create"**
2. Espera 3-5 minutos (EasyPanel hace todo automáticamente)
3. ¡Listo! ✅

---

## 🌐 ¿Cómo accedo a mi aplicación?

EasyPanel te asignará automáticamente una URL como:
- **Frontend**: `https://tu-proyecto.easypanel.app`
- **Backend**: `https://tu-proyecto-api.easypanel.app`

O puedes configurar tu propio dominio en **Settings** → **Domains**

---

## 🎮 Primer Uso

1. Abre la URL del frontend en tu navegador
2. Haz clic en **"Regístrate"**
3. Ingresa:
   - **Email y contraseña**: Crea una nueva cuenta para la app
   - **Zepp Email y Password**: Tu email y contraseña de Zepp Life
4. ¡La app comenzará a sincronizar tus datos automáticamente! 🎉

---

## 📊 Resumen: ¿Por qué con Git es más fácil?

| Paso | Con Git | Sin Git |
|------|---------|---------|
| **1. Obtener código** | 1 clic (Fork) | Descargar ZIP y subir manualmente |
| **2. Configurar** | EasyPanel lo hace todo | Configurar build manualmente |
| **3. Deploy** | 1 clic | Múltiples pasos |
| **4. Actualizaciones** | 1 clic (Pull) | Re-subir todo manualmente |
| **Tiempo total** | ⏱️ **2-5 minutos** | ⏱️ 30-60 minutos |

---

## 🆘 Ayuda: "No sé qué es Fork ni Git"

¡No importa! Aquí está lo que necesitas:

### ¿Qué es Fork?
Es como hacer una **copia** del proyecto en tu cuenta de GitHub. Un solo clic.

### ¿Necesito instalar Git en mi computadora?
**NO**. Todo se hace desde el navegador.

### ¿Necesito saber comandos de Git?
**NO**. EasyPanel se encarga de todo.

### Paso a paso con imágenes:

1. **Fork (Copiar el proyecto)**
   - Ve a: https://github.com/saubinaud/zepp-health-ai
   - Arriba a la derecha verás un botón **"Fork"**
   - Haz clic → Listo, ya tienes tu copia

2. **Conectar en EasyPanel**
   - En EasyPanel → New Project → From Git
   - Conecta GitHub (te pedirá permiso, dale "Allow")
   - Selecciona "zepp-health-ai" de la lista
   - Siguiente

3. **Variables de entorno**
   - Copia y pega las 3 variables
   - Cambia los valores como te indiqué arriba

4. **Deploy**
   - Un clic en Deploy
   - ¡Espera y listo!

---

## 💰 ¿Cuánto cuesta?

- **GitHub**: GRATIS
- **EasyPanel**: Depende de tu plan (desde $5/mes)
- **OpenAI API**: Pay-as-you-go (aprox $0.01-0.10 por análisis)

---

## 🐛 Problemas Comunes

### "No tengo cuenta de GitHub"
**Solución**: Créala gratis en https://github.com/signup (toma 2 minutos)

### "EasyPanel no detecta el docker-compose.yml"
**Solución**: Asegúrate de seleccionar la rama `main` o `master`

### "Error al hacer build"
**Solución**: Verifica que las 3 variables obligatorias estén configuradas

---

## 📞 ¿Necesitas ayuda?

1. Revisa los logs en EasyPanel → Tu servicio → Logs
2. Abre un issue en: https://github.com/saubinaud/zepp-health-ai/issues
3. Describe el problema y pega los logs

---

## ✅ Checklist Final

- [ ] Hice Fork del repositorio en GitHub
- [ ] Conecté el repositorio en EasyPanel
- [ ] Configuré las 3 variables obligatorias
- [ ] Hice Deploy
- [ ] Los servicios están corriendo (3 servicios: postgres, backend, frontend)
- [ ] Puedo acceder al frontend
- [ ] Me registré con mis credenciales de Zepp
- [ ] ¡Mis datos están sincronizando! 🎉

---

**¡Eso es todo! Simple, ¿verdad?** 😊

No necesitas ser programador ni saber Git. Solo:
1. Fork (1 clic)
2. Conectar en EasyPanel (1 clic)
3. Pegar 3 variables (copy/paste)
4. Deploy (1 clic)

**Total: 4 clics y 5 minutos** ⏱️
