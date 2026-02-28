// src/database/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProd = nodeEnv === 'production';

  // Flags controlados por env (para que no te borre la vida si no quieres)
  const syncEnabled = !isProd && process.env.DB_SYNC === 'true';
  const dropEnabled = !isProd && process.env.DB_DROP === 'true';

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'Lumo',

    // ✅ encuentra tus entidades en TS y JS (dev/prod)
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],

    // ✅ DEV
    synchronize: syncEnabled,

    /**
     * ✅ DEV: BORRA TODAS LAS TABLAS AL ARRANCAR (drop schema) y luego,
     * si synchronize=true, las vuelve a crear desde entidades.
     *
     * IMPORTANTE:
     * - Para que realmente "borre y recree", necesitas:
     *   DB_DROP=true y DB_SYNC=true
     * - En PROD esto queda desactivado automáticamente por isProd.
     */
    dropSchema: dropEnabled,

    // Logs
    logging: !isProd,

    // schema: 'public',
  };
};
