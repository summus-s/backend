import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyVerticalEntity } from './entities/company-vertical.entity';
import { CompanyVerticalsController } from './company-verticals.controller';
import { CompanyVerticalsService } from './company-verticals.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyVerticalEntity])],
  controllers: [CompanyVerticalsController],
  providers: [CompanyVerticalsService],
})
export class CompanyVerticalsModule {}
