import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserRoleEntity } from './entities/platform-user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformUserRoleEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class PlatformUserRolesModule {}