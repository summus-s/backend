import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity, CompanyStatus } from './entities/company.entity';
import { CompanySettingsEntity } from './entities/company-settings.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companiesRepo: Repository<CompanyEntity>,
    @InjectRepository(CompanySettingsEntity)
    private readonly settingsRepo: Repository<CompanySettingsEntity>,
  ) {}

  async create(dto: CreateCompanyDto) {
    const company = this.companiesRepo.create({
      type: dto.type,
      name: dto.name.trim(),
      legalName: dto.legalName?.trim() ?? null,
      taxId: dto.taxId?.trim() ?? null,
      status: CompanyStatus.ACTIVE,
      suspendedReason: null,
      deletedAt: null,
    });

    const saved = await this.companiesRepo.save(company);

    // ✅ crea settings 1:1
    const settings = this.settingsRepo.create({
      companyId: saved.id,
      timezone: null,
      currency: null,
      locale: null,
      defaultTaxIncluded: false,
      allowNegativeStock: false,
    });
    await this.settingsRepo.save(settings);

    return saved;
  }

  findAll() {
    return this.companiesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const c = await this.companiesRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Company not found');
    return c;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const c = await this.findOne(id);

    if (dto.type) c.type = dto.type;
    if (dto.name) c.name = dto.name.trim();
    if (dto.legalName !== undefined) c.legalName = dto.legalName?.trim() ?? null;
    if (dto.taxId !== undefined) c.taxId = dto.taxId?.trim() ?? null;

    if (dto.status) {
      c.status = dto.status;
      if (dto.status !== CompanyStatus.SUSPENDED) {
        c.suspendedReason = null;
      }
    }

    if (dto.suspendedReason !== undefined) {
      if (c.status !== CompanyStatus.SUSPENDED) {
        throw new BadRequestException('Solo puedes poner suspendedReason si status=SUSPENDED');
      }
      c.suspendedReason = dto.suspendedReason?.trim() ?? null;
    }

    return this.companiesRepo.save(c);
  }

  async deactivate(id: string) {
    const c = await this.findOne(id);
    c.status = CompanyStatus.SUSPENDED;
    c.suspendedReason = 'Deactivated by staff';
    return this.companiesRepo.save(c);
  }
}
