import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanEntity } from './entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class PlansModule {}