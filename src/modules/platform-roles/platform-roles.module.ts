import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformRoleEntity } from './entities/platform-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformRoleEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class PlatformRolesModule {}