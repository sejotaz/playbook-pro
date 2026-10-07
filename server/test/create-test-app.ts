import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export interface TestApp {
  app: INestApplication;
  close: () => Promise<void>;
}

/**
 * Levanta la API completa contra un Mongo en memoria. Es un replica set, igual que en local
 * y en Atlas, porque las transacciones solo funcionan así.
 */
export async function createTestApp(): Promise<TestApp> {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB_NAME = 'playbookpro-e2e';
  process.env.JWT_ACCESS_SECRET = 'secreto-solo-para-tests-con-mas-de-32-caracteres';

  // AppModule lee las variables de entorno al importarse, así que se importa después de fijarlas.
  const { AppModule } = await import('../src/app.module.js');
  const { configureApp } = await import('../src/app.setup.js');

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();

  return {
    app,
    close: async () => {
      await app.close();
      await mongo.stop();
    },
  };
}
