import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import request, { type Response } from 'supertest';
import { createTestApp, type TestApp } from './create-test-app.js';

const PASSWORD = 'touchdown-2026';

interface AuthBody {
  accessToken: string;
  user: { id: string; email: string; name: string };
}

/** Devuelve la cookie del refresh token tal como la reenviaría el navegador (`nombre=valor`). */
function refreshCookie(response: Response): string {
  const header: unknown = response.headers['set-cookie'];
  const cookies = Array.isArray(header) ? header.map(String) : [];
  const cookie = cookies.find((value) => value.startsWith('refreshToken='));
  if (!cookie) {
    throw new Error('La respuesta no trae la cookie refreshToken');
  }
  return cookie;
}

describe('Auth (e2e)', () => {
  let testApp: TestApp;
  let emailCounter = 0;

  const http = () => request(testApp.app.getHttpServer());
  const newEmail = () => `coach${++emailCounter}@equipo.com`;
  const register = (email: string) =>
    http().post('/api/auth/register').send({ email, password: PASSWORD, name: 'Coach Taylor' });

  beforeAll(async () => {
    testApp = await createTestApp();
  }, 120_000);

  afterAll(async () => {
    await testApp?.close();
  });

  describe('POST /api/auth/register', () => {
    it('crea la cuenta, devuelve el access token y deja el refresh token en una cookie httpOnly', async () => {
      const email = newEmail();
      const response = await register(email).expect(201);
      const body = response.body as AuthBody;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.user).toEqual({ id: expect.any(String), email, name: 'Coach Taylor' });
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');

      const cookie = refreshCookie(response);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/api/auth');
    });

    it('guarda la contraseña y el refresh token como hash, nunca en claro', async () => {
      const email = newEmail();
      const response = await register(email).expect(201);
      const rawToken = refreshCookie(response).split(';')[0]?.split('=')[1];
      const connection = testApp.app.get<Connection>(getConnectionToken());

      const user = await connection.collection('users').findOne({ email });
      const tokens = await connection.collection('refreshTokens').find().toArray();

      expect(user?.passwordHash).toMatch(/^scrypt\$/);
      expect(JSON.stringify(user)).not.toContain(PASSWORD);
      expect(rawToken).toBeTruthy();
      expect(JSON.stringify(tokens)).not.toContain(rawToken);
    });

    it('rechaza un email repetido aunque cambien las mayúsculas', async () => {
      const email = newEmail();
      await register(email).expect(201);

      await register(email.toUpperCase()).expect(409);
    });

    it('rechaza datos inválidos y campos que el DTO no declara', async () => {
      await http()
        .post('/api/auth/register')
        .send({ email: 'no-es-un-email', password: PASSWORD, name: 'Coach' })
        .expect(400);
      await http()
        .post('/api/auth/register')
        .send({ email: newEmail(), password: 'corta', name: 'Coach' })
        .expect(400);
      await http()
        .post('/api/auth/register')
        .send({ email: newEmail(), password: PASSWORD, name: 'Coach', role: 'ADMIN' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('inicia sesión con las credenciales correctas', async () => {
      const email = newEmail();
      await register(email).expect(201);

      const response = await http()
        .post('/api/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      expect((response.body as AuthBody).user.email).toBe(email);
      expect(refreshCookie(response)).toContain('HttpOnly');
    });

    it('responde igual si falla la contraseña que si el email no existe', async () => {
      const email = newEmail();
      await register(email).expect(201);

      const wrongPassword = await http()
        .post('/api/auth/login')
        .send({ email, password: 'otra-clave-2026' })
        .expect(401);
      const unknownEmail = await http()
        .post('/api/auth/login')
        .send({ email: newEmail(), password: PASSWORD })
        .expect(401);

      expect(wrongPassword.body).toEqual(unknownEmail.body);
    });
  });

  describe('GET /api/auth/me', () => {
    it('exige un access token válido', async () => {
      await http().get('/api/auth/me').expect(401);
      await http().get('/api/auth/me').set('Authorization', 'Bearer no-es-un-token').expect(401);
    });

    it('devuelve el usuario de la sesión', async () => {
      const email = newEmail();
      const { accessToken } = (await register(email).expect(201)).body as AuthBody;

      const response = await http()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({ email, name: 'Coach Taylor' });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('sin cookie responde 401', async () => {
      await http().post('/api/auth/refresh').expect(401);
    });

    it('entrega una sesión nueva y cambia el refresh token', async () => {
      const first = await register(newEmail()).expect(201);

      const second = await http()
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie(first))
        .expect(200);

      expect(refreshCookie(second).split(';')[0]).not.toBe(refreshCookie(first).split(';')[0]);
      await http()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${(second.body as AuthBody).accessToken}`)
        .expect(200);
    });

    it('si se reutiliza un refresh token ya usado, cierra toda la sesión', async () => {
      const first = await register(newEmail()).expect(201);
      const second = await http()
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie(first))
        .expect(200);

      // Alguien presenta el token viejo (robado): se rechaza...
      await http().post('/api/auth/refresh').set('Cookie', refreshCookie(first)).expect(401);
      // ...y el token nuevo de esa misma sesión también deja de valer.
      await http().post('/api/auth/refresh').set('Cookie', refreshCookie(second)).expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('invalida el refresh token y borra la cookie', async () => {
      const session = await register(newEmail()).expect(201);
      const cookie = refreshCookie(session);

      const logout = await http().post('/api/auth/logout').set('Cookie', cookie).expect(204);

      expect(refreshCookie(logout)).toMatch(/^refreshToken=;/);
      await http().post('/api/auth/refresh').set('Cookie', cookie).expect(401);
    });

    it('no falla si no hay sesión', async () => {
      await http().post('/api/auth/logout').expect(204);
    });
  });
});
