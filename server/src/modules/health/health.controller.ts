import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import type { Connection } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator.js';

export class HealthStatusDto {
  @ApiProperty({ enum: ['ok'] })
  status!: 'ok';

  @ApiProperty({ enum: ['up', 'down'] })
  database!: 'up' | 'down';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Estado de la API y de la base de datos' })
  @ApiOkResponse({ type: HealthStatusDto })
  async check(): Promise<HealthStatusDto> {
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
