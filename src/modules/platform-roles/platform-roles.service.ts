import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PlatformRoleEntity } from './entities/platform-role.entity';
import { CreatePlatformRoleDto } from './dto/create-platform-role.dto';
import { UpdatePlatformRoleDto } from './dto/update-platform-role.dto';
import { PlatformRoleKey } from './enums/platform-role-key.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class PlatformRolesService {
  constructor(
    @InjectRepository(PlatformRoleEntity)
    private readonly platformRolesRepo: Repository<PlatformRoleEntity>,
  ) {}

  async create(createDto: CreatePlatformRoleDto): Promise<PlatformRoleEntity> {
    const existing = await this.platformRolesRepo.findOne({
      where: { key: createDto.key },
    });

    if (existing) {
      throw new ConflictException(`Ya existe el rol ${createDto.key}`);
    }

    const role = this.platformRolesRepo.create({
      key: createDto.key,
      name: createDto.name.trim(),
    });

    return this.platformRolesRepo.save(role);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<PlatformRoleEntity>> {
    const { page, limit, skip } = getPagination(paginationDto);

    const [items, total] = await this.platformRolesRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<PlatformRoleEntity> {
    const role = await this.platformRolesRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Rol de plataforma no encontrado');
    }

    return role;
  }

  async findByKey(key: string): Promise<PlatformRoleEntity> {
    const normalizedKey = key.trim().toUpperCase() as PlatformRoleKey;

    const role = await this.platformRolesRepo.findOne({
      where: { key: normalizedKey },
    });

    if (!role) {
      throw new NotFoundException(`Rol ${normalizedKey} no encontrado`);
    }

    return role;
  }

  async findManyByKeys(keys: PlatformRoleKey[]): Promise<PlatformRoleEntity[]> {
    if (!keys.length) {
      return [];
    }

    const uniqueKeys = [...new Set(keys)];

    const roles = await this.platformRolesRepo.find({
      where: { key: In(uniqueKeys) },
    });

    if (roles.length !== uniqueKeys.length) {
      const found = new Set(roles.map((role) => role.key));
      const missing = uniqueKeys.filter((key) => !found.has(key));
      throw new NotFoundException(
        `No se encontraron los roles: ${missing.join(', ')}`,
      );
    }

    return roles;
  }

  async update(
    id: string,
    updateDto: UpdatePlatformRoleDto,
  ): Promise<PlatformRoleEntity> {
    const role = await this.findById(id);

    if (updateDto.name !== undefined) {
      role.name = updateDto.name.trim();
    }

    return this.platformRolesRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.platformRolesRepo.remove(role);
  }
}