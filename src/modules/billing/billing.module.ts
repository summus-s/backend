import { Module } from '@nestjs/common';

import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PlansModule, SubscriptionsModule, OrdersModule],
  exports: [PlansModule, SubscriptionsModule, OrdersModule],
})
export class BillingModule {}