import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserEntity } from './entities/platform-user.entity';
import { PlatformUsersService } from './platform-users.service';
import { PlatformUsersController } from './platform-users.controller';
import { PlatformRolesModule } from '../platform-roles/platform-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformUserEntity]),
    PlatformRolesModule,
  ],
  controllers: [PlatformUsersController],
  providers: [PlatformUsersService],
  exports: [PlatformUsersService],
})
export class PlatformUsersModule {}