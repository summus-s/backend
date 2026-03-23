import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { PlatformUsersService } from '../platform-users/platform-users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { PlatformUserEntity } from '../platform-users/entities/platform-user.entity';
import { PlatformUserStatus } from '../platform-users/enums/platform-user-status.enum';

type JwtPayload = {
  sub: string;
  email: string;
  roles: string[];
};

@Injectable()
export class PlatformAuthService {
  constructor(
    private readonly platformUsersService: PlatformUsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is not defined`);
    }

    return value;
  }

  private getAccessTokenSecret(): string {
    return this.getRequiredConfig('JWT_ACCESS_SECRET');
  }

  private getRefreshTokenSecret(): string {
    return this.getRequiredConfig('JWT_REFRESH_SECRET');
  }

  private getAccessTokenExpiresIn(): StringValue {
    return this.getRequiredConfig('JWT_ACCESS_EXPIRES_IN') as StringValue;
  }

  private getRefreshTokenExpiresIn(): StringValue {
    return this.getRequiredConfig('JWT_REFRESH_EXPIRES_IN') as StringValue;
  }

  private extractRoles(user: PlatformUserEntity): string[] {
    return user.platformUserRoles?.map((item) => item.platformRole.key) ?? [];
  }

  private sanitizeUser(user: PlatformUserEntity) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles: this.extractRoles(user),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateTokens(user: PlatformUserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: this.extractRoles(user),
    };

    const accessTokenSecret = this.getAccessTokenSecret();
    const refreshTokenSecret = this.getRefreshTokenSecret();
    const accessTokenExpiresIn = this.getAccessTokenExpiresIn();
    const refreshTokenExpiresIn = this.getRefreshTokenExpiresIn();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: accessTokenSecret,
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload as any, {
        secret: refreshTokenSecret,
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await CryptoUtil.hashPassword(refreshToken);
    await this.platformUsersService.updateRefreshTokenHash(
      userId,
      refreshTokenHash,
    );
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<PlatformUserEntity> {
    const user = await this.platformUsersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== PlatformUserStatus.ACTIVE) {
      throw new ForbiddenException('El usuario está deshabilitado');
    }

    const isPasswordValid = await CryptoUtil.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await Promise.all([
      this.persistRefreshToken(user.id, refreshToken),
      this.platformUsersService.updateLastLoginAt(user.id),
    ]);

    const updatedUser = await this.platformUsersService.findById(user.id);

    return {
      user: this.sanitizeUser(updatedUser),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshDto.refreshToken,
        {
          secret: this.getRefreshTokenSecret(),
        },
      );

      const user = await this.platformUsersService.findById(payload.sub);

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('Sesión no válida');
      }

      const isRefreshTokenValid = await CryptoUtil.comparePassword(
        refreshDto.refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      if (user.status !== PlatformUserStatus.ACTIVE) {
        throw new ForbiddenException('El usuario está deshabilitado');
      }

      const { accessToken, refreshToken } = await this.generateTokens(user);

      await this.persistRefreshToken(user.id, refreshToken);

      const updatedUser = await this.platformUsersService.findById(user.id);

      return {
        user: this.sanitizeUser(updatedUser),
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(userId: string) {
    await this.platformUsersService.updateRefreshTokenHash(userId, null);

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.platformUsersService.findById(userId);

    const isCurrentPasswordValid = await CryptoUtil.comparePassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const isSamePassword = await CryptoUtil.comparePassword(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new ForbiddenException(
        'La nueva contraseña no puede ser igual a la actual',
      );
    }

    const newPasswordHash = await CryptoUtil.hashPassword(
      changePasswordDto.newPassword,
    );

    await this.platformUsersService.updatePassword(user.id, newPasswordHash);

    return {
      message:
        'Contraseña actualizada correctamente. Debes iniciar sesión de nuevo.',
    };
  }

  async me(userId: string) {
    const user = await this.platformUsersService.findById(userId);
    return this.sanitizeUser(user);
  }

  async validateAccessTokenPayload(payload: JwtPayload) {
    const user = await this.platformUsersService.findById(payload.sub);

    if (user.status !== PlatformUserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inválido');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles:
        user.platformUserRoles?.map((item) => ({
          id: item.platformRole.id,
          key: item.platformRole.key,
          name: item.platformRole.name,
        })) ?? [],
    };
  }

  async validateRefreshTokenPayload(payload: JwtPayload) {
    const user = await this.platformUsersService.findById(payload.sub);

    if (user.status !== PlatformUserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inválido');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles:
        user.platformUserRoles?.map((item) => ({
          id: item.platformRole.id,
          key: item.platformRole.key,
          name: item.platformRole.name,
        })) ?? [],
    };
  }
}