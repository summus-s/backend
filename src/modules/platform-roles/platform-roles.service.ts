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

  async findAll(): Promise<PlatformRoleEntity[]> {
    return this.platformRolesRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<PlatformRoleEntity> {
    const role = await this.platformRolesRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Rol de plataforma no encontrado');
    }

    return role;
  }

  async findByKey(key: PlatformRoleKey): Promise<PlatformRoleEntity> {
    const role = await this.platformRolesRepo.findOne({ where: { key } });

    if (!role) {
      throw new NotFoundException(`Rol ${key} no encontrado`);
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