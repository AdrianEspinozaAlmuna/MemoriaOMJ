# Tests — OMJ Curicó

Suite de pruebas automatizadas para la plataforma OMJ, con 3 niveles: unitarias, caja negra e integracion.

## Stack

| Nivel | Framework | Base de datos | Entorno |
|-------|-----------|---------------|---------|
| Unitarias | Vitest | Ninguna (logica pura) | Node |
| Caja negra (PCN) | Jest + Supertest | PostgreSQL real | Node |
| Integracion (PI) | Jest + Supertest | PostgreSQL real | Node |

## Estructura

```
tests/
  package.json              # dependencias y scripts
  vitest.config.mjs          # config Vitest (unitarias)
  jest.config.js             # config Jest (caja negra + integracion)
  jest.setup.js              # carga .env del backend
  run-ordered.ps1            # ejecuta unitarias ordenadas por iteracion
  helpers/
    factories.js             # creacion de datos de prueba (usuarios, actividades, etc.)
  unitarias/
    iteracion-1/             # PU-01 a PU-03: auth + fechas + login
    iteracion-2/             # PU-04 a PU-05: topes horarios, reglas actividad
    iteracion-3/             # PU-06 a PU-07: chat, valoraciones
    iteracion-4/             # PU-08 a PU-10: snapshot, cambios, notificaciones
    iteracion-5/             # PU-11 a PU-12: estados UI, grupos
    iteracion-6/             # PU-13 a PU-14: horarios, reportes
  blackbox/
    pcn01.test.js a pcn09.test.js   # 9 pruebas de caja negra
  integration/
    pi01.test.js a pi06.test.js     # 6 pruebas de integracion
```

## Requisitos

- Node.js 18 o superior
- Base de datos PostgreSQL (Neon o Supabase) configurada en `Backend/.env` como `DATABASE_URL`
- Dependencias instaladas: `cd tests && npm install`

## Comandos

```bash
# Unitarias (Vitest) — no requieren BD
npm test                  # todas las unitarias
npm run test:ordered      # unitarias en orden por iteracion (para informe)

# Por iteracion:
npm run test:it1          # iteracion 1 — auth + fechas
npm run test:it2          # iteracion 2 — actividades
npm run test:it3          # iteracion 3 — chat + valoraciones
npm run test:it4          # iteracion 4 — notificaciones
npm run test:it5          # iteracion 5 — grupos + estados
npm run test:it6          # iteracion 6 — reportes

# Caja negra (Jest + Supertest) — requieren BD
npm run test:blackbox     # PCN-01 a PCN-09

# Integracion (Jest + Supertest) — requieren BD
npm run test:integration  # PI-01 a PI-06

# Todas juntas
npm run test:e2e          # caja negra + integracion
```

## Pruebas unitarias (PU-01 a PU-14)

### Iteracion 1 — Autenticacion e interfaces

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-01 | `passwordRules.test.js` | `validateStrongPassword` | corta, sin mayuscula, sin numero, valida |
| PU-02 | `dateTime.test.js` | `parseDateForChile`, `formatDateForChile`, `parseLocalDateString` | fecha normal, cambio de mes, bug UTC, locale CL |
| PU-03 | `validateLoginFields.test.js` | `validateLoginFields` | email vacio, password vacio, ambos presentes |

### Iteracion 2 — Actividades

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-04 | `timeOverlap.test.js` | `hasTimeOverlap` | cruzado, consecutivo, contenido, identico |
| PU-05 | `actividades.test.js` | `canEnroll`, `isInCourse`, `canCancel`, `validateCapacity` | 12 casos |

### Iteracion 3 — Chat y valoraciones

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-06 | `chatMessages.test.js` | `isValidMessage`, `canMessageInActivity` | texto normal, vacio, null, limite, estado cancelada |
| PU-07 | `ratingValidation.test.js` | `validateRating` | 0, 6, 1, 3, 5 |

### Iteracion 4 — Notificaciones

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-08 | `snapshot.test.js` | `buildActivityRevisionSnapshot`, `restoreActivityRevisionSnapshot` | cambio nombre, horario, sala, restauracion completa |
| PU-09 | `buildChangesList.test.js` | `buildChangesList` | cambio simple, multiple, sin cambios, nulos |
| PU-10 | `notificaciones.test.js` | snapshot + changes para notificaciones | datos formateados |

### Iteracion 5 — Usuarios y grupos

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-11 | `statusMapping.test.js` | `mapEstadoToUi`, `toUiActivity`, `getActivityStatusMeta` | 8 casos |
| PU-12 | `groups.test.js` | `isGroupLeader` | coincide, distinto, string |

### Iteracion 6 — Reportes

| Codigo | Archivo | Funcion | Casos |
|--------|---------|---------|-------|
| PU-13 | `activityTime.test.js` | `timeStringToDate`, `toTimeLabel` | 5 casos |
| PU-14 | `reports.test.js` | `computeAttendanceRate` | 100%, 50%, 0%, vacio |

## Pruebas de caja negra (PCN-01 a PCN-09)

| Codigo | Endpoint | Escenario | Resultado |
|--------|----------|-----------|-----------|
| PCN-01 | `GET /api/dashboard/stats` | Participante accede a ruta admin | `403` |
| PCN-02 | `POST /api/activities` | Crear actividad con fecha | fecha persistida |
| PCN-03 | `POST /api/activities/:id/enroll` | Actividad con cupo completo | `400` |
| PCN-04 | `PATCH /api/activities/:id/attendance` | Actividad no iniciada | `400` |
| PCN-05 | `POST /api/activities/:id/messages` | Chat unilateral como participante | `403` |
| PCN-06 | `GET /api/dashboard/stats` | Admin solicita reporte | `200` + datos |
| PCN-07 | `PATCH /api/activities/:id/request-edit` | Actividad finalizada | `400` |
| PCN-08 | `DELETE /api/groups/:id/members` | Miembro elimina a otro | `403` |
| PCN-09 | `PATCH /api/activities/:id/request-edit` | Reducir cupo bajo inscritos | `400` |

## Pruebas de integracion (PI-01 a PI-06)

| Codigo | Flujo | Validaciones |
|--------|-------|--------------|
| PI-01 | Ciclo completo: crear → aprobar → inscribir → asistir | Estados, persistencia, notificaciones |
| PI-02 | Edicion rechazada: editar → rechazar → restaurar | Snapshot existe, rollback correcto |
| PI-03 | Grupos en actividad: crear actividad con grupo | Miembros inscritos, sin duplicados |
| PI-04 | Cancelacion: cancelar actividad con participantes | Estado cancelada, bloqueo nuevas inscripciones |
| PI-05 | Edicion aprobada: editar → aprobar | Persistencia, snapshot eliminado |
| PI-06 | Finalizacion + valoracion: finalizar → valorar | Estado finalizada, rating persistido |

## Base de datos

Las pruebas de caja negra e integracion requieren una base de datos PostgreSQL configurada en `Backend/.env` como `DATABASE_URL`. El schema se sincroniza automaticamente con `prisma db push` al ejecutar las pruebas.

Para usar una base de datos separada para testing, definir `TEST_DATABASE_URL` en el entorno (sobrescribe `DATABASE_URL`).

## Resumen

| Tipo | Tests | Archivos | Framework |
|------|-------|----------|-----------|
| Unitarias | 71 | 14 | Vitest |
| Caja negra | 12 | 9 | Jest + Supertest |
| Integracion | 20 | 6 | Jest + Supertest |
| **Total** | **103** | **29** | |
