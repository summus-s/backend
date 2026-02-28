import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonEntity } from './entities/addon.entity';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddonEntity])],
  controllers: [AddonsController],
  providers: [AddonsService],
  exports: [TypeOrmModule],
})
export class AddonsModule {}
