import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyVerticalAddonEntity } from './entities/company-vertical-addon.entity';
import { EnableAddonDto } from './dtos/enable-addon.dto';
import { DisableAddonDto } from './dtos/disable-addon.dto';
import { AddonEntity } from '../addons/entities/addon.entity';

@Injectable()
export class CompanyAddonsService {
  constructor(
    @InjectRepository(CompanyVerticalAddonEntity)
    private readonly repo: Repository<CompanyVerticalAddonEntity>,
    @InjectRepository(AddonEntity)
    private readonly addonsRepo: Repository<AddonEntity>,
  ) {}

  async enable(dto: EnableAddonDto) {
    const addon = await this.addonsRepo.findOne({ where: { id: dto.addonId } });
    if (!addon || !addon.isActive) throw new NotFoundException('Addon not available');

    const exists = await this.repo.findOne({
      where: { companyVerticalId: dto.companyVerticalId, addonId: dto.addonId },
    });

    if (!exists) {
      const row = this.repo.create({
        companyVerticalId: dto.companyVerticalId,
        addonId: dto.addonId,
        isEnabled: true,
        enabledAt: new Date(),
        disabledAt: null,
        source: dto.source ?? 'PURCHASE',
      });
      return this.repo.save(row);
    }

    // si ya existe, lo re-habilitamos
    exists.isEnabled = true;
    exists.enabledAt = new Date();
    exists.disabledAt = null;
    if (dto.source) exists.source = dto.source;

    return this.repo.save(exists);
  }

  async disable(dto: DisableAddonDto) {
    const row = await this.repo.findOne({
      where: { companyVerticalId: dto.companyVerticalId, addonId: dto.addonId },
    });

    if (!row) throw new NotFoundException('Addon assignment not found');

    row.isEnabled = false;
    row.disabledAt = new Date();
    return this.repo.save(row);
  }

  listByCompanyVertical(companyVerticalId: string) {
    return this.repo.find({
      where: { companyVerticalId },
      order: { createdAt: 'DESC' },
    });
  }

  async enableFromOrder(params: {
    companyVerticalId: string;
    addonId: string;
    source?: string;
  }) {
    const addon = await this.addonsRepo.findOne({
      where: { id: params.addonId, isActive: true },
    });

    if (!addon) {
      throw new Error('Addon not available');
    }

    let row = await this.repo.findOne({
      where: {
        companyVerticalId: params.companyVerticalId,
        addonId: params.addonId,
      },
    });

    if (!row) {
      row = this.repo.create({
        companyVerticalId: params.companyVerticalId,
        addonId: params.addonId,
        isEnabled: true,
        enabledAt: new Date(),
        disabledAt: null,
        source: params.source ?? 'PURCHASE',
      });
    } else {
      row.isEnabled = true;
      row.enabledAt = new Date();
      row.disabledAt = null;
      row.source = params.source ?? row.source;
    }

    return this.repo.save(row);
  }

}
