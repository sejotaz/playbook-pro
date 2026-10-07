import request from 'supertest';
import { createTestApp, type TestApp } from './create-test-app.js';

describe('API (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  }, 120_000);

  afterAll(async () => {
    await testApp?.close();
  });

  it('GET /api/health es público e informa de que la base de datos responde', () => {
    return request(testApp.app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });
});
