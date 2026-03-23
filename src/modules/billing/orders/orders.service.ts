import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { MarkOrderPaidDto } from './dto/mark-order-paid.dto';
import { MarkOrderFailedDto } from './dto/mark-order-failed.dto';
import { OrderStatus } from './enums/order-status.enum';
import { OrderType } from './enums/order-type.enum';
import { PaymentProvider } from './enums/payment-provider.enum';
import { CompanyVerticalsService } from '../../company-verticals/company-verticals.service';
import { CompanyVerticalStatus } from '../../company-verticals/enums/company-vertical-status.enum';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { getPagination } from '../../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    private readonly companyVerticalsService: CompanyVerticalsService,
    private readonly plansService: PlansService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeCurrency(value: string): string {
    return value.trim().toUpperCase();
  }

  private parseAmount(value: string): number {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new BadRequestException('El monto no es válido');
    }

    if (parsed < 0) {
      throw new BadRequestException('El monto no puede ser negativo');
    }

    return parsed;
  }

  private normalizeMetadata(
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> | null {
    return metadata ?? null;
  }

  private async ensureUniqueExternalReference(
    externalReference?: string | null,
    excludeId?: string,
  ) {
    const normalized = this.normalizeString(externalReference);

    if (!normalized) {
      return;
    }

    const existing = await this.ordersRepo.findOne({
      where: { externalReference: normalized },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        'Ya existe una orden con esa referencia externa',
      );
    }
  }

  async create(createDto: CreateOrderDto): Promise<OrderEntity> {
    this.parseAmount(createDto.amountSnapshot);

    const companyVertical = await this.companyVerticalsService.findById(
      createDto.companyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes crear órdenes sobre company-vertical activos',
      );
    }

    let subscriptionId: string | null = null;
    let planId: string | null = null;
    let planCodeSnapshot: string | null =
      this.normalizeString(createDto.planCodeSnapshot);
    let planNameSnapshot: string | null =
      this.normalizeString(createDto.planNameSnapshot);
    let billingCycleSnapshot = createDto.billingCycleSnapshot ?? null;

    if (createDto.subscriptionId) {
      const subscription = await this.subscriptionsService.findById(
        createDto.subscriptionId,
      );

      if (subscription.companyVerticalId !== createDto.companyVerticalId) {
        throw new BadRequestException(
          'La suscripción no pertenece al company-vertical enviado',
        );
      }

      subscriptionId = subscription.id;
      planId = subscription.planId;
      planCodeSnapshot = subscription.planCodeSnapshot;
      planNameSnapshot = subscription.planNameSnapshot;
      billingCycleSnapshot = subscription.billingCycleSnapshot;
    }

    if (createDto.planId) {
      const plan = await this.plansService.findById(createDto.planId);

      if (plan.verticalId !== companyVertical.verticalId) {
        throw new BadRequestException(
          'El plan no pertenece al mismo vertical del company-vertical',
        );
      }

      planId = plan.id;
      planCodeSnapshot = planCodeSnapshot ?? plan.code;
      planNameSnapshot = planNameSnapshot ?? plan.name;
      billingCycleSnapshot = billingCycleSnapshot ?? plan.billingCycle;
    }

    await this.ensureUniqueExternalReference(createDto.externalReference);

    const order = this.ordersRepo.create({
      subscriptionId,
      companyVerticalId: createDto.companyVerticalId,
      planId,
      type: createDto.type ?? OrderType.INITIAL,
      status: OrderStatus.PENDING,
      paymentProvider: createDto.paymentProvider ?? PaymentProvider.MANUAL,
      planCodeSnapshot,
      planNameSnapshot,
      amountSnapshot: createDto.amountSnapshot,
      currencySnapshot: this.normalizeCurrency(createDto.currencySnapshot),
      billingCycleSnapshot,
      externalReference: this.normalizeString(createDto.externalReference),
      externalPaymentId: this.normalizeString(createDto.externalPaymentId),
      paidAt: null,
      failedAt: null,
      cancelledAt: null,
      statusReason: null,
      failureCode: null,
      failureMessage: null,
      metadata: this.normalizeMetadata(createDto.metadata),
      notes: this.normalizeString(createDto.notes),
    });

    return this.ordersRepo.save(order);
  }

  async findAll(queryDto: QueryOrdersDto) {
    const { page, limit, skip } = getPagination(queryDto);

    const query = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.subscription', 'subscription')
      .leftJoinAndSelect('order.companyVertical', 'companyVertical')
      .leftJoinAndSelect('companyVertical.company', 'company')
      .leftJoinAndSelect('companyVertical.vertical', 'vertical')
      .leftJoinAndSelect('order.plan', 'plan');

    if (queryDto.subscriptionId) {
      query.andWhere('order.subscriptionId = :subscriptionId', {
        subscriptionId: queryDto.subscriptionId,
      });
    }

    if (queryDto.companyVerticalId) {
      query.andWhere('order.companyVerticalId = :companyVerticalId', {
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
      query.andWhere('order.planId = :planId', {
        planId: queryDto.planId,
      });
    }

    if (queryDto.status) {
      query.andWhere('order.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.type) {
      query.andWhere('order.type = :type', {
        type: queryDto.type,
      });
    }

    if (queryDto.paymentProvider) {
      query.andWhere('order.paymentProvider = :paymentProvider', {
        paymentProvider: queryDto.paymentProvider,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere(
        `(
          order.planCodeSnapshot ILIKE :search
          OR order.planNameSnapshot ILIKE :search
          OR order.externalReference ILIKE :search
          OR order.externalPaymentId ILIKE :search
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

    query.orderBy('order.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: {
        subscription: true,
        companyVertical: {
          company: true,
          vertical: true,
        },
        plan: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async update(id: string, updateDto: UpdateOrderDto): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Solo puedes editar órdenes en estado pendiente',
      );
    }

    const nextCompanyVerticalId =
      updateDto.companyVerticalId ?? order.companyVerticalId;

    const companyVertical = await this.companyVerticalsService.findById(
      nextCompanyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes asociar la orden a company-vertical activos',
      );
    }

    if (updateDto.amountSnapshot !== undefined) {
      this.parseAmount(updateDto.amountSnapshot);
    }

    await this.ensureUniqueExternalReference(updateDto.externalReference, order.id);

    if (updateDto.subscriptionId !== undefined) {
      if (updateDto.subscriptionId) {
        const subscription = await this.subscriptionsService.findById(
          updateDto.subscriptionId,
        );

        if (subscription.companyVerticalId !== nextCompanyVerticalId) {
          throw new BadRequestException(
            'La suscripción no pertenece al company-vertical enviado',
          );
        }

        order.subscriptionId = subscription.id;
      } else {
        order.subscriptionId = null;
      }
    }

    if (updateDto.companyVerticalId !== undefined) {
      order.companyVerticalId = updateDto.companyVerticalId;
    }

    if (updateDto.planId !== undefined) {
      if (updateDto.planId) {
        const plan = await this.plansService.findById(updateDto.planId);

        if (plan.verticalId !== companyVertical.verticalId) {
          throw new BadRequestException(
            'El plan no pertenece al mismo vertical del company-vertical',
          );
        }

        order.planId = plan.id;
      } else {
        order.planId = null;
      }
    }

    if (updateDto.type !== undefined) {
      order.type = updateDto.type;
    }

    if (updateDto.paymentProvider !== undefined) {
      order.paymentProvider = updateDto.paymentProvider;
    }

    if (updateDto.amountSnapshot !== undefined) {
      order.amountSnapshot = updateDto.amountSnapshot;
    }

    if (updateDto.currencySnapshot !== undefined) {
      order.currencySnapshot = this.normalizeCurrency(updateDto.currencySnapshot);
    }

    if (updateDto.billingCycleSnapshot !== undefined) {
      order.billingCycleSnapshot = updateDto.billingCycleSnapshot;
    }

    if (updateDto.planCodeSnapshot !== undefined) {
      order.planCodeSnapshot = this.normalizeString(updateDto.planCodeSnapshot);
    }

    if (updateDto.planNameSnapshot !== undefined) {
      order.planNameSnapshot = this.normalizeString(updateDto.planNameSnapshot);
    }

    if (updateDto.externalReference !== undefined) {
      order.externalReference = this.normalizeString(updateDto.externalReference);
    }

    if (updateDto.externalPaymentId !== undefined) {
      order.externalPaymentId = this.normalizeString(updateDto.externalPaymentId);
    }

    if (updateDto.metadata !== undefined) {
      order.metadata = this.normalizeMetadata(updateDto.metadata);
    }

    if (updateDto.notes !== undefined) {
      order.notes = this.normalizeString(updateDto.notes);
    }

    return this.ordersRepo.save(order);
  }

  async markPaid(id: string, dto: MarkOrderPaidDto): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('La orden ya está pagada');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('No puedes pagar una orden cancelada');
    }

    order.status = OrderStatus.PAID;
    order.paidAt = new Date();
    order.failedAt = null;
    order.failureCode = null;
    order.failureMessage = null;
    order.statusReason = this.normalizeString(dto.reason) ?? 'Orden pagada';

    if (dto.externalPaymentId !== undefined) {
      order.externalPaymentId = this.normalizeString(dto.externalPaymentId);
    }

    if (dto.notes !== undefined) {
      order.notes = this.normalizeString(dto.notes);
    }

    return this.ordersRepo.save(order);
  }

  async markFailed(id: string, dto: MarkOrderFailedDto): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException(
        'No puedes marcar como fallida una orden ya pagada',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes marcar como fallida una orden cancelada',
      );
    }

    order.status = OrderStatus.FAILED;
    order.failedAt = new Date();
    order.failureCode = this.normalizeString(dto.failureCode);
    order.failureMessage = this.normalizeString(dto.failureMessage);
    order.statusReason =
      this.normalizeString(dto.reason) ?? 'Orden fallida';

    if (dto.notes !== undefined) {
      order.notes = this.normalizeString(dto.notes);
    }

    return this.ordersRepo.save(order);
  }

  async cancel(id: string, reason?: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('No puedes cancelar una orden pagada');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('La orden ya está cancelada');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.statusReason = this.normalizeString(reason) ?? 'Orden cancelada';

    return this.ordersRepo.save(order);
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.findById(id);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException(
        'No puedes eliminar una orden ya pagada',
      );
    }

    await this.ordersRepo.remove(order);

    return {
      message: 'Orden eliminada correctamente',
    };
  }
}