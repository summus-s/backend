import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { PlatformAuthController } from './platform-auth.controller';
import { PlatformAuthService } from './platform-auth.service';
import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    PlatformUsersModule,
  ],
  controllers: [PlatformAuthController],
  providers: [
    PlatformAuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [PlatformAuthService],
})
export class PlatformAuthModule {}