import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';

describe('API (e2e)', () => {
  let mongo: MongoMemoryReplSet;
  let app: INestApplication;

  beforeAll(async () => {
    // Mongo en memoria como replica set, igual que en local y en Atlas (hace falta para transacciones).
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGODB_URI = mongo.getUri();
    process.env.MONGODB_DB_NAME = 'playbookpro-e2e';

    // AppModule lee las variables de entorno al importarse, así que se importa después de fijarlas.
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  it('GET /api/health informa de que la base de datos responde', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });
});
