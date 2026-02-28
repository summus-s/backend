import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { typeOrmConfig } from './database/typeorm.config';
import { SuperAdminSeed } from './database/seeds/super-admin.seed';

import { UsersModule } from './modules/users/users.module';
import { VerticalsModule } from './modules/catalog/verticals/verticals.module';
import { CompanyVerticalsModule } from './modules/company-verticals/company-verticals.module';
import { MembershipsModule } from './modules/access/memberships/memberships.module';
import { RolesModule } from './modules/access/roles/roles.module';
import { MembershipRolesModule } from './modules/access/membership-roles/membership-roles.module';
import { SsoModule } from './modules/sso/sso.module';
import { PlansModule } from './modules/billing/plans/plans.module';
import { SubscriptionsModule } from './modules/billing/subscriptions/subscriptions.module';
import { AddonsModule } from './modules/billing/addons/addons.module';
import { CompanyAddonsModule } from './modules/billing/company-addons/company-addons.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { MeModule } from './modules/me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),

    UsersModule,
    VerticalsModule,
    CompaniesModule,
    CompanyVerticalsModule,

    MembershipsModule,
    RolesModule,
    MembershipRolesModule,

    AuthModule,
    SsoModule,

    PlansModule,
    SubscriptionsModule,
    AddonsModule,
    CompanyAddonsModule,

    MeModule,
  ],
  providers: [SuperAdminSeed],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly superAdminSeed: SuperAdminSeed) {}

  async onModuleInit() {
    await this.superAdminSeed.run();
  }
}