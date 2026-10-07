import { setServers } from 'node:dns';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { Env } from '../config/env.schema.js';

/** Conexión única a MongoDB (Atlas o el replica set local), compartida por todos los módulos. */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const dnsServers = config.get('DNS_SERVERS', { infer: true });
        if (dnsServers) {
          // Debe hacerse antes de conectar: el driver resuelve la dirección mongodb+srv por DNS.
          setServers(dnsServers);
        }
        return {
          uri: config.get('MONGODB_URI', { infer: true }),
          dbName: config.get('MONGODB_DB_NAME', { infer: true }),
          // En producción los índices se crean con un script controlado, no al arrancar.
          autoIndex: config.get('NODE_ENV', { infer: true }) !== 'production',
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
