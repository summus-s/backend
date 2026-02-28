import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlanEntity } from './entities/plan.entity';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly repo: Repository<PlanEntity>,
  ) {}

  async create(dto: CreatePlanDto) {
    const code = dto.code.trim().toUpperCase();

    const exists = await this.repo.findOne({
      where: { verticalId: dto.verticalId, code, billingCycle: dto.billingCycle },
    });
    if (exists) throw new BadRequestException('Plan already exists for this vertical + cycle');

    const plan = this.repo.create({
      verticalId: dto.verticalId,
      code,
      name: dto.name.trim(),
      billingCycle: dto.billingCycle,
      price: dto.price,
      currency: (dto.currency ?? 'USD').trim().toUpperCase(),
      maxSeats: dto.maxSeats ?? 1,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(plan);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (dto.code) plan.code = dto.code.trim().toUpperCase();
    if (dto.name) plan.name = dto.name.trim();
    if (dto.billingCycle) plan.billingCycle = dto.billingCycle;
    if (dto.price) plan.price = dto.price;
    if (dto.currency) plan.currency = dto.currency.trim().toUpperCase();
    if (dto.maxSeats !== undefined) plan.maxSeats = dto.maxSeats;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;

    return this.repo.save(plan);
  }

  async deactivate(id: string) {
    const plan = await this.findOne(id);
    plan.isActive = false;
    return this.repo.save(plan);
  }
}
