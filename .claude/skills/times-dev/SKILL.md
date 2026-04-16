---
name: times-dev
description: Comandos operativos del monorepo (dev server, Prisma, tests, seeds, build, Docker). Úsala cuando el usuario pida "levantar", "correr", "ejecutar", "build", "migrar", "seed", "probar en local", "Docker", "deploy", "puerto", "reiniciar".
---

# Comandos dev — Gestion_Calidad

Monorepo Turborepo + pnpm workspaces. Todo se ejecuta desde la raíz `c:/dev/Gestion_Calidad` salvo indicación contraria.

## Dev server

```bash
# Todo (frontend + backend en paralelo)
cd c:/dev/Gestion_Calidad && pnpm dev

# Solo backend
cd c:/dev/Gestion_Calidad && pnpm --filter backend dev

# Solo frontend
cd c:/dev/Gestion_Calidad && pnpm --filter frontend dev
```

**Puertos** (según commits recientes):
- Frontend: `3001` (ver `ea1ae81 fix(docker): actualizar etiquetas de exportación de imágenes y puerto del frontend`)
- Backend: revisar `apps/backend/.env` o `main.ts` antes de asumir.

**Rutas clave para probar:**
- `http://localhost:3001/times-management` — panel de tiempos (tabs)
- `http://localhost:3001/times-management/configuracion` — config movida
- `http://localhost:3001/times-management/extensions` — proveedores y proyectos
- `http://localhost:3001/times-management/summary` — resumen
- `http://localhost:3001/portal-profesor` — portal profesor (auth propia)

## Prisma

```bash
# Regenerar cliente tras cambiar schema
cd c:/dev/Gestion_Calidad/packages/database && pnpm prisma generate

# Push de schema a Mongo (NO es migrate, es directo — solo local/dev)
cd c:/dev/Gestion_Calidad/packages/database && pnpm prisma db push

# Studio visual
cd c:/dev/Gestion_Calidad/packages/database && pnpm prisma studio
```

**⚠️ Reglas Prisma**:
- MongoDB no tiene `migrate dev`. Cambios estructurales se propagan con `db push`.
- **Nunca correr `db push` contra producción sin confirmación explícita de Franko.**
- Schema vive en `packages/database/prisma/schema/` (split en archivos por dominio).

## Seeds y utilidades

Scripts existentes en `packages/database/`:
- `seed-ciclo3.ts`
- `seed-ciclo3-fix.ts`
- `fix-allocation.ts`

Ejecutar con:
```bash
cd c:/dev/Gestion_Calidad/packages/database && npx tsx <script>.ts
```

**No correr scripts contra datos reales sin confirmación.** Si Franko pide "seed", confirmar primero si es dev local o staging.

## Tests

```bash
# Todos los tests backend
cd c:/dev/Gestion_Calidad/apps/backend && pnpm test

# Un módulo específico
cd c:/dev/Gestion_Calidad/apps/backend && pnpm test --testPathPattern=cohorts

# Con coverage HTML
cd c:/dev/Gestion_Calidad/apps/backend && pnpm test:cov
# Abre coverage/lcov-report/index.html
```

Para generar specs estructurados: usar slash command `/gestion-calidad-testing`.

## Build

```bash
# Monorepo completo
cd c:/dev/Gestion_Calidad && pnpm build

# Solo uno
cd c:/dev/Gestion_Calidad && pnpm --filter backend build
cd c:/dev/Gestion_Calidad && pnpm --filter frontend build
```

**Turborepo cachea.** Si algo "no cambia", probar `pnpm build --force`.

## Lint y tipos

```bash
cd c:/dev/Gestion_Calidad && pnpm lint
cd c:/dev/Gestion_Calidad && pnpm typecheck  # si existe en package.json
```

## Docker y deploy

Scripts en raíz:
- `build-and-deploy.sh`
- `deploy.sh`
- `docker-compose.yml`
- `traefik/` (reverse proxy)

**No ejecutar scripts de deploy sin confirmación.** Ángel despliega desde `develop` — no pisar ese flujo.

## Troubleshooting rápido

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Frontend no levanta | Puerto 3001 ocupado | `netstat -ano \| findstr :3001` y matar proceso |
| Backend no conecta a Mongo | `.env` sin `DATABASE_URL` | Revisar `apps/backend/.env` |
| Cambio de schema no se refleja | No regeneraste cliente | `pnpm prisma generate` |
| Tests fallan con "Cannot find module @modules/..." | Path aliases rotos | Revisar `tsconfig.json` y `jest.config.json` |
| Pagina blanca en portal-profesor | Falta token/cédula en storage | Limpiar localStorage y re-ingresar |

## Regla general

**Antes de ejecutar comandos destructivos** (`rm`, `db push --force-reset`, `git reset --hard`, scripts de migración), **siempre confirma con Franko**. El costo de preguntar es bajo; el costo de borrar datos de Erick en producción es catastrófico.
