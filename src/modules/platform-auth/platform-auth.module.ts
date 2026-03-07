import { Module } from '@nestjs/common';

import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { PlatformRolesModule } from '../platform-roles/platform-roles.module';
import { PlatformUserRolesModule } from '../platform-user-roles/platform-user-roles.module';

@Module({
  imports: [
    PlatformUsersModule,
    PlatformRolesModule,
    PlatformUserRolesModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class PlatformAuthModule {}