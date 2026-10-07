import { validateEnv } from './env.schema.js';

const MONGODB_URI = 'mongodb://localhost:27017/?replicaSet=rs0';

describe('validateEnv', () => {
  it('aplica los valores por defecto', () => {
    expect(validateEnv({ MONGODB_URI })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: 'http://localhost:5173',
      MONGODB_URI,
      MONGODB_DB_NAME: 'playbookpro',
    });
  });

  it('convierte PORT a número', () => {
    expect(validateEnv({ MONGODB_URI, PORT: '4000' }).PORT).toBe(4000);
  });

  it('falla con un valor inválido y nombra la variable', () => {
    expect(() => validateEnv({ MONGODB_URI, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('falla si falta MONGODB_URI', () => {
    expect(() => validateEnv({})).toThrow(/MONGODB_URI/);
  });

  it('convierte DNS_SERVERS en una lista y rechaza lo que no sea una IP', () => {
    expect(validateEnv({ MONGODB_URI, DNS_SERVERS: '1.1.1.1, 8.8.8.8' }).DNS_SERVERS).toEqual([
      '1.1.1.1',
      '8.8.8.8',
    ]);
    expect(() => validateEnv({ MONGODB_URI, DNS_SERVERS: 'mi-router' })).toThrow(/DNS_SERVERS/);
  });

  it('acepta una URI de Atlas y rechaza una que no es de MongoDB', () => {
    const atlas = 'mongodb+srv://user:pass@cluster0.example.mongodb.net/';
    expect(validateEnv({ MONGODB_URI: atlas }).MONGODB_URI).toBe(atlas);
    expect(() => validateEnv({ MONGODB_URI: 'http://localhost:27017' })).toThrow(/MONGODB_URI/);
  });
});
