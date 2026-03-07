import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactEntity } from './entities/company-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyContactEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class CompanyContactsModule {}