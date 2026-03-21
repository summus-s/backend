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
import { CompanyVerticalStatus } from './enums/company-vertical-status.enum';
import { ProvisioningStatus } from './enums/provisioning-status.enum';
import { CompaniesService } from '../companies/companies.service';
import { CompanyStatus } from '../companies/enums/company-status.enum';
import { VerticalsService } from '../catalog/verticals/verticals.service';

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

    await this.verticalsService.findById(verticalId);
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
      planName: this.normalizeString(createDto.planName),
      billingCycle: createDto.billingCycle ?? null,
      startsAt: createDto.startsAt ? new Date(createDto.startsAt) : null,
      endsAt: createDto.endsAt ? new Date(createDto.endsAt) : null,
      provisioningStatus: ProvisioningStatus.NOT_SENT,
      notes: this.normalizeString(createDto.notes),
    });

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async findAll(queryDto: QueryCompanyVerticalsDto) {
    const query = this.companyVerticalsRepo
      .createQueryBuilder('companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical');

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

    if (queryDto.provisioningStatus) {
      query.andWhere('companyVertical.provisioningStatus = :provisioningStatus', {
        provisioningStatus: queryDto.provisioningStatus,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          company.name ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
          OR companyVertical.planName ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query.orderBy('companyVertical.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: string) {
    const companyVertical = await this.companyVerticalsRepo.findOne({
      where: { id },
      relations: {
        company: true,
        vertical: true,
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
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(id: string, updateDto: UpdateCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    const nextCompanyId =
      updateDto.companyId !== undefined
        ? updateDto.companyId
        : companyVertical.companyId;

    const nextVerticalId =
      updateDto.verticalId !== undefined
        ? updateDto.verticalId
        : companyVertical.verticalId;

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
      companyVertical.startsAt = updateDto.startsAt
        ? new Date(updateDto.startsAt)
        : null;
    }

    if (updateDto.endsAt !== undefined) {
      companyVertical.endsAt = updateDto.endsAt
        ? new Date(updateDto.endsAt)
        : null;
    }

    if (updateDto.notes !== undefined) {
      companyVertical.notes = this.normalizeString(updateDto.notes);
    }

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async activate(id: string) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes activar una contratación cancelada',
      );
    }

    companyVertical.status = CompanyVerticalStatus.ACTIVE;

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async suspend(id: string, _suspendDto: SuspendCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    if (companyVertical.status === CompanyVerticalStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes suspender una contratación cancelada',
      );
    }

    companyVertical.status = CompanyVerticalStatus.SUSPENDED;

    return this.companyVerticalsRepo.save(companyVertical);
  }

  async cancel(id: string, _cancelDto: CancelCompanyVerticalDto) {
    const companyVertical = await this.findById(id);

    companyVertical.status = CompanyVerticalStatus.CANCELLED;

    return this.companyVerticalsRepo.save(companyVertical);
  }
}