import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { SuspendCompanyDto } from './dto/suspend-company.dto';
import { CompanyStatus } from './enums/company-status.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companiesRepo: Repository<CompanyEntity>,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeEmail(value?: string | null): string | null {
    const normalized = value?.trim().toLowerCase();
    return normalized ? normalized : null;
  }

  private async ensureCompanyDoesNotExist(
    name: string,
    taxId?: string | null,
    email?: string | null,
    excludeId?: string,
  ): Promise<void> {
    const normalizedName = this.normalizeString(name);
    const normalizedTaxId = this.normalizeString(taxId);
    const normalizedEmail = this.normalizeEmail(email);

    if (normalizedTaxId) {
      const existingByTaxId = await this.companiesRepo.findOne({
        where: { taxId: normalizedTaxId },
      });

      if (existingByTaxId && existingByTaxId.id !== excludeId) {
        throw new BadRequestException(
          'Ya existe una empresa con ese NIT o identificación fiscal',
        );
      }
    }

    if (normalizedName && normalizedEmail) {
      const existingByName = await this.companiesRepo.find({
        where: { name: normalizedName },
      });

      const duplicated = existingByName.find(
        (company) =>
          company.id !== excludeId &&
          company.email?.trim().toLowerCase() === normalizedEmail,
      );

      if (duplicated) {
        throw new BadRequestException(
          'Ya existe una empresa con el mismo nombre y correo',
        );
      }
    }
  }

  async create(createDto: CreateCompanyDto) {
    const normalizedName = createDto.name.trim();
    const normalizedTaxId = this.normalizeString(createDto.taxId);
    const normalizedEmail = this.normalizeEmail(createDto.email);

    await this.ensureCompanyDoesNotExist(
      normalizedName,
      normalizedTaxId,
      normalizedEmail,
    );

    const company = this.companiesRepo.create({
      name: normalizedName,
      legalName: this.normalizeString(createDto.legalName),
      taxId: normalizedTaxId,
      email: normalizedEmail,
      phone: this.normalizeString(createDto.phone),
      country: this.normalizeString(createDto.country),
      city: this.normalizeString(createDto.city),
      address: this.normalizeString(createDto.address),
      notes: this.normalizeString(createDto.notes),
      status: CompanyStatus.ACTIVE,
    });

    return this.companiesRepo.save(company);
  }

  async findAll(queryDto: QueryCompaniesDto) {
    const query = this.companiesRepo.createQueryBuilder('company');

    if (queryDto.status) {
      query.where('company.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.search?.trim()) {
      const searchCondition = `(
        company.name ILIKE :search
        OR company.legalName ILIKE :search
        OR company.taxId ILIKE :search
        OR company.email ILIKE :search
      )`;

      if (queryDto.status) {
        query.andWhere(searchCondition, {
          search: `%${queryDto.search.trim()}%`,
        });
      } else {
        query.where(searchCondition, {
          search: `%${queryDto.search.trim()}%`,
        });
      }
    }

    query.orderBy('company.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: string) {
    const company = await this.companiesRepo.findOne({
      where: { id },
    });

    if (!company || company.status === CompanyStatus.DELETED) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return company;
  }

  async update(id: string, updateDto: UpdateCompanyDto) {
    const company = await this.findById(id);

    const nextName =
      updateDto.name !== undefined ? updateDto.name.trim() : company.name;

    const nextTaxId =
      updateDto.taxId !== undefined
        ? this.normalizeString(updateDto.taxId)
        : company.taxId;

    const nextEmail =
      updateDto.email !== undefined
        ? this.normalizeEmail(updateDto.email)
        : company.email;

    await this.ensureCompanyDoesNotExist(
      nextName,
      nextTaxId,
      nextEmail,
      company.id,
    );

    if (updateDto.name !== undefined) {
      company.name = updateDto.name.trim();
    }

    if (updateDto.legalName !== undefined) {
      company.legalName = this.normalizeString(updateDto.legalName);
    }

    if (updateDto.taxId !== undefined) {
      company.taxId = this.normalizeString(updateDto.taxId);
    }

    if (updateDto.email !== undefined) {
      company.email = this.normalizeEmail(updateDto.email);
    }

    if (updateDto.phone !== undefined) {
      company.phone = this.normalizeString(updateDto.phone);
    }

    if (updateDto.country !== undefined) {
      company.country = this.normalizeString(updateDto.country);
    }

    if (updateDto.city !== undefined) {
      company.city = this.normalizeString(updateDto.city);
    }

    if (updateDto.address !== undefined) {
      company.address = this.normalizeString(updateDto.address);
    }

    if (updateDto.notes !== undefined) {
      company.notes = this.normalizeString(updateDto.notes);
    }

    return this.companiesRepo.save(company);
  }

  async suspend(id: string, _suspendDto: SuspendCompanyDto) {
    const company = await this.findById(id);
    company.status = CompanyStatus.SUSPENDED;

    return this.companiesRepo.save(company);
  }

  async activate(id: string) {
    const company = await this.findById(id);
    company.status = CompanyStatus.ACTIVE;

    return this.companiesRepo.save(company);
  }

  async restore(id: string) {
    const company = await this.companiesRepo.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    company.status = CompanyStatus.ACTIVE;

    return this.companiesRepo.save(company);
  }

  async remove(id: string) {
    const company = await this.findById(id);
    company.status = CompanyStatus.DELETED;

    await this.companiesRepo.save(company);

    return {
      message: 'Empresa eliminada correctamente',
    };
  }
}