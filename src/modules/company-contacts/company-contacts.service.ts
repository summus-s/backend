import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyContactEntity } from './entities/company-contact.entity';
import { CreateCompanyContactDto } from './dto/create-company-contact.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';
import { QueryCompanyContactsDto } from './dto/query-company-contacts.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class CompanyContactsService {
  constructor(
    @InjectRepository(CompanyContactEntity)
    private readonly companyContactsRepo: Repository<CompanyContactEntity>,
    private readonly companiesService: CompaniesService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeEmail(value?: string | null): string | null {
    const normalized = value?.trim().toLowerCase();
    return normalized ? normalized : null;
  }

  private async ensureUniqueEmailPerCompany(
    companyId: string,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      return;
    }

    const existing = await this.companyContactsRepo.findOne({
      where: {
        companyId,
        email: normalizedEmail,
      },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'Ya existe un contacto con ese correo en esta empresa',
      );
    }
  }

  private async clearPrimaryFromOtherContacts(
    companyId: string,
    excludeId?: string,
  ): Promise<void> {
    const contacts = await this.companyContactsRepo.find({
      where: { companyId },
    });

    const contactsToUpdate = contacts.filter(
      (contact) => contact.isPrimary && contact.id !== excludeId,
    );

    if (!contactsToUpdate.length) {
      return;
    }

    for (const contact of contactsToUpdate) {
      contact.isPrimary = false;
    }

    await this.companyContactsRepo.save(contactsToUpdate);
  }

  async create(createDto: CreateCompanyContactDto) {
    await this.companiesService.findById(createDto.companyId);

    const normalizedEmail = this.normalizeEmail(createDto.email);
    if (!normalizedEmail) {
      throw new BadRequestException('El correo es obligatorio');
    }

    await this.ensureUniqueEmailPerCompany(
      createDto.companyId,
      normalizedEmail,
    );

    const isPrimary = createDto.isPrimary ?? false;

    if (isPrimary) {
      await this.clearPrimaryFromOtherContacts(createDto.companyId);
    }

    const contact = this.companyContactsRepo.create({
      companyId: createDto.companyId,
      fullName: createDto.fullName.trim(),
      email: normalizedEmail,
      phone: this.normalizeString(createDto.phone),
      position: this.normalizeString(createDto.position),
      department: this.normalizeString(createDto.department),
      isPrimary,
      notes: this.normalizeString(createDto.notes),
    });

    return this.companyContactsRepo.save(contact);
  }

  async findAll(queryDto: QueryCompanyContactsDto) {
    const query = this.companyContactsRepo
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.company', 'company');

    if (queryDto.companyId) {
      query.andWhere('contact.companyId = :companyId', {
        companyId: queryDto.companyId,
      });
    }

    if (queryDto.email) {
      query.andWhere('LOWER(contact.email) = :email', {
        email: queryDto.email.trim().toLowerCase(),
      });
    }

    if (queryDto.isPrimary !== undefined) {
      query.andWhere('contact.isPrimary = :isPrimary', {
        isPrimary: queryDto.isPrimary === 'true',
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          contact.fullName ILIKE :search
          OR contact.email ILIKE :search
          OR contact.phone ILIKE :search
          OR contact.position ILIKE :search
          OR contact.department ILIKE :search
          OR company.name ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query.orderBy('contact.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: string) {
    const contact = await this.companyContactsRepo.findOne({
      where: { id },
      relations: {
        company: true,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contacto no encontrado');
    }

    return contact;
  }

  async findByCompanyId(companyId: string) {
    await this.companiesService.findById(companyId);

    return this.companyContactsRepo.find({
      where: { companyId },
      order: {
        isPrimary: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async update(id: string, updateDto: UpdateCompanyContactDto) {
    const contact = await this.findById(id);

    const nextCompanyId =
      updateDto.companyId !== undefined ? updateDto.companyId : contact.companyId;

    if (updateDto.companyId !== undefined) {
      await this.companiesService.findById(updateDto.companyId);
    }

    const nextEmail =
      updateDto.email !== undefined
        ? this.normalizeEmail(updateDto.email)
        : contact.email;

    if (!nextEmail) {
      throw new BadRequestException('El correo es obligatorio');
    }

    await this.ensureUniqueEmailPerCompany(nextCompanyId, nextEmail, contact.id);

    const nextIsPrimary =
      updateDto.isPrimary !== undefined ? updateDto.isPrimary : contact.isPrimary;

    if (nextIsPrimary) {
      await this.clearPrimaryFromOtherContacts(nextCompanyId, contact.id);
    }

    if (updateDto.companyId !== undefined) {
      contact.companyId = updateDto.companyId;
    }

    if (updateDto.fullName !== undefined) {
      contact.fullName = updateDto.fullName.trim();
    }

    if (updateDto.email !== undefined) {
      contact.email = nextEmail;
    }

    if (updateDto.phone !== undefined) {
      contact.phone = this.normalizeString(updateDto.phone);
    }

    if (updateDto.position !== undefined) {
      contact.position = this.normalizeString(updateDto.position);
    }

    if (updateDto.department !== undefined) {
      contact.department = this.normalizeString(updateDto.department);
    }

    if (updateDto.isPrimary !== undefined) {
      contact.isPrimary = updateDto.isPrimary;
    }

    if (updateDto.notes !== undefined) {
      contact.notes = this.normalizeString(updateDto.notes);
    }

    return this.companyContactsRepo.save(contact);
  }

  async remove(id: string) {
    const contact = await this.findById(id);

    await this.companyContactsRepo.remove(contact);

    return {
      message: 'Contacto eliminado correctamente',
    };
  }
}