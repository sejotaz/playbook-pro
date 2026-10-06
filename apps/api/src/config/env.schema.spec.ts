import { validateEnv } from './env.schema.js';

describe('validateEnv', () => {
  it('aplica los valores por defecto', () => {
    expect(validateEnv({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: 'http://localhost:5173',
    });
  });

  it('convierte PORT a número', () => {
    expect(validateEnv({ PORT: '4000' }).PORT).toBe(4000);
  });

  it('falla con un valor inválido y nombra la variable', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
