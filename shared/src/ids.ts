import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

/** Todos los ids del sistema son UUIDv7 guardados como string. */
export const UuidSchema = z.uuid({ version: 'v7' });
export type Uuid = z.infer<typeof UuidSchema>;

/** Genera un id nuevo. Sirve igual en el navegador y en Node. */
export function newId(): Uuid {
  return uuidv7();
}
