import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';

import { UserEntity } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { LoginDto } from './dtos/login.dto';
import { addDays } from '../../common/utils/date.util';

type Meta = { ip?: string; userAgent?: string };

function accessExpires(): StringValue {
  return (process.env.JWT_EXPIRES_IN ?? '15m') as StringValue;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(AuthSessionEntity)
    private readonly sessionsRepo: Repository<AuthSessionEntity>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto, meta?: Meta) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User disabled');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        accountType: user.accountType,
      },
      { expiresIn: accessExpires() },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, t: 'refresh' },
      { expiresIn: '30d' },
    );

    const session = this.sessionsRepo.create({
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(refreshToken, 12),
      ip: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
      revokedAt: null,
      expiresAt: addDays(new Date(), 30),
    });

    await this.sessionsRepo.save(session);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.t !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const sessions = await this.sessionsRepo.find({
      where: { userId: payload.sub },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const session = await (async () => {
      for (const s of sessions) {
        if (s.revokedAt) continue;
        if (s.expiresAt < new Date()) continue;
        if (await bcrypt.compare(refreshToken, s.refreshTokenHash)) return s;
      }
      return null;
    })();

    if (!session) throw new UnauthorizedException('Refresh revoked');

    session.revokedAt = new Date();
    await this.sessionsRepo.save(session);

    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, accountType: user.accountType },
      { expiresIn: accessExpires() },
    );

    const newRefreshToken = await this.jwt.signAsync(
      { sub: user.id, t: 'refresh' },
      { expiresIn: '30d' },
    );

    await this.sessionsRepo.save(
      this.sessionsRepo.create({
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(newRefreshToken, 12),
        expiresAt: addDays(new Date(), 30),
      }),
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}
