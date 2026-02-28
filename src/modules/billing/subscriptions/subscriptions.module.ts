import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionEntity } from './entities/subscription.entity';
import { PlanEntity } from '../plans/entities/plan.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionGuard } from '../guards/subscription.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionEntity,
      PlanEntity,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionGuard],
  exports: [SubscriptionsService, SubscriptionGuard, TypeOrmModule],
})
export class SubscriptionsModule {}