import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerticalTenantsController } from './vertical-tenants.controller';
import { VerticalTenantsService } from './vertical-tenants.service';
import { VerticalTenantEntity } from './entities/vertical-tenant.entity';
import { CompanyVerticalsModule } from '../company-verticals/company-verticals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerticalTenantEntity]),
    CompanyVerticalsModule,
  ],
  controllers: [VerticalTenantsController],
  providers: [VerticalTenantsService],
  exports: [VerticalTenantsService],
})
export class VerticalTenantsModule {}