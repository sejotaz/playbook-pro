import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthController } from './health.controller.js';

async function createController(ping: () => Promise<unknown>): Promise<HealthController> {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: getConnectionToken(), useValue: { db: { admin: () => ({ ping }) } } }],
  }).compile();
  return moduleRef.get(HealthController);
}

describe('HealthController', () => {
  it('responde ok con la base de datos arriba', async () => {
    const controller = await createController(() => Promise.resolve({ ok: 1 }));

    await expect(controller.check()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('informa de la base de datos caída sin lanzar error', async () => {
    const controller = await createController(() => Promise.reject(new Error('sin conexión')));

    await expect(controller.check()).resolves.toEqual({ status: 'ok', database: 'down' });
  });
});
