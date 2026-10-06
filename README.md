# PlayBook Pro

Plataforma web para que un coach de fútbol americano diseñe, anime y enseñe sus jugadas.

## Estructura

| Carpeta           | Qué contiene                                                      |
| ----------------- | ----------------------------------------------------------------- |
| `apps/api`        | Backend NestJS (MongoDB con Mongoose)                             |
| `apps/web`        | Frontend React + Vite + Tailwind                                  |
| `packages/shared` | Código común: esquema Zod del diagram, enums, ids UUIDv7, medidas |

## Requisitos

- Node 22 o superior (`.nvmrc`)
- pnpm 10 (`corepack enable` lo activa con la versión correcta)
- Docker, para MongoDB en local

## Arrancar en local

```bash
corepack enable
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d mongo   # MongoDB 7 como replica set
pnpm dev                     # api en :3000 y web en :5173
```

Abre http://localhost:5173. La pantalla debe decir "API: conectada".

## Comandos

| Comando          | Qué hace                              |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Levanta api y web en modo desarrollo  |
| `pnpm build`     | Compila todo                          |
| `pnpm test`      | Tests unitarios de todos los paquetes |
| `pnpm lint`      | Lint (oxlint; prohíbe `any`)          |
| `pnpm typecheck` | Comprobación de tipos                 |
| `pnpm format`    | Formatea con Prettier                 |
