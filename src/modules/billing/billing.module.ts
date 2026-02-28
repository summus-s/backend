import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionEntity } from './subscriptions/entities/subscription.entity';
import { SubscriptionGuard } from './guards/subscription.guard';
import { OrdersModule } from './orders/orders.module';
import { AddonsModule } from './addons/addons.module';
import { CompanyAddonsModule } from './company-addons/company-addons.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity]), OrdersModule, AddonsModule, CompanyAddonsModule],
  providers: [SubscriptionGuard],
  exports: [SubscriptionGuard],
})
export class BillingModule {}
