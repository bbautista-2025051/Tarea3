# Guia de ejecucion (Windows / PowerShell)

Guia paso a paso para levantar el proyecto desde cero, incluyendo los
problemas mas comunes que pueden aparecer en Windows y como resolverlos.

---

## Paso 0: Requisitos previos

| Herramienta | Version minima | Como verificar |
|---|---|---|
| Node.js | v22.22.3 / v24.15.0 / v26.0.0 | `node --version` |
| pnpm | cualquiera reciente | `pnpm --version` |
| PostgreSQL | 14+ | ver Paso 2 |

> ⚠️ Angular 22 (usado en el frontend) exige Node.js **v22.22.3 o superior**
> (o v24.15.0+, o v26+). Si tienes una version menor, `pnpm build` fallara
> con un mensaje claro pidiendo actualizar. Descarga la LTS mas reciente en
> https://nodejs.org y reinstala.

---

## Paso 1: Instalar dependencias

Desde la carpeta raiz del proyecto:

```powershell
pnpm install
```

### Posible problema: `[ERR_PNPM_IGNORED_BUILDS]`

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @parcel/watcher, esbuild, lmdb, msgpackr-extract
```

pnpm 10+ bloquea por seguridad los scripts de instalacion de dependencias
nativas. Solucion:

```powershell
pnpm approve-builds
```

Marca todos los paquetes listados con **espacio** y confirma con **Enter**.
Luego repite `pnpm install`.

---

## Paso 2: Configurar PostgreSQL

### 2.1 Verificar que este instalado y encontrar su carpeta `bin`

```powershell
dir "C:\Program Files\PostgreSQL"
```

Esto muestra la version instalada (ej. `18`). Si no aparece nada, descarga
el instalador desde https://www.postgresql.org/download/windows/.

### 2.2 Posible problema: `psql no se reconoce como...`

`psql` no esta en el `PATH` de Windows. Dos opciones:

**A) Usar la ruta completa cada vez** (reemplaza `18` por tu version):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE aplicacion_clientes;"
```

**B) Agregarlo al PATH (recomendado, una sola vez):**

1. Busca "variables de entorno" en el menu de inicio.
2. "Editar las variables de entorno del sistema" → "Variables de entorno..."
3. En "Variables del sistema", edita `Path` → "Nuevo" → pega:
   `C:\Program Files\PostgreSQL\18\bin`
4. Acepta todo y **cierra y vuelve a abrir PowerShell**.
5. Verifica: `psql --version`

### 2.3 Posible problema: pide contraseña y no puedes escribirla

Es normal: PowerShell **no muestra nada en pantalla** mientras escribes una
contraseña (ni asteriscos). Escribe la contraseña completa igual y presiona
Enter, aunque no veas cambios.

Si no recuerdas la contraseña del usuario `postgres`, edita temporalmente
`C:\Program Files\PostgreSQL\18\data\pg_hba.conf`, cambia el metodo
`scram-sha-256` por `trust` en las lineas de `127.0.0.1/32`, reinicia el
servicio (`Restart-Service postgresql-x64-18`), entra sin contraseña,
cambia la contraseña con `ALTER USER postgres WITH PASSWORD 'nueva';`, y
**revierte** el `pg_hba.conf` a `scram-sha-256` al terminar.

### 2.4 Crear la base de datos y las tablas

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE aplicacion_clientes;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d aplicacion_clientes -f database/init.sql
```

(Ejecuta el segundo comando estando parado en la carpeta raiz del proyecto,
para que encuentre `database/init.sql`).

---

## Paso 3: Configurar variables de entorno del backend

```powershell
copy .env.example backend\.env
```

Edita `backend\.env` con los datos reales de tu PostgreSQL (usuario,
contraseña, host, puerto, nombre de la base).

---

## Paso 4: Compilar el proyecto

```powershell
pnpm build
```

### Posible problema: version de TypeScript incompatible

```
Error: The Angular Compiler requires TypeScript >=6.0.0 and <6.1.0 but 5.9.3 was found
```

En `frontend/package.json`, la dependencia `typescript` debe estar como
`"~6.0.0"` (no `^5.x`). Si tu copia del proyecto aun tiene la version vieja,
corrigela y vuelve a correr `pnpm install && pnpm build`.

### Posible problema: `TS2729: Property 'fb' is used before its initialization`

Ya corregido en el codigo entregado (se usa `inject()` en vez de inyeccion
por constructor en `cliente-form.component.ts`). Si ves este error es porque
tienes una copia anterior del archivo; reemplázalo por la version corregida.

---

## Paso 5: Ejecutar todo

```powershell
pnpm start
```

Esto levanta backend (`http://localhost:3000`) y frontend
(`http://localhost:4200`) al mismo tiempo, en una sola terminal.

### Posible problema: el backend no conecta a PostgreSQL

Si ves `No fue posible iniciar el servidor` en la consola, revisa:
- Que el servicio de PostgreSQL este corriendo: `Get-Service *postgres*`
  (debe decir `Running`).
- Que los datos en `backend\.env` sean correctos (usuario, contraseña,
  puerto 5432 por defecto).
- Que la base `aplicacion_clientes` exista (Paso 2.4).

### Posible problema: el frontend no puede llamar al backend (error CORS o de red)

- Confirma que el backend haya arrancado correctamente y muestre
  `Servidor backend escuchando en http://localhost:3000`.
- Verifica que `frontend/src/environments/environment.ts` apunte a
  `http://localhost:3000` (por defecto ya viene asi).

---

## Paso 6: Probar que todo funciona

Abre `http://localhost:4200` en el navegador: deberias ver el formulario y,
si corriste el script SQL con los datos de prueba, la tabla con 3 clientes
de ejemplo. Agrega un cliente nuevo y confirma que aparece en la tabla sin
recargar la pagina.

También puedes probar la API directamente:

```powershell
curl http://localhost:3000/clientes
```

---

## Resumen rapido (checklist)

- [ ] Node.js actualizado (v22.22.3+ / v24.15+ / v26+)
- [ ] `pnpm install` (con `pnpm approve-builds` si lo pide)
- [ ] PostgreSQL instalado y corriendo
- [ ] `psql` accesible (PATH o ruta completa)
- [ ] Base de datos creada con `database/init.sql`
- [ ] `backend\.env` configurado con credenciales correctas
- [ ] `pnpm build` sin errores
- [ ] `pnpm start` levanta ambos servidores
- [ ] `http://localhost:4200` funciona en el navegador
