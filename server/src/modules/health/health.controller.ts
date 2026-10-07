import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

export interface HealthStatus {
  status: 'ok';
  database: 'up' | 'down';
}

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check(): Promise<HealthStatus> {
    return { status: 'ok', database: (await this.pingDatabase()) ? 'up' : 'down' };
  }

  /** Hace un ping real a Mongo: no basta con que la conexión se abriera al arrancar. */
  private async pingDatabase(): Promise<boolean> {
    try {
      await this.connection.db?.admin().ping();
      return this.connection.db !== undefined;
    } catch {
      return false;
    }
  }
}
