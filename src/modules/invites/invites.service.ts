import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import { InviteEntity } from './entities/invite.entity';
import { InviteStatus } from './enums/invite-status.enum';
import { CreateInviteDto } from './dto/create-invite.dto';
import { QueryInvitesDto } from './dto/query-invites.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { RevokeInviteDto } from './dto/revoke-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CompaniesService } from '../companies/companies.service';
import { CompanyVerticalsService } from '../company-verticals/company-verticals.service';
import { VerticalTenantsService } from '../vertical-tenants/vertical-tenants.service';
import { CompanyVerticalStatus } from '../company-verticals/enums/company-vertical-status.enum';
import { VerticalTenantStatus } from '../vertical-tenants/enums/vertical-tenant-status.enum';
import { PlatformUsersService } from '../platform-users/platform-users.service';
import { PlatformUserStatus } from '../platform-users/enums/platform-user-status.enum';
import { PlatformUserRolesService } from '../platform-user-roles/platform-user-roles.service';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class InvitesService {
  private readonly defaultExpirationDays = 7;

  constructor(
    @InjectRepository(InviteEntity)
    private readonly invitesRepo: Repository<InviteEntity>,
    private readonly companiesService: CompaniesService,
    private readonly companyVerticalsService: CompanyVerticalsService,
    private readonly verticalTenantsService: VerticalTenantsService,
    private readonly platformUsersService: PlatformUsersService,
    private readonly platformUserRolesService: PlatformUserRolesService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private getDefaultExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.defaultExpirationDays);
    return expiresAt;
  }

  private ensureNotExpired(invite: InviteEntity) {
    if (
      invite.status === InviteStatus.PENDING &&
      invite.expiresAt.getTime() <= Date.now()
    ) {
      invite.status = InviteStatus.EXPIRED;
      invite.statusReason = 'La invitación expiró';
    }
  }

  private async saveIfExpired(invite: InviteEntity) {
    const previousStatus = invite.status;
    this.ensureNotExpired(invite);

    if (previousStatus !== invite.status) {
      await this.invitesRepo.save(invite);
    }
  }

  private async ensureCompanyAndCompanyVerticalMatch(
    companyId: string,
    companyVerticalId: string,
  ) {
    const company = await this.companiesService.findById(companyId);
    const companyVertical =
      await this.companyVerticalsService.findById(companyVerticalId);

    if (companyVertical.companyId !== company.id) {
      throw new BadRequestException(
        'El companyVerticalId no pertenece a la empresa enviada',
      );
    }

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes invitar usuarios a una relación company-vertical cancelada',
      );
    }

    return { company, companyVertical };
  }

  private async ensureUniquePendingInvite(
    companyVerticalId: string,
    email: string,
  ) {
    const existing = await this.invitesRepo.findOne({
      where: {
        companyVerticalId,
        email,
        status: InviteStatus.PENDING,
      },
    });

    if (!existing) {
      return;
    }

    await this.saveIfExpired(existing);

    if (existing.status === InviteStatus.PENDING) {
      throw new BadRequestException(
        'Ya existe una invitación pendiente para este email en este vertical',
      );
    }
  }

  async create(createDto: CreateInviteDto) {
    const normalizedEmail = this.normalizeEmail(createDto.email);

    await this.ensureCompanyAndCompanyVerticalMatch(
      createDto.companyId,
      createDto.companyVerticalId,
    );

    await this.ensureUniquePendingInvite(
      createDto.companyVerticalId,
      normalizedEmail,
    );

    const invite = this.invitesRepo.create({
      companyId: createDto.companyId,
      companyVerticalId: createDto.companyVerticalId,
      email: normalizedEmail,
      fullName: this.normalizeString(createDto.fullName),
      platformRoleKey: createDto.platformRoleKey.trim().toUpperCase(),
      status: InviteStatus.PENDING,
      token: this.generateToken(),
      sentAt: new Date(),
      acceptedAt: null,
      revokedAt: null,
      expiresAt: this.getDefaultExpirationDate(),
      statusReason: null,
      acceptedUserId: null,
      resendCount: 0,
      notes: this.normalizeString(createDto.notes),
    });

    return this.invitesRepo.save(invite);
  }

  async findAll(queryDto: QueryInvitesDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.invitesRepo
      .createQueryBuilder('invite')
      .leftJoinAndSelect('invite.company', 'company')
      .leftJoinAndSelect('invite.companyVertical', 'companyVertical')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical');

    if (queryDto.companyId) {
      query.andWhere('invite.companyId = :companyId', {
        companyId: queryDto.companyId,
      });
    }

    if (queryDto.companyVerticalId) {
      query.andWhere('invite.companyVerticalId = :companyVerticalId', {
        companyVerticalId: queryDto.companyVerticalId,
      });
    }

    if (queryDto.status) {
      query.andWhere('invite.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.email?.trim()) {
      query.andWhere('invite.email ILIKE :email', {
        email: `%${queryDto.email.trim().toLowerCase()}%`,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          invite.email ILIKE :search
          OR invite.fullName ILIKE :search
          OR invite.platformRoleKey ILIKE :search
          OR company.name ILIKE :search
          OR company.legalName ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query.orderBy('invite.createdAt', 'DESC');
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
    const invite = await this.invitesRepo.findOne({
      where: { id },
      relations: {
        company: true,
        companyVertical: {
          company: true,
          vertical: true,
          verticalTenant: true,
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitación no encontrada');
    }

    await this.saveIfExpired(invite);
    return invite;
  }

  async findByToken(token: string) {
    const invite = await this.invitesRepo.findOne({
      where: { token },
      relations: {
        company: true,
        companyVertical: {
          company: true,
          vertical: true,
          verticalTenant: true,
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitación no encontrada');
    }

    await this.saveIfExpired(invite);

    return {
      id: invite.id,
      email: invite.email,
      fullName: invite.fullName,
      status: invite.status,
      expiresAt: invite.expiresAt,
      company: invite.company,
      companyVertical: invite.companyVertical,
    };
  }

  async resend(id: string, dto: ResendInviteDto) {
    const invite = await this.findById(id);

    if (invite.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException(
        'No puedes reenviar una invitación ya aceptada',
      );
    }

    if (invite.status === InviteStatus.REVOKED) {
      throw new BadRequestException(
        'No puedes reenviar una invitación revocada',
      );
    }

    invite.status = InviteStatus.PENDING;
    invite.token = this.generateToken();
    invite.sentAt = new Date();
    invite.expiresAt = this.getDefaultExpirationDate();
    invite.statusReason = this.normalizeString(dto.reason);
    invite.resendCount += 1;

    if (dto.notes !== undefined) {
      invite.notes = this.normalizeString(dto.notes);
    }

    return this.invitesRepo.save(invite);
  }

  async revoke(id: string, dto: RevokeInviteDto) {
    const invite = await this.findById(id);

    if (invite.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException(
        'No puedes revocar una invitación ya aceptada',
      );
    }

    if (invite.status === InviteStatus.REVOKED) {
      throw new BadRequestException('La invitación ya está revocada');
    }

    invite.status = InviteStatus.REVOKED;
    invite.revokedAt = new Date();
    invite.statusReason =
      this.normalizeString(dto.reason) ?? 'Invitación revocada';

    if (dto.notes !== undefined) {
      invite.notes = this.normalizeString(dto.notes);
    }

    return this.invitesRepo.save(invite);
  }

  async accept(token: string, dto: AcceptInviteDto) {
    const invite = await this.invitesRepo.findOne({
      where: { token },
      relations: {
        companyVertical: {
          company: true,
          vertical: true,
          verticalTenant: true,
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitación no encontrada');
    }

    await this.saveIfExpired(invite);

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(
        'La invitación no está disponible para ser aceptada',
      );
    }

    const normalizedEmail = this.normalizeEmail(dto.email);

    if (normalizedEmail !== invite.email) {
      throw new BadRequestException(
        'El email ingresado no coincide con el email invitado',
      );
    }

    const companyVertical = await this.companyVerticalsService.findById(
      invite.companyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'La relación company-vertical debe estar activa para aceptar la invitación',
      );
    }

    const verticalTenant = companyVertical.verticalTenant
      ? await this.verticalTenantsService.findById(
          companyVertical.verticalTenant.id,
        )
      : null;

    if (!verticalTenant) {
      throw new BadRequestException(
        'Aún no existe tenant técnico para este vertical',
      );
    }

    if (verticalTenant.status !== VerticalTenantStatus.PROVISIONED) {
      throw new BadRequestException(
        'El tenant técnico aún no está provisionado',
      );
    }

    const existingUser = await this.platformUsersService.findByEmail(
      normalizedEmail,
    );

    if (existingUser) {
      if (existingUser.status !== PlatformUserStatus.ACTIVE) {
        throw new BadRequestException(
          'Ya existe un usuario con este email, pero no está activo',
        );
      }

      invite.acceptedUserId = existingUser.id;
    } else {
      const newUser = await this.platformUsersService.createFromInvite({
        email: normalizedEmail,
        password: dto.password,
        fullName:
          this.normalizeString(dto.fullName) ??
          invite.fullName ??
          normalizedEmail,
      });

      invite.acceptedUserId = newUser.id;
    }

    await this.platformUserRolesService.assignByRoleKey({
      platformUserId: invite.acceptedUserId,
      platformRoleKey: invite.platformRoleKey,
      companyVerticalId: invite.companyVerticalId,
      reason: 'Asignación automática por aceptación de invitación',
      notes: invite.notes ?? undefined,
    });

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    invite.statusReason = 'Invitación aceptada';

    return this.invitesRepo.save(invite);
  }
}