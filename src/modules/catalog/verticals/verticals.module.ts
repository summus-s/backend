import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerticalEntity } from './entities/vertical.entity';
import { VerticalsController } from './verticals.controller';
import { VerticalsService } from './verticals.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalEntity])],
  controllers: [VerticalsController],
  providers: [VerticalsService],
  exports: [TypeOrmModule],
})
export class VerticalsModule {}
