# Plataforma OMJ

Plataforma OMJ para gestion de actividades juveniles, con arquitectura separada en Frontend (React + Vite + PWA) y Backend (Node.js + Express + Prisma).

## Estructura

- Backend: API REST, autenticacion, Prisma ORM.
- Frontend: interfaz React, rutas y soporte PWA.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalacion

Instala dependencias por separado en cada proyecto.

1. Backend

	cd Backend
	npm install

2. Frontend

	cd Frontend
	npm install

## Comandos de desarrollo

Ejecuta Backend y Frontend en terminales separadas.

1. Backend en modo desarrollo

	cd Backend
	npm run dev

2. Frontend en modo desarrollo

	cd Frontend
	npm run dev

## Comandos de build

### Frontend

Genera la carpeta de produccion con Vite.

	cd Frontend
	npm run build

Para previsualizar el build localmente:

	cd Frontend
	npm run preview

### Backend

El Backend no tiene paso de compilacion (no usa TypeScript). Para produccion:

	cd Backend
	npm run start

## Prisma (Backend)

Comandos disponibles:

	cd Backend
	npm run prisma:generate
	npm run prisma:migrate
	npm run prisma:seed

## PWA: como se actualiza

La app ya tiene Service Worker registrado y chequeo de actualizaciones cada 5 minutos desde Frontend/src/main.jsx.

Ademas, el cache se versiona en Frontend/public/sw.js con la constante CACHE_NAME.

### Flujo recomendado para publicar una nueva version PWA

1. Cambia la version del cache en Frontend/public/sw.js.
   Ejemplo: memoria-cache-v2 a memoria-cache-v3.

2. Genera el nuevo build del frontend.

	cd Frontend
	npm run build

3. Despliega los archivos actualizados de Frontend/dist junto con Frontend/public/sw.js y manifest.json en tu hosting.

4. Los clientes detectaran nueva version por dos mecanismos:
   - El navegador descarga el nuevo service worker al detectar cambios.
   - La app ejecuta registration.update() cada 5 minutos.

5. Cuando el nuevo worker se activa, la app fuerza recarga para tomar la nueva version.

### Importante: por que a veces no se actualiza al hacer solo npm run build

- npm run build solo genera archivos nuevos en Frontend/dist.
- La app instalada no cambia hasta que esos archivos se despliegan en el servidor donde esta instalada la PWA.
- Si pruebas en local, debes servir el build (npm run preview) o desplegarlo; no basta con compilar.

### Checklist rapido cuando no actualiza

1. Verifica que desplegaste la nueva carpeta dist y el nuevo sw.js.
2. Cambia CACHE_NAME en Frontend/public/sw.js para invalidar cache vieja.
3. Abre DevTools > Application > Service Workers y pulsa Update.
4. Si sigue igual, Unregister SW y vuelve a abrir la app.

## Notas de estilos

- Se usa un archivo global de variables en Frontend/src/styles.css.
- Cada vista/componente principal usa CSS independiente:
  - Frontend/src/styles/home.css
  - Frontend/src/styles/login.css
  - Frontend/src/styles/register.css
  - Frontend/src/styles/navbar.css
