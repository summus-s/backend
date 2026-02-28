import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubscriptionEntity, SubscriptionStatus } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from './dtos/update-subscription.dto';
import { PlanEntity } from '../plans/entities/plan.entity';

@Injectable()
export class SubscriptionsService {
  [x: string]: any;
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repo: Repository<SubscriptionEntity>,
    @InjectRepository(PlanEntity)
    private readonly plansRepo: Repository<PlanEntity>,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const exists = await this.repo.findOne({
      where: { companyVerticalId: dto.companyVerticalId },
    });
    if (exists) {
      throw new BadRequestException('CompanyVertical already has a subscription');
    }

    const plan = await this.plansRepo.findOne({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Plan not available');
    }

    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);

    const sub = this.repo.create({
      companyVerticalId: dto.companyVerticalId,
      planId: dto.planId,
      status: dto.status ?? SubscriptionStatus.TRIAL,
      startDate,
      endDate: null,
      renewsAt: null,
      seatsIncluded: plan.maxSeats,
      paymentProvider: dto.paymentProvider ?? null,
    });

    return this.repo.save(sub);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    const sub = await this.findOne(id);

    if (dto.status) sub.status = dto.status;
    if (dto.paymentProvider !== undefined) {
      sub.paymentProvider = dto.paymentProvider;
    }

    return this.repo.save(sub);
  }

  async cancel(id: string) {
    const sub = await this.findOne(id);
    sub.status = SubscriptionStatus.CANCELED;
    sub.endDate = new Date().toISOString().slice(0, 10);
    return this.repo.save(sub);
  }

  async activateFromOrder(params: {
    companyVerticalId: string;
    planId: string;
    paymentProvider: string;
  }) {
    const plan = await this.plansRepo.findOne({
      where: { id: params.planId },
    });
    if (!plan) throw new Error('Plan not found');

    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);

    let renewsAt: string | null = null;
    if (plan.billingCycle === 'MONTHLY') {
      const d = new Date(today);
      d.setMonth(d.getMonth() + 1);
      renewsAt = d.toISOString().slice(0, 10);
    }

    let sub = await this.repo.findOne({
      where: { companyVerticalId: params.companyVerticalId },
    });

    if (!sub) {
      // Crear nueva
      sub = this.repo.create({
        companyVerticalId: params.companyVerticalId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate: null,
        renewsAt,
        seatsIncluded: plan.maxSeats,
        paymentProvider: params.paymentProvider,
        lastPaymentAt: new Date(),
      });
    } else {
      // Actualizar existente (upgrade / renovación)
      sub.planId = plan.id;
      sub.status = SubscriptionStatus.ACTIVE;
      sub.renewsAt = renewsAt;
      sub.seatsIncluded = plan.maxSeats;
      sub.lastPaymentAt = new Date();
    }

    return this.repo.save(sub);
  }

}
