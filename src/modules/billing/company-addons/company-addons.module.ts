import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyVerticalAddonEntity } from './entities/company-vertical-addon.entity';
import { CompanyAddonsController } from './company-addons.controller';
import { CompanyAddonsService } from './company-addons.service';
import { AddonEntity } from '../addons/entities/addon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyVerticalAddonEntity, AddonEntity])],
  controllers: [CompanyAddonsController],
  providers: [CompanyAddonsService],
})
export class CompanyAddonsModule {}
