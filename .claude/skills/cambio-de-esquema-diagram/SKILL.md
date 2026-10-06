---
name: cambio-de-esquema-diagram
description: Pasos obligatorios para cambiar el esquema Zod del diagram de la jugada sin romper las jugadas ya guardadas (subir schemaVersion, migración y tests).
---

# Cambiar el esquema del diagram

Archivos: `packages/shared/src/diagram/diagram.schema.ts` y `migrations.ts`.

1. Decide si el cambio es compatible. Añadir un campo opcional no rompe nada; renombrar, borrar, cambiar un tipo o volver obligatorio un campo sí rompe.
2. Si rompe:
   - Sube `DIAGRAM_SCHEMA_VERSION` (por ejemplo, de 1 a 2).
   - Añade en `migrations` la entrada con la versión de origen: `1: (d) => ({ ...d, schemaVersion: 2, ... })`.
   - Añade en `diagram.schema.spec.ts` un test que parte de un diagram v1 real y comprueba el resultado de `migrateDiagram`.
3. Actualiza `createEmptyDiagram()` si hace falta.
4. Ejecuta `pnpm --filter @playbook/shared test` y `pnpm typecheck` en la raíz: el editor y la API deben compilar con el tipo nuevo.
5. Pide una revisión al agente `diagram-guardian`.

La API migra cada jugada al leerla (migración perezosa) y la guarda migrada en la siguiente edición; no hace falta un script de migración masiva.
