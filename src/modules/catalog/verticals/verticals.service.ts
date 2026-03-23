import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerticalEntity } from './entities/vertical.entity';
import { CreateVerticalDto } from './dto/create-vertical.dto';
import { UpdateVerticalDto } from './dto/update-vertical.dto';
import { QueryVerticalsDto } from './dto/query-verticals.dto';

@Injectable()
export class VerticalsService {
  constructor(
    @InjectRepository(VerticalEntity)
    private readonly verticalsRepo: Repository<VerticalEntity>,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeKey(value: string): string {
    return value.trim().toLowerCase();
  }

  private normalizePath(value: string): string {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      throw new BadRequestException('El marketingPath es obligatorio');
    }

    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  private normalizeNullableString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private async ensureVerticalDoesNotExist(
    key: string,
    marketingPath: string,
    excludeId?: string,
  ): Promise<void> {
    const existingByKey = await this.verticalsRepo.findOne({
      where: { key },
    });

    if (existingByKey && existingByKey.id !== excludeId) {
      throw new BadRequestException(`Ya existe un vertical con key ${key}`);
    }

    const existingByMarketingPath = await this.verticalsRepo.findOne({
      where: { marketingPath },
    });

    if (existingByMarketingPath && existingByMarketingPath.id !== excludeId) {
      throw new BadRequestException(
        `Ya existe un vertical con marketingPath ${marketingPath}`,
      );
    }
  }

  async create(createDto: CreateVerticalDto): Promise<VerticalEntity> {
    const key = this.normalizeKey(createDto.key);
    const marketingPath = this.normalizePath(createDto.marketingPath);

    await this.ensureVerticalDoesNotExist(key, marketingPath);

    const vertical = this.verticalsRepo.create({
      key,
      name: createDto.name.trim(),
      description: this.normalizeString(createDto.description),
      isActive: createDto.isActive ?? true,
      marketingPath,
      appBaseUrl: createDto.appBaseUrl.trim(),
      apiBaseUrl: this.normalizeNullableString(createDto.apiBaseUrl),
      provisioningApiKey: this.normalizeNullableString(
        createDto.provisioningApiKey,
      ),
    });

    return this.verticalsRepo.save(vertical);
  }

  async findAll(queryDto: QueryVerticalsDto): Promise<VerticalEntity[]> {
    const query = this.verticalsRepo.createQueryBuilder('vertical');

    if (queryDto.key) {
      query.andWhere('vertical.key = :key', {
        key: this.normalizeKey(queryDto.key),
      });
    }

    if (queryDto.isActive !== undefined) {
      query.andWhere('vertical.isActive = :isActive', {
        isActive: queryDto.isActive === 'true',
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          vertical.name ILIKE :search
          OR vertical.key ILIKE :search
          OR vertical.description ILIKE :search
          OR vertical.marketingPath ILIKE :search
          OR vertical.appBaseUrl ILIKE :search
          OR vertical.apiBaseUrl ILIKE :search
        )`,
        {
          search: `%${queryDto.search.trim()}%`,
        },
      );
    }

    query.orderBy('vertical.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: string): Promise<VerticalEntity> {
    const vertical = await this.verticalsRepo.findOne({
      where: { id },
      relations: {
        companyVerticals: true,
        plans: true,
      },
    });

    if (!vertical) {
      throw new NotFoundException('Vertical no encontrado');
    }

    return vertical;
  }

  async findByKey(key: string): Promise<VerticalEntity> {
    const vertical = await this.verticalsRepo.findOne({
      where: { key: this.normalizeKey(key) },
    });

    if (!vertical) {
      throw new NotFoundException(`Vertical ${key} no encontrado`);
    }

    return vertical;
  }

  async update(
    id: string,
    updateDto: UpdateVerticalDto,
  ): Promise<VerticalEntity> {
    const vertical = await this.findById(id);

    const nextKey =
      updateDto.key !== undefined
        ? this.normalizeKey(updateDto.key)
        : vertical.key;

    const nextMarketingPath =
      updateDto.marketingPath !== undefined
        ? this.normalizePath(updateDto.marketingPath)
        : vertical.marketingPath;

    await this.ensureVerticalDoesNotExist(
      nextKey,
      nextMarketingPath,
      vertical.id,
    );

    if (updateDto.key !== undefined) {
      vertical.key = nextKey;
    }

    if (updateDto.name !== undefined) {
      vertical.name = updateDto.name.trim();
    }

    if (updateDto.description !== undefined) {
      vertical.description = this.normalizeString(updateDto.description);
    }

    if (updateDto.isActive !== undefined) {
      vertical.isActive = updateDto.isActive;
    }

    if (updateDto.marketingPath !== undefined) {
      vertical.marketingPath = nextMarketingPath;
    }

    if (updateDto.appBaseUrl !== undefined) {
      vertical.appBaseUrl = updateDto.appBaseUrl.trim();
    }

    if (updateDto.apiBaseUrl !== undefined) {
      vertical.apiBaseUrl = this.normalizeNullableString(updateDto.apiBaseUrl);
    }

    if (updateDto.provisioningApiKey !== undefined) {
      vertical.provisioningApiKey = this.normalizeNullableString(
        updateDto.provisioningApiKey,
      );
    }

    return this.verticalsRepo.save(vertical);
  }

  async activate(id: string): Promise<VerticalEntity> {
    const vertical = await this.findById(id);
    vertical.isActive = true;

    return this.verticalsRepo.save(vertical);
  }

  async deactivate(id: string): Promise<VerticalEntity> {
    const vertical = await this.findById(id);
    vertical.isActive = false;

    return this.verticalsRepo.save(vertical);
  }

  async remove(id: string): Promise<{ message: string }> {
    const vertical = await this.findById(id);

    if (vertical.companyVerticals?.length) {
      throw new BadRequestException(
        'No puedes eliminar este vertical porque ya está vinculado a empresas',
      );
    }

    if (vertical.plans?.length) {
      throw new BadRequestException(
        'No puedes eliminar este vertical porque tiene planes asociados',
      );
    }

    await this.verticalsRepo.remove(vertical);

    return {
      message: 'Vertical eliminado correctamente',
    };
  }
}