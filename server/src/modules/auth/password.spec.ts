import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('acepta la contraseña correcta y rechaza la incorrecta', async () => {
    const hash = await hashPassword('touchdown-2026');

    await expect(verifyPassword('touchdown-2026', hash)).resolves.toBe(true);
    await expect(verifyPassword('touchdown-2027', hash)).resolves.toBe(false);
  });

  it('nunca guarda la contraseña y usa un salt distinto cada vez', async () => {
    const first = await hashPassword('touchdown-2026');
    const second = await hashPassword('touchdown-2026');

    expect(first).not.toContain('touchdown-2026');
    expect(first).not.toBe(second);
  });

  it('rechaza un hash con formato desconocido en lugar de lanzar error', async () => {
    await expect(verifyPassword('touchdown-2026', 'no-es-un-hash')).resolves.toBe(false);
    await expect(verifyPassword('touchdown-2026', 'scrypt$x$y$z$a$b')).resolves.toBe(false);
  });
});
