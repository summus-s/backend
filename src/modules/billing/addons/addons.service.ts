import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AddonEntity } from './entities/addon.entity';
import { CreateAddonDto } from './dtos/create-addon.dto';
import { UpdateAddonDto } from './dtos/update-addon.dto';

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(AddonEntity)
    private readonly repo: Repository<AddonEntity>,
  ) {}

  async create(dto: CreateAddonDto) {
    const key = dto.key.trim().toUpperCase();
    const verticalId = dto.verticalId ?? null;

    const where = verticalId
    ? { verticalId, key }
    : { verticalId: IsNull(), key };

    const exists = await this.repo.findOne({ where });
    if (exists) throw new BadRequestException('Addon already exists for this vertical');

    const addon = this.repo.create({
      verticalId,
      key,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      price: dto.price,
      currency: (dto.currency ?? 'USD').trim().toUpperCase(),
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(addon);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Addon not found');
    return a;
  }

  async update(id: string, dto: UpdateAddonDto) {
    const a = await this.findOne(id);

    if (dto.key) a.key = dto.key.trim().toUpperCase();
    if (dto.name) a.name = dto.name.trim();
    if (dto.description !== undefined) a.description = dto.description?.trim() ?? null;
    if (dto.price) a.price = dto.price;
    if (dto.currency) a.currency = dto.currency.trim().toUpperCase();
    if (dto.isActive !== undefined) a.isActive = dto.isActive;

    return this.repo.save(a);
  }

  async deactivate(id: string) {
    const a = await this.findOne(id);
    a.isActive = false;
    return this.repo.save(a);
  }
}
