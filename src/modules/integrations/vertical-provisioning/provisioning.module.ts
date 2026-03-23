import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { VerticalApiClient } from './vertical-api.client';
import { VerticalTenantsModule } from '../../vertical-tenants/vertical-tenants.module';
import { CompanyVerticalsModule } from '../../company-verticals/company-verticals.module';

@Module({
  imports: [
    HttpModule,
    VerticalTenantsModule,
    CompanyVerticalsModule,
  ],
  controllers: [ProvisioningController],
  providers: [ProvisioningService, VerticalApiClient],
  exports: [ProvisioningService],
})
export class ProvisioningModule {}