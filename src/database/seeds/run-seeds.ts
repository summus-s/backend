import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SuperAdminSeed } from './super-admin.seed';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const superAdminSeed = app.get(SuperAdminSeed);

  await superAdminSeed.run();

  await app.close();
}

runSeeds();