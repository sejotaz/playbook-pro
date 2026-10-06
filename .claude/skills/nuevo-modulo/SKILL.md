---
name: nuevo-modulo
description: Checklist y plantilla para crear un módulo NestJS nuevo en apps/api con las convenciones de PlayBook Pro (UUIDv7, teamId, DTOs, Swagger, tests).
---

# Crear un módulo NestJS

Ruta: `apps/api/src/modules/<nombre>/`

```
<nombre>.module.ts
<nombre>.controller.ts
<nombre>.service.ts
<nombre>.service.spec.ts
schemas/<entidad>.schema.ts
dto/create-<entidad>.dto.ts
dto/update-<entidad>.dto.ts
```

## Checklist

- [ ] Schema con `@Prop(UUID_ID) _id!: string;`, referencias `type: String`, `timestamps: true`, `collection` explícito.
- [ ] Índices compuestos con `teamId` primero.
- [ ] Controller bajo `teams/:teamId/<recurso>` con `JwtAuthGuard` y `TeamAccessGuard`. Parámetros de id validados como UUIDv7.
- [ ] Cada método del service recibe `teamId` y lo incluye en el filtro de la consulta.
- [ ] DTOs con class-validator y `@ApiProperty`. Respuestas tipadas, sin `any`.
- [ ] Imports relativos con extensión `.js` (la API es ESM).
- [ ] Módulo registrado en `app.module.ts`.
- [ ] Tests: service unitario y e2e que verifica que otro equipo recibe 404.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` en verde.
