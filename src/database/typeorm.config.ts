import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { PlatformUserEntity } from '../modules/platform-users/entities/platform-user.entity';
import { PlatformRoleEntity } from '../modules/platform-roles/entities/platform-role.entity';
import { PlatformUserRoleEntity } from '../modules/platform-user-roles/entities/platform-user-role.entity';
import { VerticalEntity } from '../modules/catalog/verticals/entities/vertical.entity';
import { CompanyEntity } from '../modules/companies/entities/company.entity';
import { CompanyContactEntity } from '../modules/company-contacts/entities/company-contact.entity';
import { CompanyVerticalEntity } from '../modules/company-verticals/entities/company-vertical.entity';
import { PlanEntity } from '../modules/billing/plans/entities/plan.entity';
import { SubscriptionEntity } from '../modules/billing/subscriptions/entities/subscription.entity';
import { OrderEntity } from '../modules/billing/orders/entities/order.entity';
import { VerticalTenantEntity } from '../modules/vertical-tenants/entities/vertical-tenant.entity';
import { InviteEntity } from '../modules/invites/entities/invite.entity';
import { AuditLogEntity } from '../modules/audit-logs/entities/audit-log.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
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
  synchronize: false,
  dropSchema: false,
  autoLoadEntities: false,
  logging: configService.get<string>('DB_LOGGING') === 'true',
});