import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerticalTenantEntity } from './entities/vertical-tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalTenantEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class VerticalTenantsModule {}