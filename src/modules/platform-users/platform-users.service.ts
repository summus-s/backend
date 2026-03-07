import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

import { PlatformUserEntity } from './entities/platform-user.entity';
import { PlatformUserRoleEntity } from '../platform-user-roles/entities/platform-user-role.entity';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserDto } from './dto/update-platform-user.dto';
import { QueryPlatformUsersDto } from './dto/query-platform-users.dto';
import { SetPlatformUserStatusDto } from './dto/set-platform-user-status.dto';
import { PlatformUserStatus } from './enums/platform-user-status.enum';
import { PlatformRolesService } from '../platform-roles/platform-roles.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Injectable()
export class PlatformUsersService {
  constructor(
    @InjectRepository(PlatformUserEntity)
    private readonly platformUsersRepo: Repository<PlatformUserEntity>,
    @InjectRepository(PlatformUserRoleEntity)
    private readonly platformUserRolesRepo: Repository<PlatformUserRoleEntity>,
    private readonly platformRolesService: PlatformRolesService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async create(
    createDto: CreatePlatformUserDto,
  ): Promise<PlatformUserEntity> {
    const email = this.normalizeEmail(createDto.email);

    const existing = await this.platformUsersRepo.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const passwordHash = await CryptoUtil.hashPassword(createDto.password);

    const user = this.platformUsersRepo.create({
      email,
      passwordHash,
      fullName: createDto.fullName.trim(),
      status: createDto.status ?? PlatformUserStatus.ACTIVE,
    });

    const savedUser = await this.platformUsersRepo.save(user);

    if (createDto.roleKeys?.length) {
      const roles = await this.platformRolesService.findManyByKeys(
        createDto.roleKeys,
      );

      const assignments = roles.map((role) =>
        this.platformUserRolesRepo.create({
          userId: savedUser.id,
          roleId: role.id,
        }),
      );

      await this.platformUserRolesRepo.save(assignments);
    }

    return this.findById(savedUser.id);
  }

  async findAll(
    queryDto?: QueryPlatformUsersDto,
  ): Promise<PlatformUserEntity[]> {
    const where: FindOptionsWhere<PlatformUserEntity>[] = [];

    if (queryDto?.email) {
      where.push({ email: this.normalizeEmail(queryDto.email) });
    }

    if (queryDto?.status) {
      if (where.length) {
        for (const item of where) item.status = queryDto.status;
      } else {
        where.push({ status: queryDto.status });
      }
    }

    if (queryDto?.search) {
      const search = `%${queryDto.search.trim()}%`;

      where.push(
        { fullName: ILike(search) },
        { email: ILike(search) },
      );
    }

    const users = await this.platformUsersRepo.find({
      where: where.length ? where : undefined,
      relations: {
        platformUserRoles: {
          role: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (queryDto?.roleKey) {
      return users.filter((user) =>
        user.platformUserRoles?.some(
          (item) => item.role?.key === queryDto.roleKey,
        ),
      );
    }

    return users;
  }

  async findById(id: string): Promise<PlatformUserEntity> {
    const user = await this.platformUsersRepo.findOne({
      where: { id },
      relations: {
        platformUserRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario de plataforma no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<PlatformUserEntity | null> {
    return this.platformUsersRepo.findOne({
      where: { email: this.normalizeEmail(email) },
      relations: {
        platformUserRoles: {
          role: true,
        },
      },
    });
  }

  async findActiveByEmail(email: string): Promise<PlatformUserEntity> {
    const user = await this.findByEmail(email);

    if (!user || user.status !== PlatformUserStatus.ACTIVE) {
      throw new NotFoundException(
        'Usuario activo de plataforma no encontrado',
      );
    }

    return user;
  }

  async update(
    id: string,
    updateDto: UpdatePlatformUserDto,
  ): Promise<PlatformUserEntity> {
    const user = await this.findById(id);

    if (updateDto.email !== undefined) {
      const normalizedEmail = this.normalizeEmail(updateDto.email);

      const existing = await this.platformUsersRepo.findOne({
        where: { email: normalizedEmail },
      });

      if (existing && existing.id !== user.id) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }

      user.email = normalizedEmail;
    }

    if (updateDto.fullName !== undefined) {
      user.fullName = updateDto.fullName.trim();
    }

    if (updateDto.status !== undefined) {
      user.status = updateDto.status;
    }

    await this.platformUsersRepo.save(user);

    if (updateDto.roleKeys) {
      const roles = await this.platformRolesService.findManyByKeys(
        updateDto.roleKeys,
      );

      await this.platformUserRolesRepo.delete({ userId: user.id });

      const assignments = roles.map((role) =>
        this.platformUserRolesRepo.create({
          userId: user.id,
          roleId: role.id,
        }),
      );

      if (assignments.length) {
        await this.platformUserRolesRepo.save(assignments);
      }
    }

    return this.findById(user.id);
  }

  async setStatus(
    id: string,
    statusDto: SetPlatformUserStatusDto,
  ): Promise<PlatformUserEntity> {
    const user = await this.findById(id);
    user.status = statusDto.status;
    await this.platformUsersRepo.save(user);
    return this.findById(user.id);
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    const user = await this.findById(userId);
    user.refreshTokenHash = refreshTokenHash;
    await this.platformUsersRepo.save(user);
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.lastLoginAt = new Date();
    await this.platformUsersRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.platformUsersRepo.remove(user);
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const user = await this.findById(userId);
    user.passwordHash = newPasswordHash;
    user.refreshTokenHash = null;
    await this.platformUsersRepo.save(user);
  }
}