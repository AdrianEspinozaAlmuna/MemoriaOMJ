<!-- El CSS se aplica desde docs/pdf-style.css -->

<div class="cover-page">

# Manual de Usuario

<div class="subtitle">Plataforma OMJ Curicó</div>

**Sistema de Gestión de Actividades Juveniles**

Versión 1.0 — 2026

<div class="meta">
Oficina Municipal de Juventudes<br>
Ilustre Municipalidad de Curicó
</div>

</div>

<div class="toc">

## Índice

1. [Introducción](#1-introducción)
2. [Requisitos técnicos](#2-requisitos-técnicos)
 3. [Funcionalidades comunes](#3-funcionalidades-comunes)
    - 3.1. Registro e inicio de sesión
    - 3.2. Navegación general
    - 3.3. Dashboard del participante
    - 3.4. Calendario de actividades
    - 3.5. Detalle de actividad
    - 3.6. Notificaciones
 4. [Rol: Participante](#4-rol-participante)
    - 4.1. Inscripción en actividades
    - 4.2. Proponer una actividad
    - 4.3. Mis actividades
    - 4.4. Control de asistencia
    - 4.5. Chat en actividades
    - 4.6. Valoración de actividades
    - 4.7. Grupos
 5. [Rol: Administrador](#5-rol-administrador)
    - 5.1. Panel de administración
    - 5.2. Gestión de actividades
    - 5.3. Edición con snapshot
    - 5.4. Calendario del administrador
    - 5.5. Gestión de usuarios
    - 5.6. Gestión de salas
    - 5.7. Gestión de imágenes
    - 5.8. Gestión de grupos
    - 5.9. Reportes generales
    - 5.10. Notificaciones broadcast
 6. [Apéndice: Solución de problemas](#6-apéndice-solución-de-problemas)
    - 6.1. Funcionamiento offline (PWA)

</div>

<div class="page-break"></div>

## 1. Introducción

La Plataforma OMJ Curicó es un sistema web progresivo (PWA) diseñado para la **gestión de actividades juveniles** de la Oficina Municipal de Juventudes. Permite a los jóvenes inscribirse en actividades, registrar asistencia, participar en chats y valorar las experiencias. A los administradores les brinda herramientas para crear, aprobar y supervisar actividades, gestionar usuarios y generar reportes.

### 1.1 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| <span class="tag tag-participante">Participante</span> | Usuario general que puede inscribirse en actividades, registar asistencia, participar en chats y valorar |
| <span class="tag tag-admin">Administrador</span> | Encargado de gestionar actividades, usuarios, salas, reportes y notificaciones del sistema |

### 1.2 Acceso a la plataforma

La plataforma está disponible como aplicación web progresiva (PWA). Puede accederse desde cualquier navegador moderno o instalarse como aplicación en el dispositivo móvil o escritorio.

> 💡 **Tip:** En dispositivos móviles, al abrir la plataforma en Chrome o Safari, selecciona "Agregar a pantalla de inicio" para instalarla como una app nativa.

---

## 2. Requisitos técnicos

| Requisito | Especificación |
|-----------|---------------|
| Navegador | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Dispositivo | Computador, tablet o teléfono con acceso a internet |
| Conexión | Mínimo 1 Mbps (funciona con conexiones lentas) |
| JavaScript | Debe estar habilitado |
| Almacenamiento | 50 MB libres para caché PWA |

### 2.1 Instalación como aplicación (PWA)

La plataforma se puede instalar como una aplicación en el dispositivo para acceder sin necesidad de abrir el navegador cada vez.

#### Android (Chrome)

| Paso | Acción |
|------|--------|
| 1 | Abre la plataforma en Chrome |
| 2 | Presiona el ícono de menú (⋮) en la esquina superior derecha |
| 3 | Selecciona **"Agregar a pantalla de inicio"** |
| 4 | Confirma presionando **"Agregar"** |

La aplicación aparecerá en la pantalla de inicio con un ícono propio.

#### iOS (Safari)

| Paso | Acción |
|------|--------|
| 1 | Abre la plataforma en Safari |
| 2 | Presiona el ícono de **Compartir** (📤) en la barra inferior |
| 3 | Desplázate hacia abajo y selecciona **"Agregar a pantalla de inicio"** |
| 4 | Escribe un nombre para la aplicación y presiona **"Agregar"** |

#### Escritorio (Chrome / Edge)

| Paso | Acción |
|------|--------|
| 1 | Abre la plataforma en Chrome o Edge |
| 2 | Haz clic en el ícono de **instalación** (➕) en la barra de direcciones |
| 3 | Confirma presionando **"Instalar"** |

> 💡 **Tip:** La aplicación instalada funciona sin la barra de direcciones del navegador, tiene su propia ventana y puede notificarte como una app nativa.

<div class="page-break"></div>

## 3. Funcionalidades comunes

### 3.1 Registro e inicio de sesión

#### Registro de nuevo usuario

1. Desde la pantalla de inicio, haz clic en **"Registrarse"**.
2. Completa el formulario con tus datos personales:

   | Campo | Descripción |
   |-------|-------------|
   | RUT | Sin puntos ni guión (ej. 123456789) |
   | Nombre | Nombre real |
   | Apellido | Apellido real |
   | Correo electrónico | Correo válido |
   | Teléfono | Número de contacto (opcional) |
   | Contraseña | Mínimo 10 caracteres, debe incluir mayúscula, minúscula, número y símbolo |

3. Acepta los términos y haz clic en **"Registrarse"**.
4. Una vez registrado, serás redirigido al inicio de sesión.

> ⚠️ **Importante:** La contraseña debe cumplir con todos los requisitos de seguridad. Si falta algún elemento, el sistema mostrará un mensaje indicando qué corregir.

#### Inicio de sesión

1. Ingresa tu **correo electrónico** y **contraseña**.
2. Haz clic en **"Iniciar sesión"**.
3. Serás redirigido a tu panel principal según tu rol.

> 💡 **Tip:** Si olvidaste tu contraseña, contacta al administrador del sistema para restablecerla.

### 3.2 Navegación general

La plataforma cuenta con un **menú superior** que se adapta al rol del usuario:

| Elemento | Descripción |
|----------|-------------|
| 🏠 **Inicio** | Pantalla principal con información general |
| 📅 **Calendario** | Vista de actividades por mes/semana |
| 🔔 **Notificaciones** | Centro de alertas y notificaciones |
| 👤 **Menú usuario** | Acceso a perfil, mis actividades y cerrar sesión |

En dispositivos móviles, el menú se contrae en un ícono de hamburguesa (☰) para optimizar el espacio.

### 3.3 Dashboard del participante

Al iniciar sesión como participante, la pantalla principal muestra un **dashboard** con información resumida:

| Elemento | Descripción |
|----------|-------------|
| **Actividades inscritas** | Número de actividades en las que estás participando |
| **Próximas actividades** | Lista de las actividades más cercanas en el tiempo |
| **Enlaces rápidos** | Accesos directos a calendario, mis actividades y grupos |

> 💡 **Tip:** El dashboard es el punto de partida ideal para revisar tu agenda del día y acceder rápidamente a las funcionalidades más usadas.

### 3.4 Calendario de actividades

El calendario muestra todas las actividades disponibles en el mes seleccionado.

**Funcionalidades:**

- **Navegación entre meses**: Usa los botones "Mes anterior" y "Mes siguiente".
- **Vista por día**: Haz clic en un día para ver el detalle de actividades.
- **Vista mensual/semanal**: Alterna entre ambas vistas con el selector correspondiente.
- **Filtros**: Puedes filtrar por categoría y estado de la actividad.

> 💡 **Tip:** Los días con actividades se muestran con un borde resaltado. Al hacer clic en un día, se abre un panel con el detalle de actividades programadas.

### 3.5 Detalle de actividad

Al hacer clic en una actividad desde el calendario o desde la lista de actividades, accedes a la **vista de detalle**. Esta pantalla concentra toda la información relevante:

**Sección de información general:**

| Elemento | Descripción |
|----------|-------------|
| Título y descripción | Nombre y detalles de la actividad |
| Tipo | Categoría (Taller, Charla, Deporte, etc.) |
| Sala y ubicación | Lugar donde se realiza |
| Fecha y horario | Día y hora de inicio/término |
| Estado | Pendiente, Programada, En curso, Finalizada, Cancelada |
| Cupos | Cantidad de inscritos y capacidad máxima |
| Encargado | Persona que creó la actividad |

**Sección de participantes:**

Muestra la lista de usuarios inscritos en la actividad, incluyendo el rol de cada uno (participante o encargado).

**Sección de chat:**

Si la actividad tiene el chat habilitado, los participantes pueden comunicarse en tiempo real.

**Sección de valoraciones (actividades finalizadas):**

Una vez que la actividad ha terminado, los participantes pueden calificarla con estrellas del 1 al 5.

> 💡 **Tip:** Desde la vista de detalle también puedes inscribirte, marcar asistencia, cancelar inscripción o acceder al chat, dependiendo del estado de la actividad y tu rol.

### 3.6 Notificaciones

El sistema de notificaciones mantiene al usuario informado sobre eventos importantes.

**Tipos de notificaciones:**

| Tipo | Descripción | Color |
|------|-------------|-------|
| Actividad | Cambios en actividades, aprobaciones, inscripciones | Verde |
| Sistema | Avisos generales de la plataforma | Rojo |

**Funcionalidades:**

- **Badge de notificaciones**: Un círculo rojo en la campana indica la cantidad de notificaciones no leídas.
- **Centro de notificaciones**: Haz clic en la campana para ver las últimas notificaciones.
- **Marcar como leídas**: Haz clic en una notificación para marcarla como leída, o usa "Marcar todas como leídas".
- **Filtros**: Puedes filtrar entre "Todas", "Actividad" y "Sistema".

> 💡 **Tip:** Las notificaciones se actualizan en tiempo real. Si estás en la plataforma y ocurre un evento, la notificación aparece sin necesidad de recargar la página.

<div class="page-break"></div>

## 4. Rol: Participante

### 4.1 Inscripción en actividades

1. Desde el **Calendario** o la lista de **Actividades disponibles**, localiza la actividad de tu interés.
2. Haz clic en la actividad para ver su detalle.
3. En la pantalla de detalle, revisa la información:

   - Título y descripción
   - Fecha y horario
   - Sala o ubicación
   - Capacidad y cupos disponibles
   - Estado de la actividad

4. Si la actividad está disponible y tiene cupos, haz clic en **"Inscribirse"**.
5. La inscripción se confirma inmediatamente y recibirás una notificación.

> ⚠️ **Importante:** No puedes inscribirte si la actividad está llena, no está aprobada o ya ha finalizado. El sistema mostrará un mensaje claro en cada caso.

> 💡 **Tip:** El **encargado** de la actividad es la persona que la creó. Puede gestionar participantes, editar la actividad y registrar asistencias, pero no es necesariamente un Administrador del sistema.

#### Cancelar inscripción

1. Ve a **"Mis actividades"**.
2. Busca la actividad inscrita.
3. Haz clic en **"Cancelar inscripción"**.

### 4.2 Proponer una actividad

Los participantes pueden proponer nuevas actividades desde el calendario. La propuesta queda pendiente de aprobación por un administrador.

1. Ve al **Calendario** y selecciona un día **futuro** (no se puede proponer en días pasados).
2. En el panel que se abre, haz clic en **"Proponer Actividad"**.
3. Completa el formulario con los datos de la actividad:

   | Campo | Descripción |
   |-------|-------------|
   | Título | Nombre de la actividad |
   | Descripción | Detalles y contenido |
   | Tipo | Categoría (Taller, Charla, Deporte, etc.) |
   | Sala | Espacio físico donde se realiza |
   | Fecha | Pre-seleccionada del calendario |
   | Hora inicio | Horario de inicio |
   | Hora término | Horario de término |
   | Cupo máximo | Límite de participantes |

4. Haz clic en **"Crear actividad"**.
5. La actividad quedará con estado **"Pendiente"** y los administradores recibirán una notificación para revisarla.
6. Una vez aprobada, la actividad aparecerá en el calendario y estará disponible para inscripciones.

> ⚠️ **Importante:** Las actividades propuestas por participantes deben ser aprobadas por un administrador antes de estar disponibles. Recibirás una notificación cuando sea aprobada o rechazada.

### 4.3 Mis actividades

La sección **"Mis actividades"** muestra un resumen de todas tus actividades:

| Sección | Descripción |
|---------|-------------|
| **Participando** | Actividades en las que estás inscrito actualmente |
| **Creadas por mí** | Actividades que has creado (si aplica) |
| **Próximas** | Actividades futuras en las que participarás |
| **Completadas** | Actividades finalizadas |

Cada actividad muestra su estado, fecha, horario y un acceso directo al detalle.

### 4.4 Control de asistencia

1. Durante el horario de la actividad, accede al **detalle de la actividad**.
2. Haz clic en **"Marcar asistencia"**.
3. La asistencia queda registrada y recibirás una notificación de confirmación.

> ⚠️ **Importante:** Solo puedes marcar asistencia cuando la actividad está **"En curso"**. No es posible marcar asistencia antes del inicio ni después de finalizada la actividad.

### 4.5 Chat en actividades

Las actividades pueden incluir un sistema de chat para comunicarse con los participantes y encargados.

1. Accede al **detalle de la actividad**.
2. Desplázate hasta la sección de **Chat**.
3. Escribe tu mensaje y presiona **Enviar**.

> ⚠️ **Importante:** Si el chat es **unidireccional**, solo los encargados y administradores pueden enviar mensajes. Los participantes pueden leer pero no escribir.

### 4.6 Valoración de actividades

Una vez que la actividad ha finalizado, puedes valorarla:

1. Accede al **detalle de la actividad finalizada**.
2. En la sección de **Valoraciones**, selecciona de 1 a 5 estrellas.
3. Haz clic en **"Guardar valoración"**.
4. Puedes cambiar tu valoración en cualquier momento.

> 💡 **Tip:** Las valoraciones ayudan a otros usuarios a conocer la calidad de las actividades y permiten a los administradores mejorar la oferta.

### 4.7 Grupos

Los grupos permiten organizar a los usuarios para actividades conjuntas.

#### Crear un grupo

1. Ve a **"Grupos"** en el menú.
2. Haz clic en **"Crear grupo"**.
3. Asigna un nombre y descripción al grupo.
4. Invita a otros participantes buscándolos por nombre o correo.

#### Unirse a un grupo

1. Solicita al líder del grupo que te agregue.
2. El líder te invitará desde la gestión de miembros del grupo.

> 💡 **Tip:** Solo el líder del grupo puede agregar o eliminar miembros. Los participantes no pueden invitar administradores al grupo.

<div class="page-break"></div>

## 5. Rol: Administrador

### 5.1 Panel de administración

El panel de administración es el centro de control del sistema. Desde aquí puedes acceder a todas las funcionalidades administrativas.

**Acceso al panel:**

1. Inicia sesión con una cuenta de administrador.
2. El menú mostrará opciones adicionales de administración.
3. Los elementos del panel son:

| Elemento | Descripción |
|----------|-------------|
| 📊 **Dashboard** | Resumen de métricas y estadísticas |
| 📋 **Actividades** | Gestión completa de actividades |
| 👥 **Usuarios** | Administración de cuentas de usuario |
| 🏢 **Salas** | Gestión de espacios físicos |
| 👨‍👩‍👧‍👦 **Grupos** | Administración de grupos |
| 📈 **Reportes** | Generación de reportes y análisis |
| 🔔 **Notificaciones** | Envío de notificaciones broadcast |
| ✅ **Aprobaciones** | Revisión y aprobación de actividades |

### 5.2 Gestión de actividades

#### Crear una actividad

1. Ve a **"Actividades"** → **"Crear actividad"**.
2. Completa el formulario con los datos de la actividad:

   | Campo | Descripción |
   |-------|-------------|
   | Título | Nombre de la actividad |
   | Descripción | Detalles y contenido |
   | Tipo | Categoría (Taller, Charla, Deporte, etc.) |
   | Sala | Espacio físico donde se realiza |
   | Fecha | Día de la actividad |
   | Hora inicio | Horario de inicio |
   | Hora término | Horario de término |
   | Cupo máximo | Límite de participantes |
   | Chat bidireccional | Permite mensajes de participantes |

3. Opcionalmente, puedes **asociar grupos** para inscribir automáticamente a sus miembros.
4. Haz clic en **"Crear actividad"**.

> 💡 **Tip:** Si creas la actividad como administrador, se aprueba automáticamente. Si la crea un participante, queda pendiente de aprobación.

#### Aprobar o rechazar actividades

1. Ve a **"Aprobaciones"** en el panel.
2. Revisa las actividades pendientes.
3. Para cada actividad, puedes:

   - **Aprobar**: La actividad se programa y queda disponible para inscripciones.
   - **Rechazar**: La actividad se rechaza y el creador recibe una notificación con el motivo.

#### Editar una actividad

1. Ve a **"Actividades"** y selecciona la actividad a editar.
2. Haz clic en **"Editar"**.
3. Modifica los campos necesarios.
4. Guarda los cambios.

> ⚠️ **Importante:** No puedes editar actividades que ya han finalizado o están canceladas.

#### Cancelar una actividad

1. Ve al detalle de la actividad.
2. Haz clic en **"Cancelar actividad"**.
3. Confirma la cancelación.
4. Los participantes inscritos recibirán una notificación.

### 5.3 Edición con snapshot

Cuando un encargado o administrador **edita una actividad**, el sistema guarda automáticamente una copia de seguridad (snapshot) de los datos originales. Este mecanismo permite restaurar la información si la edición es rechazada.

**Flujo de edición con revisión:**

1. El encargado accede a la actividad y hace clic en **"Editar"**.
2. Modifica los campos necesarios (título, fecha, horario, sala, cupo, etc.).
3. Guarda los cambios.
4. El sistema almacena un **snapshot** con los valores originales.
5. La actividad queda marcada con **"Edición pendiente"**.
6. Un administrador revisa los cambios desde el panel de **Aprobaciones**.

**Opciones del administrador:**

| Acción | Resultado |
|--------|-----------|
| **Aprobar** | Los cambios se aplican definitivamente. El snapshot se elimina. Todos los participantes reciben una notificación. |
| **Rechazar** | Los datos originales se restauran desde el snapshot. El snapshot se elimina. El encargado recibe una notificación con el motivo. |

> ⚠️ **Importante:** No se puede editar una actividad que ya está **finalizada** o **cancelada**. Tampoco se puede reducir el cupo máximo por debajo de la cantidad actual de inscritos.

### 5.4 Calendario del administrador

El administrador tiene acceso a su propia vista de calendario, similar a la del participante pero con funcionalidades adicionales.

**Acceso:** Panel → **Calendario**

**Funcionalidades adicionales:**

- **Ver todas las actividades**: Tanto aprobadas como pendientes, de todos los encargados.
- **Crear actividad desde el calendario**: Selecciona un día y crea una actividad directamente.
- **Filtros por estado**: Filtra por actividades pendientes, programadas, en curso o finalizadas.
- **Vista mensual y semanal**: Alterna entre ambas vistas para una mejor planificación.

> 💡 **Tip:** El calendario del administrador muestra las actividades de toda la plataforma, no solo las propias. Es útil para supervisar la ocupación de salas y la distribución de actividades.

### 5.5 Gestión de usuarios

1. Ve a **"Usuarios"** en el panel.
2. Aquí puedes:

   - **Ver listado**: Todos los usuarios registrados con su rol y estado.
   - **Buscar**: Filtra por nombre, correo o RUT.
   - **Activar/Desactivar**: Habilita o deshabilita el acceso de un usuario.
   - **Cambiar rol**: Asigna rol de participante o administrador.

> ⚠️ **Importante:** Solo un administrador puede cambiar el rol de otro usuario. Los cambios de rol se aplican inmediatamente.

### 5.6 Gestión de salas

1. Ve a **"Salas"** en el panel.
2. Aquí puedes:

   - **Crear sala**: Registra una nueva sala con nombre y capacidad.
   - **Editar sala**: Modifica nombre, capacidad o estado.
   - **Deshabilitar sala**: Impide que se asignen actividades a una sala.

| Campo | Descripción |
|-------|-------------|
| Nombre | Identificador de la sala |
| Capacidad | Número máximo de personas |
| Estado | Habilitada o deshabilitada |

### 5.7 Gestión de imágenes

Los administradores pueden gestionar las imágenes asociadas a los tipos de actividad (Taller, Charla, Deporte, etc.). Estas imágenes se muestran en las tarjetas de actividades y en el calendario.

**Acceso:** Panel → **Imágenes**

**Funcionalidades:**

| Acción | Descripción |
|--------|-------------|
| **Ver imágenes** | Listado de todos los tipos de actividad con su imagen actual |
| **Subir imagen** | Selecciona un archivo de imagen desde el dispositivo |
| **Cambiar imagen** | Reemplaza la imagen de un tipo de actividad existente |
| **Eliminar imagen** | Restablece la imagen por defecto del tipo |

> 💡 **Tip:** Las imágenes se almacenan en el servidor y se muestran en las tarjetas de actividades del calendario y la lista de actividades. Se recomienda usar imágenes cuadradas de al menos 200x200 píxeles.

### 5.8 Gestión de grupos

1. Ve a **"Grupos"** en el panel.
2. Las funciones administrativas incluyen:

   - **Ver todos los grupos**: Listado completo de grupos creados.
   - **Editar grupo**: Modificar nombre, descripción o líder.
   - **Administrar miembros**: Agregar o eliminar participantes.
   - **Eliminar grupo**: Solo si es necesario.

> 💡 **Tip:** Los administradores pueden gestionar cualquier grupo, no solo los que lideran.

### 5.9 Reportes generales

1. Ve a **"Reportes"** en el panel.
2. Selecciona un **período**:

   | Período | Descripción |
   |---------|-------------|
   | Esta semana | Actividades de la semana actual |
   | Este mes | Actividades del mes actual |
   | Personalizado | Rango de fechas específico |

3. Haz clic en **"Generar reporte"**.

**El reporte incluye:**

- **KPIs principales**: Total actividades, promedio inscritos, ocupación media, valoración media.
- **Gráficos**: Inscritos por mes, salas más usadas, distribución por estado.
- **Tabla detallada**: Listado completo de actividades con filtros por nombre, categoría y estado.

> 💡 **Tip:** Puedes exportar los datos de la tabla usando los filtros de búsqueda para encontrar actividades específicas.

### 5.10 Notificaciones broadcast

1. Ve a **"Notificaciones"** en el panel.
2. Haz clic en **"Publicar aviso"**.
3. Completa el formulario:

   | Campo | Descripción |
   |-------|-------------|
   | Título | Asunto de la notificación |
   | Mensaje | Contenido del aviso |

4. Haz clic en **"Publicar"**.
5. La notificación será recibida por **todos los usuarios activos** de la plataforma.

> 💡 **Tip:** Las notificaciones broadcast son ideales para anuncios generales, cambios en la programación o recordatorios importantes.

<div class="page-break"></div>

## 6. Apéndice: Solución de problemas

### Problemas comunes

| Problema | Causa posible | Solución |
|----------|---------------|----------|
| No puedo iniciar sesión | Contraseña incorrecta | Verifica que el correo y contraseña sean correctos. Si persiste, contacta al administrador. |
| No veo actividades disponibles | Filtros activos | Revisa los filtros de categoría y estado en el calendario. |
| No puedo inscribirme | Actividad llena o no aprobada | Revisa el estado de la actividad. Si está llena, busca otra disponible. |
| No aparece el badge de notificaciones | Sin notificaciones no leídas | El badge solo muestra notificaciones pendientes de leer. |
| La página no carga correctamente | Conexión o caché | Actualiza la página (F5). Si persiste, limpia la caché del navegador. |
| No puedo marcar asistencia | Actividad no iniciada | Solo puedes marcar asistencia cuando la actividad está "En curso". |
| El calendario se ve desordenado | Pantalla pequeña | Desliza horizontalmente para ver todos los días. |

### 6.1 Funcionamiento offline (PWA)

Al ser una aplicación web progresiva, la plataforma almacena en **caché local** las páginas que has visitado. Esto permite cierto grado de funcionamiento sin conexión a internet.

**¿Qué funciona sin conexión?**

- Las páginas ya visitadas se cargan desde la caché.
- La interfaz general de la aplicación sigue visible.

**¿Qué NO funciona sin conexión?**

- Inscripción en actividades.
- Marcación de asistencia.
- Envío de mensajes en el chat.
- Creación o edición de actividades.
- Notificaciones en tiempo real.
- Visualización de datos actualizados.

> 💡 **Tip:** Si la conexión se restablece, las funcionalidades vuelven a la normalidad automáticamente. No es necesario reiniciar la aplicación.

### Contacto de soporte

Para problemas técnicos no resueltos en esta guía, contacta al administrador del sistema a través de los canales oficiales de la OMJ Curicó.

---

<div style="text-align: center; margin-top: 60px; color: #6a8a78; font-size: 10pt;">
Documentación generada para la Plataforma OMJ Curicó<br>
Oficina Municipal de Juventudes — Ilustre Municipalidad de Curicó<br>
Versión 1.0 — 2026
</div>
