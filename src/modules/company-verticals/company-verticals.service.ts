import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CompanyVerticalEntity,
  CompanyVerticalStatus,
} from './entities/company-vertical.entity';
import { CreateCompanyVerticalDto } from './dtos/create-company-vertical.dto';
import { UpdateCompanyVerticalDto } from './dtos/update-company-vertical.dto';

@Injectable()
export class CompanyVerticalsService {
  constructor(
    @InjectRepository(CompanyVerticalEntity)
    private readonly repo: Repository<CompanyVerticalEntity>,
  ) {}

  async create(dto: CreateCompanyVerticalDto) {
    const exists = await this.repo.findOne({
      where: { companyId: dto.companyId, verticalId: dto.verticalId },
    });
    if (exists) {
      throw new BadRequestException('Company already has this vertical');
    }

    const cv = this.repo.create({
      companyId: dto.companyId,
      verticalId: dto.verticalId,
      status: CompanyVerticalStatus.PENDING,
    });

    return this.repo.save(cv);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const cv = await this.repo.findOne({ where: { id } });
    if (!cv) throw new NotFoundException('CompanyVertical not found');
    return cv;
  }

  async update(id: string, dto: UpdateCompanyVerticalDto) {
    const cv = await this.findOne(id);

    if (dto.status) {
      cv.status = dto.status;

      if (dto.status === CompanyVerticalStatus.ACTIVE) {
        cv.activatedAt = new Date();
        cv.suspendedAt = null;
        cv.suspendedReason = null;
      }

      if (dto.status === CompanyVerticalStatus.SUSPENDED) {
        cv.suspendedAt = new Date();
      }
    }

    if (dto.suspendedReason !== undefined) {
      if (cv.status !== CompanyVerticalStatus.SUSPENDED) {
        throw new BadRequestException(
          'suspendedReason only allowed when status=SUSPENDED',
        );
      }
      cv.suspendedReason = dto.suspendedReason?.trim() ?? null;
    }

    return this.repo.save(cv);
  }
}
