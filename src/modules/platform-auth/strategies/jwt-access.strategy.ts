import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PlatformAuthService } from '../platform-auth.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-platform-access',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly platformAuthService: PlatformAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ?? 'access-secret-dev',
    });
  }

  async validate(payload: { sub: string; email: string; roles: string[] }) {
    return this.platformAuthService.validateAccessTokenPayload(payload);
  }
}