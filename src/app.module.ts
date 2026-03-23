import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PlatformAuthModule } from './modules/platform-auth/platform-auth.module';
import { PlatformUsersModule } from './modules/platform-users/platform-users.module';
import { PlatformRolesModule } from './modules/platform-roles/platform-roles.module';
import { PlatformUserRolesModule } from './modules/platform-user-roles/platform-user-roles.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyContactsModule } from './modules/company-contacts/company-contacts.module';
import { CompanyVerticalsModule } from './modules/company-verticals/company-verticals.module';
import { VerticalsModule } from './modules/catalog/verticals/verticals.module';
import { VerticalTenantsModule } from './modules/vertical-tenants/vertical-tenants.module';
import { InvitesModule } from './modules/invites/invites.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { BillingModule } from './modules/billing/billing.module';
import { SuperAdminSeed } from './database/seeds/super-admin.seed';
import { getTypeOrmConfig } from './database/typeorm.config';
import { ProvisioningModule } from './modules/integrations/vertical-provisioning/provisioning.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),

    PlatformAuthModule,
    PlatformUsersModule,
    PlatformRolesModule,
    PlatformUserRolesModule,
    CompaniesModule,
    CompanyContactsModule,
    CompanyVerticalsModule,
    VerticalsModule,
    VerticalTenantsModule,
    InvitesModule,
    AuditLogsModule,
    BillingModule,
    ProvisioningModule,
  ],
  providers: [SuperAdminSeed],
})
export class AppModule {}