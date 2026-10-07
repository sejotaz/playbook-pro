import { z } from 'zod';

/**
 * Variables de entorno de la API. Se validan al arrancar: si falta alguna o tiene
 * un valor incorrecto, la API no arranca y el error dice cuál es.
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
  MONGODB_URI: z
    .string({ error: 'falta la URI de MongoDB' })
    .regex(/^mongodb(\+srv)?:\/\//, 'debe empezar por mongodb:// o mongodb+srv://'),
  // Nombre de la base de datos. Va aparte de la URI para que nunca se use por descuido
  // la base "test", que es la que elige Mongo cuando la URI no trae nombre.
  MONGODB_DB_NAME: z.string().min(1).default('playbookpro'),
  // Opcional. Servidores DNS separados por comas (p. ej. "1.1.1.1,8.8.8.8"). Solo hace falta si
  // Node no logra resolver la dirección mongodb+srv de Atlas (error "querySrv ECONNREFUSED").
  DNS_SERVERS: z
    .string()
    .transform((value) => value.split(',').map((server) => server.trim()))
    .pipe(z.array(z.union([z.ipv4(), z.ipv6()])).min(1))
    .optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
