import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerticalTenantEntity } from './entities/vertical-tenant.entity';
import { VerticalTenantStatus } from './enums/vertical-tenant-status.enum';
import { CreateVerticalTenantDto } from './dto/create-vertical-tenant.dto';
import { UpdateVerticalTenantDto } from './dto/update-vertical-tenant.dto';
import { QueryVerticalTenantsDto } from './dto/query-vertical-tenants.dto';
import { MarkProvisioningDto } from './dto/mark-provisioning.dto';
import { MarkProvisionedDto } from './dto/mark-provisioned.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { SuspendVerticalTenantDto } from './dto/suspend-vertical-tenant.dto';
import { CompanyVerticalsService } from '../company-verticals/company-verticals.service';
import { CompanyVerticalStatus } from '../company-verticals/enums/company-vertical-status.enum';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class VerticalTenantsService {
  constructor(
    @InjectRepository(VerticalTenantEntity)
    private readonly verticalTenantsRepo: Repository<VerticalTenantEntity>,
    private readonly companyVerticalsService: CompanyVerticalsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private mergeNotes(
    currentNotes: string | null,
    incomingNotes?: string | null,
  ): string | null {
    if (incomingNotes === undefined) {
      return currentNotes;
    }

    return this.normalizeString(incomingNotes);
  }

  private async ensureCompanyVerticalCanHaveTenant(companyVerticalId: string) {
    const companyVertical =
      await this.companyVerticalsService.findById(companyVerticalId);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes crear un tenant técnico para una relación company-vertical cancelada',
      );
    }

    return companyVertical;
  }

  private async ensureUniqueByCompanyVertical(
    companyVerticalId: string,
    excludeId?: string,
  ) {
    const existing = await this.verticalTenantsRepo.findOne({
      where: { companyVerticalId },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'Ya existe un vertical-tenant para este company-vertical',
      );
    }
  }

  async create(createDto: CreateVerticalTenantDto) {
    await this.ensureCompanyVerticalCanHaveTenant(createDto.companyVerticalId);
    await this.ensureUniqueByCompanyVertical(createDto.companyVerticalId);

    const verticalTenant = this.verticalTenantsRepo.create({
      companyVerticalId: createDto.companyVerticalId,
      status: VerticalTenantStatus.PENDING,
      externalTenantId: null,
      externalCompanyId: null,
      externalWorkspaceId: null,
      externalUrl: null,
      syncReference: this.normalizeString(createDto.syncReference),
      lastRequestPayload: null,
      lastResponsePayload: null,
      lastErrorCode: null,
      lastErrorMessage: null,
      provisioningAttempts: 0,
      lastAttemptAt: null,
      provisionedAt: null,
      suspendedAt: null,
      notes: this.normalizeString(createDto.notes),
    });

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async findAll(queryDto: QueryVerticalTenantsDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.verticalTenantsRepo
      .createQueryBuilder('verticalTenant')
      .leftJoinAndSelect('verticalTenant.companyVertical', 'companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical');

    if (queryDto.companyVerticalId) {
      query.andWhere('verticalTenant.companyVerticalId = :companyVerticalId', {
        companyVerticalId: queryDto.companyVerticalId,
      });
    }

    if (queryDto.companyId) {
      query.andWhere('companyVertical.companyId = :companyId', {
        companyId: queryDto.companyId,
      });
    }

    if (queryDto.verticalId) {
      query.andWhere('companyVertical.verticalId = :verticalId', {
        verticalId: queryDto.verticalId,
      });
    }

    if (queryDto.status) {
      query.andWhere('verticalTenant.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.syncReference?.trim()) {
      query.andWhere('verticalTenant.syncReference ILIKE :syncReference', {
        syncReference: `%${queryDto.syncReference.trim()}%`,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          company.name ILIKE :search
          OR company.legalName ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
          OR verticalTenant.externalTenantId ILIKE :search
          OR verticalTenant.externalCompanyId ILIKE :search
          OR verticalTenant.syncReference ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query.orderBy('verticalTenant.createdAt', 'DESC');
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
    const verticalTenant = await this.verticalTenantsRepo.findOne({
      where: { id },
      relations: {
        companyVertical: {
          company: true,
          vertical: true,
        },
      },
    });

    if (!verticalTenant) {
      throw new NotFoundException('Vertical tenant no encontrado');
    }

    return verticalTenant;
  }

  async update(id: string, updateDto: UpdateVerticalTenantDto) {
    const verticalTenant = await this.findById(id);

    if (verticalTenant.status === VerticalTenantStatus.PROVISIONED) {
      if (
        updateDto.externalTenantId === undefined &&
        updateDto.externalCompanyId === undefined &&
        updateDto.externalWorkspaceId === undefined &&
        updateDto.externalUrl === undefined &&
        updateDto.syncReference === undefined &&
        updateDto.notes === undefined
      ) {
        return verticalTenant;
      }
    }

    if (updateDto.externalTenantId !== undefined) {
      verticalTenant.externalTenantId = this.normalizeString(
        updateDto.externalTenantId,
      );
    }

    if (updateDto.externalCompanyId !== undefined) {
      verticalTenant.externalCompanyId = this.normalizeString(
        updateDto.externalCompanyId,
      );
    }

    if (updateDto.externalWorkspaceId !== undefined) {
      verticalTenant.externalWorkspaceId = this.normalizeString(
        updateDto.externalWorkspaceId,
      );
    }

    if (updateDto.externalUrl !== undefined) {
      verticalTenant.externalUrl = this.normalizeString(updateDto.externalUrl);
    }

    if (updateDto.syncReference !== undefined) {
      verticalTenant.syncReference = this.normalizeString(
        updateDto.syncReference,
      );
    }

    if (updateDto.notes !== undefined) {
      verticalTenant.notes = this.normalizeString(updateDto.notes);
    }

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async markProvisioning(id: string, dto: MarkProvisioningDto) {
    const verticalTenant = await this.findById(id);

    if (verticalTenant.status === VerticalTenantStatus.SUSPENDED) {
      throw new BadRequestException(
        'No puedes iniciar provisioning sobre un tenant técnico suspendido',
      );
    }

    await this.ensureCompanyVerticalCanHaveTenant(
      verticalTenant.companyVerticalId,
    );

    verticalTenant.status = VerticalTenantStatus.PROVISIONING;
    verticalTenant.provisioningAttempts += 1;
    verticalTenant.lastAttemptAt = new Date();
    verticalTenant.lastErrorCode = null;
    verticalTenant.lastErrorMessage = null;
    verticalTenant.suspendedAt = null;

    if (dto.syncReference !== undefined) {
      verticalTenant.syncReference = this.normalizeString(dto.syncReference);
    }

    if (dto.notes !== undefined) {
      verticalTenant.notes = this.normalizeString(dto.notes);
    }

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async markProvisioned(id: string, dto: MarkProvisionedDto) {
    const verticalTenant = await this.findById(id);

    await this.ensureCompanyVerticalCanHaveTenant(
      verticalTenant.companyVerticalId,
    );

    verticalTenant.status = VerticalTenantStatus.PROVISIONED;
    verticalTenant.externalTenantId =
      this.normalizeString(dto.externalTenantId) ??
      verticalTenant.externalTenantId;
    verticalTenant.externalCompanyId =
      this.normalizeString(dto.externalCompanyId) ??
      verticalTenant.externalCompanyId;
    verticalTenant.externalWorkspaceId =
      this.normalizeString(dto.externalWorkspaceId) ??
      verticalTenant.externalWorkspaceId;
    verticalTenant.externalUrl =
      this.normalizeString(dto.externalUrl) ?? verticalTenant.externalUrl;
    verticalTenant.syncReference =
      this.normalizeString(dto.syncReference) ?? verticalTenant.syncReference;
    verticalTenant.lastErrorCode = null;
    verticalTenant.lastErrorMessage = null;
    verticalTenant.provisionedAt = new Date();
    verticalTenant.suspendedAt = null;

    if (dto.notes !== undefined) {
      verticalTenant.notes = this.normalizeString(dto.notes);
    }

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async markFailed(id: string, dto: MarkFailedDto) {
    const verticalTenant = await this.findById(id);

    if (verticalTenant.status === VerticalTenantStatus.SUSPENDED) {
      throw new BadRequestException(
        'No puedes marcar como fallido un tenant técnico suspendido',
      );
    }

    verticalTenant.status = VerticalTenantStatus.FAILED;
    verticalTenant.lastErrorCode = this.normalizeString(dto.errorCode);
    verticalTenant.lastErrorMessage = this.normalizeString(dto.errorMessage);
    verticalTenant.lastAttemptAt = new Date();

    if (dto.syncReference !== undefined) {
      verticalTenant.syncReference = this.normalizeString(dto.syncReference);
    }

    if (dto.notes !== undefined) {
      verticalTenant.notes = this.normalizeString(dto.notes);
    }

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async suspend(id: string, dto: SuspendVerticalTenantDto) {
    const verticalTenant = await this.findById(id);

    verticalTenant.status = VerticalTenantStatus.SUSPENDED;
    verticalTenant.suspendedAt = new Date();
    verticalTenant.notes = this.mergeNotes(verticalTenant.notes, dto.notes);

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async retry(id: string, dto: MarkProvisioningDto) {
    const verticalTenant = await this.findById(id);

    if (verticalTenant.status === VerticalTenantStatus.SUSPENDED) {
      throw new BadRequestException(
        'No puedes reintentar un tenant técnico suspendido',
      );
    }

    verticalTenant.status = VerticalTenantStatus.PROVISIONING;
    verticalTenant.provisioningAttempts += 1;
    verticalTenant.lastAttemptAt = new Date();
    verticalTenant.lastErrorCode = null;
    verticalTenant.lastErrorMessage = null;

    if (dto.syncReference !== undefined) {
      verticalTenant.syncReference = this.normalizeString(dto.syncReference);
    }

    if (dto.notes !== undefined) {
      verticalTenant.notes = this.normalizeString(dto.notes);
    }

    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async saveLastRequestPayload(id: string, payload: Record<string, unknown>) {
    const verticalTenant = await this.findById(id);
    verticalTenant.lastRequestPayload = payload;
    return this.verticalTenantsRepo.save(verticalTenant);
  }

  async saveLastResponsePayload(id: string, payload: Record<string, unknown>) {
    const verticalTenant = await this.findById(id);
    verticalTenant.lastResponsePayload = payload;
    return this.verticalTenantsRepo.save(verticalTenant);
  }
}