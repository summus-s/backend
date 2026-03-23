import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlanEntity } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';
import { VerticalsService } from '../../catalog/verticals/verticals.service';
import { getPagination } from '../../../common/utils/pagination.util';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly plansRepo: Repository<PlanEntity>,
    private readonly verticalsService: VerticalsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeCode(value: string): string {
    return value.trim().toUpperCase();
  }

  private normalizeCurrency(value?: string): string {
    return (value ?? 'USD').trim().toUpperCase();
  }

  private parsePrice(value: string): number {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new BadRequestException('El precio no es válido');
    }

    if (parsed < 0) {
      throw new BadRequestException('El precio no puede ser negativo');
    }

    return parsed;
  }

  private normalizeFeatures(
    features?: Record<string, unknown>,
  ): Record<string, unknown> | null {
    if (!features) {
      return null;
    }

    return features;
  }

  private async ensureUniquePlanCode(
    verticalId: string,
    code: string,
    excludeId?: string,
  ) {
    const existing = await this.plansRepo.findOne({
      where: {
        verticalId,
        code,
      },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'Ya existe un plan con ese código en este vertical',
      );
    }
  }

  async create(createDto: CreatePlanDto): Promise<PlanEntity> {
    await this.verticalsService.findById(createDto.verticalId);

    const code = this.normalizeCode(createDto.code);
    await this.ensureUniquePlanCode(createDto.verticalId, code);

    this.parsePrice(createDto.price);

    const plan = this.plansRepo.create({
      verticalId: createDto.verticalId,
      code,
      name: createDto.name.trim(),
      description: this.normalizeString(createDto.description),
      price: createDto.price,
      currency: this.normalizeCurrency(createDto.currency),
      billingCycle: createDto.billingCycle,
      isActive: createDto.isActive ?? true,
      isFeatured: createDto.isFeatured ?? false,
      sortOrder: createDto.sortOrder ?? 0,
      features: this.normalizeFeatures(createDto.features),
    });

    return this.plansRepo.save(plan);
  }

  async findAll(queryDto: QueryPlansDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.plansRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.vertical', 'vertical');

    if (queryDto.verticalId) {
      query.andWhere('plan.verticalId = :verticalId', {
        verticalId: queryDto.verticalId,
      });
    }

    if (queryDto.billingCycle) {
      query.andWhere('plan.billingCycle = :billingCycle', {
        billingCycle: queryDto.billingCycle,
      });
    }

    if (queryDto.isActive !== undefined) {
      query.andWhere('plan.isActive = :isActive', {
        isActive: queryDto.isActive === 'true',
      });
    }

    if (queryDto.isFeatured !== undefined) {
      query.andWhere('plan.isFeatured = :isFeatured', {
        isFeatured: queryDto.isFeatured === 'true',
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          plan.code ILIKE :search
          OR plan.name ILIKE :search
          OR plan.description ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query
      .orderBy('plan.sortOrder', 'ASC')
      .addOrderBy('plan.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<PlanEntity> {
    const plan = await this.plansRepo.findOne({
      where: { id },
      relations: {
        vertical: true,
        subscriptions: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    return plan;
  }

  async update(id: string, updateDto: UpdatePlanDto): Promise<PlanEntity> {
    const plan = await this.findById(id);

    const nextVerticalId =
      updateDto.verticalId !== undefined ? updateDto.verticalId : plan.verticalId;

    const nextCode =
      updateDto.code !== undefined ? this.normalizeCode(updateDto.code) : plan.code;

    if (updateDto.verticalId !== undefined) {
      await this.verticalsService.findById(updateDto.verticalId);
    }

    await this.ensureUniquePlanCode(nextVerticalId, nextCode, plan.id);

    if (updateDto.price !== undefined) {
      this.parsePrice(updateDto.price);
    }

    if (updateDto.verticalId !== undefined) {
      plan.verticalId = updateDto.verticalId;
    }

    if (updateDto.code !== undefined) {
      plan.code = nextCode;
    }

    if (updateDto.name !== undefined) {
      plan.name = updateDto.name.trim();
    }

    if (updateDto.description !== undefined) {
      plan.description = this.normalizeString(updateDto.description);
    }

    if (updateDto.price !== undefined) {
      plan.price = updateDto.price;
    }

    if (updateDto.currency !== undefined) {
      plan.currency = this.normalizeCurrency(updateDto.currency);
    }

    if (updateDto.billingCycle !== undefined) {
      plan.billingCycle = updateDto.billingCycle;
    }

    if (updateDto.isActive !== undefined) {
      plan.isActive = updateDto.isActive;
    }

    if (updateDto.isFeatured !== undefined) {
      plan.isFeatured = updateDto.isFeatured;
    }

    if (updateDto.sortOrder !== undefined) {
      plan.sortOrder = updateDto.sortOrder;
    }

    if (updateDto.features !== undefined) {
      plan.features = this.normalizeFeatures(updateDto.features);
    }

    return this.plansRepo.save(plan);
  }

  async activate(id: string): Promise<PlanEntity> {
    const plan = await this.findById(id);
    plan.isActive = true;
    return this.plansRepo.save(plan);
  }

  async deactivate(id: string): Promise<PlanEntity> {
    const plan = await this.findById(id);
    plan.isActive = false;
    return this.plansRepo.save(plan);
  }

  async remove(id: string): Promise<{ message: string }> {
    const plan = await this.findById(id);

    if (plan.subscriptions?.length) {
      throw new BadRequestException(
        'No puedes eliminar un plan que ya tiene suscripciones asociadas',
      );
    }

    await this.plansRepo.remove(plan);

    return {
      message: 'Plan eliminado correctamente',
    };
  }
}