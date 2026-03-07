import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserRoleEntity } from './entities/platform-user-role.entity';
import { PlatformUserRolesService } from './platform-user-roles.service';
import { PlatformUserRolesController } from './platform-user-roles.controller';
import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { PlatformRolesModule } from '../platform-roles/platform-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformUserRoleEntity]),
    PlatformUsersModule,
    PlatformRolesModule,
  ],
  controllers: [PlatformUserRolesController],
  providers: [PlatformUserRolesService],
  exports: [PlatformUserRolesService],
})
export class PlatformUserRolesModule {}