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

import { PlatformUserEntity } from './modules/platform-users/entities/platform-user.entity';
import { PlatformRoleEntity } from './modules/platform-roles/entities/platform-role.entity';
import { PlatformUserRoleEntity } from './modules/platform-user-roles/entities/platform-user-role.entity';
import { VerticalEntity } from './modules/catalog/verticals/entities/vertical.entity';
import { CompanyEntity } from './modules/companies/entities/company.entity';
import { CompanyContactEntity } from './modules/company-contacts/entities/company-contact.entity';
import { CompanyVerticalEntity } from './modules/company-verticals/entities/company-vertical.entity';
import { PlanEntity } from './modules/billing/plans/entities/plan.entity';
import { SubscriptionEntity } from './modules/billing/subscriptions/entities/subscription.entity';
import { OrderEntity } from './modules/billing/orders/entities/order.entity';
import { VerticalTenantEntity } from './modules/vertical-tenants/entities/vertical-tenant.entity';
import { InviteEntity } from './modules/invites/entities/invite.entity';
import { AuditLogEntity } from './modules/audit-logs/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT') ?? 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          PlatformUserEntity,
          PlatformRoleEntity,
          PlatformUserRoleEntity,
          VerticalEntity,
          CompanyEntity,
          CompanyContactEntity,
          CompanyVerticalEntity,
          PlanEntity,
          SubscriptionEntity,
          OrderEntity,
          VerticalTenantEntity,
          InviteEntity,
          AuditLogEntity,
        ],
        synchronize: true,
        autoLoadEntities: false,
        logging: configService.get<string>('DB_LOGGING') === 'true',
      }),
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
  ],
})
export class AppModule {}