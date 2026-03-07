import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserEntity } from './entities/platform-user.entity';
import { PlatformUsersService } from './platform-users.service';
import { PlatformUsersController } from './platform-users.controller';
import { PlatformRolesModule } from '../platform-roles/platform-roles.module';
import { PlatformRolesService } from '../platform-roles/platform-roles.service';
import { PlatformUserRoleEntity } from '../platform-user-roles/entities/platform-user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlatformUserEntity,
      PlatformUserRoleEntity,
    ]),
    PlatformRolesModule,
  ],
  providers: [PlatformUsersService],
  controllers: [PlatformUsersController],
  exports: [PlatformUsersService],
})
export class PlatformUsersModule {}