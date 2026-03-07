import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PlatformAuthService } from '../platform-auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-platform-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly platformAuthService: PlatformAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ?? 'refresh-secret-dev',
    });
  }

  async validate(payload: { sub: string; email: string; roles: string[] }) {
    return this.platformAuthService.validateRefreshTokenPayload(payload);
  }
}