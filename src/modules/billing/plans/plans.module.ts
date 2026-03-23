import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanEntity } from './entities/plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { VerticalsModule } from '../../catalog/verticals/verticals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanEntity]),
    VerticalsModule,
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}