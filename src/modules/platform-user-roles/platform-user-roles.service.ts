import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlatformUserRoleEntity } from './entities/platform-user-role.entity';
import { AssignPlatformRoleDto } from './dto/assign-platform-role.dto';
import { RemovePlatformRoleDto } from './dto/remove-platform-role.dto';
import { PlatformRolesService } from '../platform-roles/platform-roles.service';
import { PlatformUsersService } from '../platform-users/platform-users.service';
import { PlatformRoleKey } from '../platform-roles/enums/platform-role-key.enum';

@Injectable()
export class PlatformUserRolesService {
  constructor(
    @InjectRepository(PlatformUserRoleEntity)
    private readonly platformUserRolesRepo: Repository<PlatformUserRoleEntity>,
    private readonly platformRolesService: PlatformRolesService,
    private readonly platformUsersService: PlatformUsersService,
  ) {}

  async assignRole(
    assignDto: AssignPlatformRoleDto,
  ): Promise<PlatformUserRoleEntity> {
    const user = await this.platformUsersService.findById(assignDto.userId);
    const role = await this.platformRolesService.findByKey(assignDto.roleKey);

    const existing = await this.platformUserRolesRepo.findOne({
      where: {
        userId: user.id,
        roleId: role.id,
      },
      relations: {
        user: true,
        role: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ya tiene el rol ${assignDto.roleKey}`,
      );
    }

    const assignment = this.platformUserRolesRepo.create({
      userId: user.id,
      roleId: role.id,
    });

    return this.platformUserRolesRepo.save(assignment);
  }

  async removeRole(removeDto: RemovePlatformRoleDto): Promise<void> {
    const user = await this.platformUsersService.findById(removeDto.userId);
    const role = await this.platformRolesService.findByKey(removeDto.roleKey);

    const assignment = await this.platformUserRolesRepo.findOne({
      where: {
        userId: user.id,
        roleId: role.id,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `El usuario no tiene asignado el rol ${removeDto.roleKey}`,
      );
    }

    await this.platformUserRolesRepo.remove(assignment);
  }

  async replaceRoles(
    userId: string,
    roleKeys: PlatformRoleKey[],
  ): Promise<PlatformUserRoleEntity[]> {
    await this.platformUsersService.findById(userId);

    const roles = await this.platformRolesService.findManyByKeys(roleKeys);

    await this.platformUserRolesRepo.delete({ userId });

    if (!roles.length) {
      return [];
    }

    const assignments = roles.map((role) =>
      this.platformUserRolesRepo.create({
        userId,
        roleId: role.id,
      }),
    );

    return this.platformUserRolesRepo.save(assignments);
  }

  async findRolesByUserId(userId: string): Promise<PlatformUserRoleEntity[]> {
    await this.platformUsersService.findById(userId);

    return this.platformUserRolesRepo.find({
      where: { userId },
      relations: {
        role: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}