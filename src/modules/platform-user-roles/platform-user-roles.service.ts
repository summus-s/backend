import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { PlatformUserRoleEntity } from './entities/platform-user-role.entity';
import { CreatePlatformUserRoleDto } from './dto/create-platform-user-role.dto';
import { QueryPlatformUserRolesDto } from './dto/query-platform-user-roles.dto';
import { RevokePlatformUserRoleDto } from './dto/revoke-platform-user-role.dto';
import { PlatformUsersService } from '../platform-users/platform-users.service';
import { PlatformRolesService } from '../platform-roles/platform-roles.service';
import { CompanyVerticalsService } from '../company-verticals/company-verticals.service';
import { CompanyVerticalStatus } from '../company-verticals/enums/company-vertical-status.enum';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class PlatformUserRolesService {
  constructor(
    @InjectRepository(PlatformUserRoleEntity)
    private readonly platformUserRolesRepo: Repository<PlatformUserRoleEntity>,
    private readonly platformUsersService: PlatformUsersService,
    private readonly platformRolesService: PlatformRolesService,
    private readonly companyVerticalsService: CompanyVerticalsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private async ensureContextIsValid(companyVerticalId?: string) {
    if (!companyVerticalId) {
      return null;
    }

    const companyVertical =
      await this.companyVerticalsService.findById(companyVerticalId);

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes asignar roles contextuales sobre company-vertical activos',
      );
    }

    return companyVertical;
  }

  private buildContextWhere(companyVerticalId?: string | null) {
    return companyVerticalId ? companyVerticalId : IsNull();
  }

  private async ensureUniqueAssignment(
    platformUserId: string,
    platformRoleId: string,
    companyVerticalId?: string | null,
    excludeId?: string,
  ) {
    const existing = await this.platformUserRolesRepo.findOne({
      where: {
        platformUserId,
        platformRoleId,
        companyVerticalId: this.buildContextWhere(companyVerticalId),
      },
    });

    if (existing && existing.id !== excludeId && existing.isActive) {
      throw new BadRequestException(
        'El usuario ya tiene este rol asignado en ese contexto',
      );
    }
  }

  async create(createDto: CreatePlatformUserRoleDto) {
    await this.platformUsersService.findById(createDto.platformUserId);
    await this.platformRolesService.findById(createDto.platformRoleId);
    await this.ensureContextIsValid(createDto.companyVerticalId);

    await this.ensureUniqueAssignment(
      createDto.platformUserId,
      createDto.platformRoleId,
      createDto.companyVerticalId,
    );

    const userRole = this.platformUserRolesRepo.create({
      platformUserId: createDto.platformUserId,
      platformRoleId: createDto.platformRoleId,
      companyVerticalId: createDto.companyVerticalId ?? null,
      isActive: true,
      assignedAt: new Date(),
      revokedAt: null,
      statusReason: this.normalizeString(createDto.reason),
      notes: this.normalizeString(createDto.notes),
    });

    return this.platformUserRolesRepo.save(userRole);
  }

  async assignByRoleKey(input: {
    platformUserId: string;
    platformRoleKey: string;
    companyVerticalId?: string | null;
    reason?: string;
    notes?: string;
  }) {
    await this.platformUsersService.findById(input.platformUserId);
    await this.ensureContextIsValid(input.companyVerticalId ?? undefined);

    const role = await this.platformRolesService.findByKey(input.platformRoleKey);

    const existing = await this.platformUserRolesRepo.findOne({
      where: {
        platformUserId: input.platformUserId,
        platformRoleId: role.id,
        companyVerticalId: this.buildContextWhere(input.companyVerticalId),
      },
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.assignedAt = new Date();
        existing.revokedAt = null;
        existing.statusReason = this.normalizeString(input.reason);
        existing.notes = this.normalizeString(input.notes);
        return this.platformUserRolesRepo.save(existing);
      }

      return existing;
    }

    return this.create({
      platformUserId: input.platformUserId,
      platformRoleId: role.id,
      companyVerticalId: input.companyVerticalId ?? undefined,
      reason: input.reason,
      notes: input.notes,
    });
  }

  async findAll(queryDto: QueryPlatformUserRolesDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.platformUserRolesRepo
      .createQueryBuilder('platformUserRole')
      .leftJoinAndSelect('platformUserRole.platformUser', 'platformUser')
      .leftJoinAndSelect('platformUserRole.platformRole', 'platformRole')
      .leftJoinAndSelect('platformUserRole.companyVertical', 'companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical');

    if (queryDto.platformUserId) {
      query.andWhere('platformUserRole.platformUserId = :platformUserId', {
        platformUserId: queryDto.platformUserId,
      });
    }

    if (queryDto.platformRoleId) {
      query.andWhere('platformUserRole.platformRoleId = :platformRoleId', {
        platformRoleId: queryDto.platformRoleId,
      });
    }

    if (queryDto.companyVerticalId) {
      query.andWhere(
        'platformUserRole.companyVerticalId = :companyVerticalId',
        {
          companyVerticalId: queryDto.companyVerticalId,
        },
      );
    }

    if (queryDto.isActive !== undefined) {
      query.andWhere('platformUserRole.isActive = :isActive', {
        isActive: queryDto.isActive === 'true',
      });
    }

    query.orderBy('platformUserRole.createdAt', 'DESC');
    query.skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    const assignment = await this.platformUserRolesRepo.findOne({
      where: { id },
      relations: {
        platformUser: true,
        platformRole: true,
        companyVertical: {
          company: true,
          vertical: true,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación de rol no encontrada');
    }

    return assignment;
  }

  async findByUserId(platformUserId: string) {
    await this.platformUsersService.findById(platformUserId);

    return this.platformUserRolesRepo.find({
      where: {
        platformUserId,
      },
      relations: {
        platformRole: true,
        companyVertical: {
          company: true,
          vertical: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async revoke(id: string, dto: RevokePlatformUserRoleDto) {
    const assignment = await this.findById(id);

    if (!assignment.isActive) {
      throw new BadRequestException('La asignación ya está revocada');
    }

    assignment.isActive = false;
    assignment.revokedAt = new Date();
    assignment.statusReason =
      this.normalizeString(dto.reason) ?? 'Asignación revocada';

    if (dto.notes !== undefined) {
      assignment.notes = this.normalizeString(dto.notes);
    }

    return this.platformUserRolesRepo.save(assignment);
  }
}