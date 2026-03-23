import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyVerticalEntity } from './entities/company-vertical.entity';
import { CreateCompanyVerticalDto } from './dto/create-company-vertical.dto';
import { UpdateCompanyVerticalDto } from './dto/update-company-vertical.dto';
import { QueryCompanyVerticalsDto } from './dto/query-company-verticals.dto';
import { SuspendCompanyVerticalDto } from './dto/suspend-company-vertical.dto';
import { CancelCompanyVerticalDto } from './dto/cancel-company-vertical.dto';
import { ActivateCompanyVerticalDto } from './dto/activate-company-vertical.dto';
import { ReactivateCompanyVerticalDto } from './dto/reactivate-company-vertical.dto';
import { CompanyVerticalStatus } from './enums/company-vertical-status.enum';
import { CompaniesService } from '../companies/companies.service';
import { CompanyStatus } from '../companies/enums/company-status.enum';
import { VerticalsService } from '../catalog/verticals/verticals.service';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class CompanyVerticalsService {
  constructor(
    @InjectRepository(CompanyVerticalEntity)
    private readonly companyVerticalsRepo: Repository<CompanyVerticalEntity>,
    private readonly companiesService: CompaniesService,
    private readonly verticalsService: VerticalsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  private validateDateRange(startsAt?: string | null, endsAt?: string | null) {
    if (!startsAt || !endsAt) {
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (endDate < startDate) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser menor que la fecha de inicio',
      );
    }
  }

  private async ensureCompanyAndVerticalAreValid(
    companyId: string,
    verticalId: string,
  ) {
    const company = await this.companiesService.findById(companyId);

    if (company.status === CompanyStatus.DELETED) {
      throw new BadRequestException(
        'No puedes asociar un vertical a una empresa eliminada',
      );
    }

    if (company.status === CompanyStatus.SUSPENDED) {
      throw new BadRequestException(
        'No puedes asociar un vertical a una empresa suspendida',
      );
    }

    const vertical = await this.verticalsService.findById(verticalId);

    if (!vertical.isActive) {
      throw new BadRequestException(
        'No puedes asociar una empresa a un vertical inactivo',
      );
    }
  }

  private async ensureUniqueCompanyVertical(
    companyId: string,
    verticalId: string,
    excludeId?: string,
  ) {
    const existing = await this.companyVerticalsRepo.findOne({
      where: {
        companyId,
        verticalId,
      },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'La empresa ya tiene registrada una contratación para este vertical',
      );
    }
  }

  async create(createDto: CreateCompanyVerticalDto) {
    this.validateDateRange(createDto.startsAt, createDto.endsAt);

    await this.ensureCompanyAndVerticalAreValid(
      createDto.companyId,
      createDto.verticalId,
    );

    await this.ensureUniqueCompanyVertical(
      createDto.companyId,
      createDto.verticalId,
    );

    const companyVertical = this.companyVerticalsRepo.create({
      companyId: createDto.companyId,
      verticalId: createDto.verticalId,
      status: CompanyVerticalStatus.PENDING,
      statusReason: null,
      planName: this.normalizeString(createDto.planName),
      billingCycle: createDto.billingCycle ?? null,
      startsAt: this.parseDate(createDto.startsAt),
      endsAt: this.parseDate(createDto.endsAt),
      activatedAt: null,
      suspendedAt: null,
      cancelledAt: null,
      notes: this.normalizeString(createDto.notes),
    });

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async findAll(queryDto: QueryCompanyVerticalsDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.companyVerticalsRepo
      .createQueryBuilder('companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical')
      .leftJoinAndSelect('companyVertical.verticalTenant', 'verticalTenant')
      .leftJoinAndSelect('companyVertical.subscription', 'subscription');

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
      query.andWhere('companyVertical.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          company.name ILIKE :search
          OR company.legalName ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
          OR companyVertical.planName ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query.orderBy('companyVertical.createdAt', 'DESC');
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
    const companyVertical = await this.companyVerticalsRepo.findOne({
      where: { id },
      relations: {
        company: true,
        vertical: true,
        verticalTenant: true,
        subscription: true,
        invites: true,
      },
    });

    if (!companyVertical) {
      throw new NotFoundException('Registro company-vertical no encontrado');
    }

    return companyVertical;
  }

  async findByCompanyId(companyId: string) {
    await this.companiesService.findById(companyId);

    return this.companyVerticalsRepo.find({
      where: { companyId },
      relations: {
        vertical: true,
        verticalTenant: true,
        subscription: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByVerticalId(verticalId: string) {
    await this.verticalsService.findById(verticalId);

    return this.companyVerticalsRepo.find({
      where: { verticalId },
      relations: {
        company: true,
        verticalTenant: true,
        subscription: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(id: string, updateDto: UpdateCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes editar una contratación cancelada',
      );
    }

    const nextCompanyId =
      updateDto.companyId !== undefined
        ? updateDto.companyId
        : companyVertical.companyId;

    const nextVerticalId =
      updateDto.verticalId !== undefined
        ? updateDto.verticalId
        : companyVertical.verticalId;

    const nextStartsAt =
      updateDto.startsAt !== undefined
        ? updateDto.startsAt
        : companyVertical.startsAt?.toISOString() ?? null;

    const nextEndsAt =
      updateDto.endsAt !== undefined
        ? updateDto.endsAt
        : companyVertical.endsAt?.toISOString() ?? null;

    this.validateDateRange(nextStartsAt, nextEndsAt);

    await this.ensureCompanyAndVerticalAreValid(nextCompanyId, nextVerticalId);

    await this.ensureUniqueCompanyVertical(
      nextCompanyId,
      nextVerticalId,
      companyVertical.id,
    );

    if (updateDto.companyId !== undefined) {
      companyVertical.companyId = updateDto.companyId;
    }

    if (updateDto.verticalId !== undefined) {
      companyVertical.verticalId = updateDto.verticalId;
    }

    if (updateDto.planName !== undefined) {
      companyVertical.planName = this.normalizeString(updateDto.planName);
    }

    if (updateDto.billingCycle !== undefined) {
      companyVertical.billingCycle = updateDto.billingCycle ?? null;
    }

    if (updateDto.startsAt !== undefined) {
      companyVertical.startsAt = this.parseDate(updateDto.startsAt);
    }

    if (updateDto.endsAt !== undefined) {
      companyVertical.endsAt = this.parseDate(updateDto.endsAt);
    }

    if (updateDto.notes !== undefined) {
      companyVertical.notes = this.normalizeString(updateDto.notes);
    }

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async activate(id: string, activateDto: ActivateCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes activar una contratación cancelada',
      );
    }

    companyVertical.status = CompanyVerticalStatus.ACTIVE;
    companyVertical.statusReason = this.normalizeString(activateDto.reason);
    companyVertical.activatedAt = new Date();
    companyVertical.suspendedAt = null;

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async suspend(id: string, suspendDto: SuspendCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes suspender una contratación cancelada',
      );
    }

    companyVertical.status = CompanyVerticalStatus.SUSPENDED;
    companyVertical.statusReason = this.normalizeString(suspendDto.reason);
    companyVertical.suspendedAt = new Date();

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async cancel(id: string, cancelDto: CancelCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'La contratación ya se encuentra cancelada',
      );
    }

    companyVertical.status = CompanyVerticalStatus.CANCELLED;
    companyVertical.statusReason = this.normalizeString(cancelDto.reason);
    companyVertical.cancelledAt = new Date();

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async reactivate(id: string, reactivateDto: ReactivateCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes reactivar una contratación cancelada. Debes crear una nueva relación company-vertical',
      );
    }

    companyVertical.status = CompanyVerticalStatus.ACTIVE;
    companyVertical.statusReason = this.normalizeString(reactivateDto.reason);
    companyVertical.activatedAt = new Date();
    companyVertical.suspendedAt = null;

    return this.companyVerticalsRepo.save(companyVertical);
  }
}