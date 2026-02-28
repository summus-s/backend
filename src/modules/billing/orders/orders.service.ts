import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity, OrderStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { OrderItemType } from './entities/order-item.entity';
import { CompanyAddonsService } from '../company-addons/company-addons.service';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly itemsRepo: Repository<OrderItemEntity>,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly companyAddonsService: CompanyAddonsService,
  ) {}

  async create(dto: CreateOrderDto) {
    let subtotal = 0;

    for (const i of dto.items) {
      subtotal += Number(i.unitPrice) * i.quantity;
    }

    const tax = 0; // luego configurable
    const total = subtotal + tax;

    const order = await this.ordersRepo.save(
      this.ordersRepo.create({
        companyVerticalId: dto.companyVerticalId,
        status: OrderStatus.PENDING,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        currency: dto.currency.toUpperCase(),
      }),
    );

    for (const i of dto.items) {
      await this.itemsRepo.save(
        this.itemsRepo.create({
          orderId: order.id,
          type: i.type,
          referenceId: i.referenceId,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          total: (Number(i.unitPrice) * i.quantity).toFixed(2),
        }),
      );
    }

    return order;
  }

  findAll() {
    return this.ordersRepo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.ordersRepo.findOne({ where: { id } });
  }

  async markAsPaid(orderId: string, provider?: {
    paymentProvider?: string;
    providerPaymentId?: string;
  }) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    order.status = OrderStatus.PAID;
    order.paidAt = new Date();

    if (provider?.paymentProvider) {
      order.paymentProvider = provider.paymentProvider;
    }
    if (provider?.providerPaymentId) {
      order.providerPaymentId = provider.providerPaymentId;
    }

    return this.ordersRepo.save(order);
  }

  async finalizeOrder(orderId: string) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new Error('Order not found');

    if (order.status !== OrderStatus.PAID) {
      throw new Error('Order not paid');
    }

    const items = await this.itemsRepo.find({
      where: { orderId: order.id },
    });

    for (const item of items) {
      // 1️⃣ PLAN → suscripción
      if (item.type === OrderItemType.PLAN) {
        await this.subscriptionsService.activateFromOrder({
          companyVerticalId: order.companyVerticalId,
          planId: item.referenceId,
          paymentProvider: order.paymentProvider ?? 'MANUAL',
        });
      }

      // 2️⃣ ADDON → activar addon
      if (item.type === OrderItemType.ADDON) {
        await this.companyAddonsService.enableFromOrder({
          companyVerticalId: order.companyVerticalId,
          addonId: item.referenceId,
          source: 'PURCHASE',
        });
      }
    }

    return { ok: true };
  }

}
