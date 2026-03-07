import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyVerticalEntity } from './entities/company-vertical.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyVerticalEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class CompanyVerticalsModule {}