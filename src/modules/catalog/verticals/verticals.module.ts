import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerticalEntity } from './entities/vertical.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class VerticalsModule {}