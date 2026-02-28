import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
  ) {}

  async create(dto: CreateRoleDto) {
    const name = dto.name.trim().toUpperCase();

    const exists = await this.repo.findOne({
      where: { companyVerticalId: dto.companyVerticalId, name },
    });
    if (exists) throw new BadRequestException('Role already exists for this company vertical');

    const role = this.repo.create({
      companyVerticalId: dto.companyVerticalId,
      name,
      description: dto.description?.trim() ?? null,
      deletedAt: null,
    });

    return this.repo.save(role);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Role not found');
    return r;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const r = await this.findOne(id);

    if (dto.name) r.name = dto.name.trim().toUpperCase();
    if (dto.description !== undefined) r.description = dto.description?.trim() ?? null;

    return this.repo.save(r);
  }

  async deactivate(id: string) {
    const r = await this.findOne(id);
    r.deletedAt = new Date();
    return this.repo.save(r);
  }
}
