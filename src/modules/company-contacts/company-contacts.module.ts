import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactsService } from './company-contacts.service';
import { CompanyContactsController } from './company-contacts.controller';
import { CompanyContactEntity } from './entities/company-contact.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyContactEntity]),
    CompaniesModule,
  ],
  controllers: [CompanyContactsController],
  providers: [CompanyContactsService],
  exports: [CompanyContactsService],
})
export class CompanyContactsModule {}