# Aplicacion de Administracion de Clientes

Monorepo (pnpm Workspaces) con backend en **Node.js + Express + TypeScript + PostgreSQL**
y frontend en **Angular (standalone components)**. La aplicacion permite unicamente
**agregar** y **listar** clientes (no incluye edicion ni eliminacion).

## Estructura del proyecto

```
aplicacion/
├── backend/                # API REST (Express + TypeScript + PostgreSQL)
│   ├── src/
│   │   ├── controllers/    # Traduce HTTP <-> logica de negocio
│   │   ├── modules/        # Logica de negocio y validaciones (clientes.service.ts)
│   │   ├── persistence/    # Acceso a datos: SQL + respaldo JSON
│   │   ├── routes/         # Definicion de endpoints
│   │   ├── database/       # Clase Database (pool de PostgreSQL)
│   │   ├── models/         # Mapeo snake_case -> camelCase
│   │   ├── interfaces/     # Tipos TypeScript
│   │   ├── middlewares/    # Manejo centralizado de errores
│   │   └── app.ts          # Punto de entrada del servidor
│   └── data/clientes.json  # Respaldo automatico de los clientes
├── frontend/                # Angular (standalone components)
│   └── src/app/
│       ├── cliente-form/    # Formulario reactivo para agregar clientes
│       ├── cliente-list/    # Tabla de clientes registrados
│       └── cliente.service.ts
├── database/init.sql        # Script SQL: base de datos + tabla + datos de prueba
├── pnpm-workspace.yaml
├── package.json              # Orquesta install/build/start de todo el monorepo
└── .env.example
```

## Requisitos previos

- Node.js 20 o superior
- pnpm instalado globalmente: `npm install -g pnpm` (o `corepack enable`)
- PostgreSQL 14 o superior corriendo localmente (o accesible por red)

No se utiliza npm ni yarn en ningun paso del proyecto.

## 1) Instalacion

Desde la carpeta raiz del proyecto (`aplicacion/`):

```
pnpm install
```

Este comando instala automaticamente las dependencias del backend y del frontend
gracias a pnpm Workspaces. No es necesario entrar a las carpetas `backend/` ni
`frontend/`.

## 2) Configuracion de variables de entorno

El backend necesita un archivo `.env` dentro de `backend/`. Copia el ejemplo
que esta en la raiz del proyecto:

```
cp .env.example backend/.env
```

Luego edita `backend/.env` con los datos de tu PostgreSQL local:

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=aplicacion_clientes
DB_USER=postgres
DB_PASSWORD=postgres
```

Nunca se escriben credenciales directamente en el codigo: todo se lee desde
estas variables de entorno mediante `dotenv`.

## 3) Creacion de la base de datos

El script `database/init.sql` contiene todo lo necesario: creacion de la base
de datos, la tabla `clientes` y datos de prueba opcionales.

Con `psql` disponible en tu maquina:

```
# 3.1 Crear la base de datos (ejecutar solo la primera linea del script,
# o manualmente):
psql -U postgres -h localhost -c "CREATE DATABASE aplicacion_clientes;"

# 3.2 Crear la tabla y cargar los datos de prueba dentro de esa base:
psql -U postgres -h localhost -d aplicacion_clientes -f database/init.sql
```

> Nota: `CREATE DATABASE` no puede ejecutarse dentro de la misma transaccion
> que otros comandos, por eso se recomienda ejecutarlo por separado antes de
> correr el resto del script contra la base ya creada.

La tabla `clientes` queda con las columnas en `snake_case`:

| Columna             | Tipo         |
|---------------------|--------------|
| id                  | SERIAL (PK)  |
| codigo_cliente      | VARCHAR(50) UNIQUE |
| nombre_cliente      | VARCHAR(150) |
| direccion_cliente   | VARCHAR(255) |
| telefono            | VARCHAR(20)  |
| creado_en           | TIMESTAMP    |

En el backend y frontend estos mismos campos se manejan en `camelCase`
(`codigoCliente`, `nombreCliente`, `direccionCliente`, `telefono`).

## 4) Compilar todo el proyecto

Desde la raiz:

```
pnpm build
```

Este unico comando compila:

- El backend TypeScript (`tsc`) hacia `backend/dist`.
- El frontend Angular (`ng build`) hacia `frontend/dist/frontend`.

## 5) Ejecutar todo el proyecto

Desde la raiz:

```
pnpm start
```

Este comando levanta **simultaneamente**, en una unica terminal (usando
`concurrently`):

- Backend en `http://localhost:3000`
- Frontend en `http://localhost:4200`

Al abrir `http://localhost:4200` en el navegador podras agregar clientes y
verlos reflejados automaticamente en la tabla, sin recargar la pagina.

## 6) Probar la API manualmente

Listar clientes:

```
curl http://localhost:3000/clientes
```

Agregar un cliente:

```
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "codigoCliente": "CLI-010",
    "nombreCliente": "Ana Torres",
    "direccionCliente": "Zona 9, Ciudad de Guatemala",
    "telefono": "502-4444-5555"
  }'
```

Respuestas:

- `GET /clientes` -> `200 OK` con `{ ok: true, data: Cliente[] }`
- `POST /clientes` -> `201 Created` con `{ ok: true, data: Cliente }`
- Errores de validacion -> `400 Bad Request`
- Codigo de cliente duplicado -> `409 Conflict`
- Rutas inexistentes -> `404 Not Found`
- Errores no controlados -> `500 Internal Server Error`

Todas las respuestas de error tienen el formato `{ ok: false, error: string }`.

## Respaldo en JSON

Cada vez que se crea un cliente, ademas de guardarse en PostgreSQL, el backend
sincroniza automaticamente el archivo `backend/src/data/clientes.json`
(en desarrollo) / `backend/dist/data/clientes.json` (una vez compilado) con el
listado completo de clientes, como respaldo adicional.

## Notas de arquitectura

- **Arquitectura por capas** en el backend: `routes -> controllers -> modules
  (logica de negocio) -> persistence (SQL) -> database (pool de PostgreSQL)`.
- **Clase `Database`** (patron singleton) es el unico punto de la aplicacion
  que administra el `Pool` de `pg`.
- **Validaciones** centralizadas en `modules/clientes.service.ts`: campos
  obligatorios, formato de telefono, codigo de cliente unico.
- **Manejo centralizado de errores** mediante `AppError` y el middleware
  `errorHandler`, con codigos HTTP correctos para cada caso.
- **Frontend**: solo dos componentes standalone (`cliente-form`,
  `cliente-list`), Reactive Forms, tipado estricto y `ClienteService` como
  unico punto de comunicacion HTTP (la URL base se configura en
  `frontend/src/environments/environment.ts`, nunca hardcodeada en los
  componentes).
