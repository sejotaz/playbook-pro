import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// scrypt viene con Node (sin dependencias nativas) y es lento a propósito: aunque alguien
// robe la base de datos, probar contraseñas una a una le resulta muy caro.
const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

interface ScryptParams {
  cost: number;
  blockSize: number;
  parallelization: number;
}

function derive(password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      KEY_LENGTH,
      {
        N: params.cost,
        r: params.blockSize,
        p: params.parallelization,
        maxmem: 256 * params.cost * params.blockSize,
      },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/** Devuelve `scrypt$N$r$p$salt$hash`: los parámetros viajan con el hash para poder subirlos después. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
  });
  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, cost, blockSize, parallelization, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !cost || !blockSize || !parallelization || !salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, 'base64');
  try {
    const actual = await derive(password, Buffer.from(salt, 'base64'), {
      cost: Number(cost),
      blockSize: Number(blockSize),
      parallelization: Number(parallelization),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
