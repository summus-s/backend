import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyVerticalsService } from './company-verticals.service';
import { CompanyVerticalsController } from './company-verticals.controller';
import { CompanyVerticalEntity } from './entities/company-vertical.entity';
import { CompaniesModule } from '../companies/companies.module';
import { VerticalsModule } from '../catalog/verticals/verticals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyVerticalEntity]),
    CompaniesModule,
    VerticalsModule,
  ],
  controllers: [CompanyVerticalsController],
  providers: [CompanyVerticalsService],
  exports: [CompanyVerticalsService],
})
export class CompanyVerticalsModule {}