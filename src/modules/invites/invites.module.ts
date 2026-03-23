import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InviteEntity } from './entities/invite.entity';
import {
  InvitesController,
  PublicInvitesController,
} from './invites.controller';
import { InvitesService } from './invites.service';
import { CompaniesModule } from '../companies/companies.module';
import { CompanyVerticalsModule } from '../company-verticals/company-verticals.module';
import { VerticalTenantsModule } from '../vertical-tenants/vertical-tenants.module';
import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { PlatformUserRolesModule } from '../platform-user-roles/platform-user-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteEntity]),
    CompaniesModule,
    CompanyVerticalsModule,
    VerticalTenantsModule,
    PlatformUsersModule,
    PlatformUserRolesModule,
  ],
  controllers: [InvitesController, PublicInvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}