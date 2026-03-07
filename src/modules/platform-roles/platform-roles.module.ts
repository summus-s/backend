import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformRoleEntity } from './entities/platform-role.entity';
import { PlatformRolesService } from './platform-roles.service';
import { PlatformRolesController } from './platform-roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformRoleEntity])],
  controllers: [PlatformRolesController],
  providers: [PlatformRolesService],
  exports: [PlatformRolesService],
})
export class PlatformRolesModule {}