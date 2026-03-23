import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserRolesController } from './platform-user-roles.controller';
import { PlatformUserRolesService } from './platform-user-roles.service';
import { PlatformUserRoleEntity } from './entities/platform-user-role.entity';
import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { PlatformRolesModule } from '../platform-roles/platform-roles.module';
import { CompanyVerticalsModule } from '../company-verticals/company-verticals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformUserRoleEntity]),
    PlatformUsersModule,
    PlatformRolesModule,
    CompanyVerticalsModule,
  ],
  controllers: [PlatformUserRolesController],
  providers: [PlatformUserRolesService],
  exports: [PlatformUserRolesService],
})
export class PlatformUserRolesModule {}