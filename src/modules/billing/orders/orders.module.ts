import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CompanyAddonsModule } from '../company-addons/company-addons.module';


@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    SubscriptionsModule,
    CompanyAddonsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
