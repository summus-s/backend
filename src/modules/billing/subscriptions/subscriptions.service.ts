import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SubscriptionEntity } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { CompanyVerticalsService } from '../../company-verticals/company-verticals.service';
import { CompanyVerticalStatus } from '../../company-verticals/enums/company-vertical-status.enum';
import { PlansService } from '../plans/plans.service';
import { getPagination } from '../../../common/utils/pagination.util';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepo: Repository<SubscriptionEntity>,
    private readonly companyVerticalsService: CompanyVerticalsService,
    private readonly plansService: PlansService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  private validateDateRange(start?: string | null, end?: string | null) {
    if (!start || !end) {
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      throw new BadRequestException(
        'La fecha final no puede ser menor que la fecha inicial',
      );
    }
  }

  private async ensureUniqueCompanyVerticalSubscription(
    companyVerticalId: string,
    excludeId?: string,
  ) {
    const existing = await this.subscriptionsRepo.findOne({
      where: { companyVerticalId },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'Este company-vertical ya tiene una suscripción registrada',
      );
    }
  }

  async create(createDto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    this.validateDateRange(
      createDto.currentPeriodStartsAt ?? createDto.startsAt,
      createDto.currentPeriodEndsAt,
    );

    const companyVertical = await this.companyVerticalsService.findById(
      createDto.companyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes crear suscripciones sobre company-vertical activos',
      );
    }

    const plan = await this.plansService.findById(createDto.planId);

    if (!plan.isActive) {
      throw new BadRequestException(
        'No puedes crear una suscripción con un plan inactivo',
      );
    }

    if (plan.verticalId !== companyVertical.verticalId) {
      throw new BadRequestException(
        'El plan no pertenece al mismo vertical del company-vertical',
      );
    }

    await this.ensureUniqueCompanyVerticalSubscription(
      createDto.companyVerticalId,
    );

    const subscription = this.subscriptionsRepo.create({
      companyVerticalId: createDto.companyVerticalId,
      planId: createDto.planId,
      status: SubscriptionStatus.ACTIVE,
      planCodeSnapshot: plan.code,
      planNameSnapshot: plan.name,
      priceSnapshot: plan.price,
      currencySnapshot: plan.currency,
      billingCycleSnapshot: plan.billingCycle,
      startsAt: new Date(createDto.startsAt),
      currentPeriodStartsAt: this.parseDate(
        createDto.currentPeriodStartsAt ?? createDto.startsAt,
      ),
      currentPeriodEndsAt: this.parseDate(createDto.currentPeriodEndsAt),
      cancelAt: null,
      cancelledAt: null,
      autoRenew: createDto.autoRenew ?? true,
      statusReason: null,
      notes: this.normalizeString(createDto.notes),
    });

    return this.subscriptionsRepo.save(subscription);
  }

  async findAll(queryDto: QuerySubscriptionsDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.companyVertical', 'companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical');

    if (queryDto.companyVerticalId) {
      query.andWhere('subscription.companyVerticalId = :companyVerticalId', {
        companyVerticalId: queryDto.companyVerticalId,
      });
    }

    if (queryDto.companyId) {
      query.andWhere('companyVertical.companyId = :companyId', {
        companyId: queryDto.companyId,
      });
    }

    if (queryDto.verticalId) {
      query.andWhere('companyVertical.verticalId = :verticalId', {
        verticalId: queryDto.verticalId,
      });
    }

    if (queryDto.planId) {
      query.andWhere('subscription.planId = :planId', {
        planId: queryDto.planId,
      });
    }

    if (queryDto.status) {
      query.andWhere('subscription.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.autoRenew !== undefined) {
      query.andWhere('subscription.autoRenew = :autoRenew', {
        autoRenew: queryDto.autoRenew === 'true',
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          subscription.planCodeSnapshot ILIKE :search
          OR subscription.planNameSnapshot ILIKE :search
          OR company.name ILIKE :search
          OR company.legalName ILIKE :search
          OR vertical.name ILIKE :search
          OR vertical.key ILIKE :search
          OR plan.code ILIKE :search
          OR plan.name ILIKE :search
        )`,
        { search: `%${queryDto.search.trim()}%` },
      );
    }

    query
      .orderBy('subscription.createdAt', 'DESC')
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

  async findById(id: string): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { id },
      relations: {
        plan: true,
        companyVertical: {
          company: true,
          vertical: true,
        },
        orders: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    return subscription;
  }

  async update(
    id: string,
    updateDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes editar una suscripción cancelada',
      );
    }

    const nextCompanyVerticalId =
      updateDto.companyVerticalId ?? subscription.companyVerticalId;
    const nextPlanId = updateDto.planId ?? subscription.planId;

    const nextPeriodStart =
      updateDto.currentPeriodStartsAt ??
      subscription.currentPeriodStartsAt?.toISOString() ??
      updateDto.startsAt ??
      subscription.startsAt.toISOString();

    const nextPeriodEnd =
      updateDto.currentPeriodEndsAt ??
      subscription.currentPeriodEndsAt?.toISOString() ??
      null;

    this.validateDateRange(nextPeriodStart, nextPeriodEnd);

    const companyVertical = await this.companyVerticalsService.findById(
      nextCompanyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes asociar la suscripción a company-vertical activos',
      );
    }

    const plan = await this.plansService.findById(nextPlanId);

    if (plan.verticalId !== companyVertical.verticalId) {
      throw new BadRequestException(
        'El plan no pertenece al mismo vertical del company-vertical',
      );
    }

    await this.ensureUniqueCompanyVerticalSubscription(
      nextCompanyVerticalId,
      subscription.id,
    );

    if (updateDto.companyVerticalId !== undefined) {
      subscription.companyVerticalId = updateDto.companyVerticalId;
    }

    if (updateDto.planId !== undefined) {
      subscription.planId = updateDto.planId;
      subscription.planCodeSnapshot = plan.code;
      subscription.planNameSnapshot = plan.name;
      subscription.priceSnapshot = plan.price;
      subscription.currencySnapshot = plan.currency;
      subscription.billingCycleSnapshot = plan.billingCycle;
    }

    if (updateDto.startsAt !== undefined) {
      subscription.startsAt = new Date(updateDto.startsAt);
    }

    if (updateDto.currentPeriodStartsAt !== undefined) {
      subscription.currentPeriodStartsAt = this.parseDate(
        updateDto.currentPeriodStartsAt,
      );
    }

    if (updateDto.currentPeriodEndsAt !== undefined) {
      subscription.currentPeriodEndsAt = this.parseDate(
        updateDto.currentPeriodEndsAt,
      );
    }

    if (updateDto.autoRenew !== undefined) {
      subscription.autoRenew = updateDto.autoRenew;
    }

    if (updateDto.notes !== undefined) {
      subscription.notes = this.normalizeString(updateDto.notes);
    }

    return this.subscriptionsRepo.save(subscription);
  }

  async activate(id: string): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.statusReason = null;
    return this.subscriptionsRepo.save(subscription);
  }

  async suspend(id: string, reason?: string): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes suspender una suscripción cancelada',
      );
    }

    subscription.status = SubscriptionStatus.SUSPENDED;
    subscription.statusReason =
      this.normalizeString(reason) ?? 'Suscripción suspendida';

    return this.subscriptionsRepo.save(subscription);
  }

  async markPastDue(id: string, reason?: string): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes marcar mora sobre una suscripción cancelada',
      );
    }

    subscription.status = SubscriptionStatus.PAST_DUE;
    subscription.statusReason =
      this.normalizeString(reason) ?? 'Suscripción en mora';

    return this.subscriptionsRepo.save(subscription);
  }

  async cancel(
    id: string,
    dto: CancelSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('La suscripción ya está cancelada');
    }

    if (dto.immediate) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      subscription.cancelAt = new Date();
    } else {
      subscription.cancelAt =
        subscription.currentPeriodEndsAt ?? new Date();
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
    }

    subscription.statusReason =
      this.normalizeString(dto.reason) ?? 'Suscripción cancelada';

    if (dto.notes !== undefined) {
      subscription.notes = this.normalizeString(dto.notes);
    }

    return this.subscriptionsRepo.save(subscription);
  }

  async remove(id: string): Promise<{ message: string }> {
    const subscription = await this.findById(id);

    if (subscription.orders?.length) {
      throw new BadRequestException(
        'No puedes eliminar una suscripción que ya tiene órdenes asociadas',
      );
    }

    await this.subscriptionsRepo.remove(subscription);

    return {
      message: 'Suscripción eliminada correctamente',
    };
  }
}