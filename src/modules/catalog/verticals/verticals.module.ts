import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerticalEntity } from './entities/vertical.entity';
import { VerticalsService } from './verticals.service';
import { VerticalsController } from './verticals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalEntity])],
  controllers: [VerticalsController],
  providers: [VerticalsService],
  exports: [VerticalsService],
})
export class VerticalsModule {}