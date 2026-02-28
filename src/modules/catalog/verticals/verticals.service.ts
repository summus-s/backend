import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerticalEntity } from './entities/vertical.entity';
import { CreateVerticalDto } from './dtos/create-vertical.dto';
import { UpdateVerticalDto } from './dtos/update-vertical.dto';

@Injectable()
export class VerticalsService {
  constructor(
    @InjectRepository(VerticalEntity)
    private readonly repo: Repository<VerticalEntity>,
  ) {}

  async create(dto: CreateVerticalDto) {
    const key = dto.key.trim().toUpperCase();

    const exists = await this.repo.findOne({ where: { key } });
    if (exists) throw new BadRequestException('Vertical key ya existe');

    const vertical = this.repo.create({
      key,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      isActive: dto.isActive ?? true,
      appBaseUrl: dto.appBaseUrl.trim().replace(/\/+$/, ''), // sin slash al final
      ssoCallbackPath: (dto.ssoCallbackPath ?? '/sso/callback').trim(),
      logoutPath: dto.logoutPath?.trim() ?? null,
    });

    return this.repo.save(vertical);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vertical not found');
    return v;
  }

  async update(id: string, dto: UpdateVerticalDto) {
    const v = await this.findOne(id);

    if (dto.key) v.key = dto.key.trim().toUpperCase();
    if (dto.name) v.name = dto.name.trim();
    if (dto.description !== undefined) {
      v.description = dto.description === null ? null : String(dto.description).trim();
    }
    if (dto.isActive !== undefined) v.isActive = dto.isActive;

    if (dto.appBaseUrl) v.appBaseUrl = dto.appBaseUrl.trim().replace(/\/+$/, '');
    if (dto.ssoCallbackPath) v.ssoCallbackPath = dto.ssoCallbackPath.trim();
    if (dto.logoutPath !== undefined) {
      v.logoutPath = dto.logoutPath === null ? null : String(dto.logoutPath).trim();
    }

    return this.repo.save(v);
  }

  // Por ahora “delete” lo dejamos como desactivar (soft business delete)
  async deactivate(id: string) {
    const v = await this.findOne(id);
    v.isActive = false;
    return this.repo.save(v);
  }
}
