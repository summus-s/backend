import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SubscriptionEntity } from '../../subscriptions/entities/subscription.entity';
import { CompanyVerticalEntity } from '../../../company-verticals/entities/company-vertical.entity';
import { PlanEntity } from '../../plans/entities/plan.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';

@Entity('orders')
@Index(['externalReference'], { unique: true })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId: string | null;

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.orders, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: SubscriptionEntity | null;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @ManyToOne(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.orders,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId: string | null;

  @ManyToOne(() => PlanEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity | null;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.INITIAL,
  })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_provider',
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.MANUAL,
  })
  paymentProvider: PaymentProvider;

  @Column({ name: 'plan_code_snapshot', type: 'varchar', length: 60, nullable: true })
  planCodeSnapshot: string | null;

  @Column({ name: 'plan_name_snapshot', type: 'varchar', length: 120, nullable: true })
  planNameSnapshot: string | null;

  @Column({ name: 'amount_snapshot', type: 'decimal', precision: 12, scale: 2 })
  amountSnapshot: string;

  @Column({ name: 'currency_snapshot', type: 'varchar', length: 3 })
  currencySnapshot: string;

  @Column({
    name: 'billing_cycle_snapshot',
    type: 'enum',
    enum: BillingCycle,
    nullable: true,
  })
  billingCycleSnapshot: BillingCycle | null;

  @Column({ name: 'external_reference', type: 'varchar', length: 150, nullable: true, unique: true })
  externalReference: string | null;

  @Column({ name: 'external_payment_id', type: 'varchar', length: 150, nullable: true })
  externalPaymentId: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
  failedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'status_reason', type: 'varchar', length: 300, nullable: true })
  statusReason: string | null;

  @Column({ name: 'failure_code', type: 'varchar', length: 100, nullable: true })
  failureCode: string | null;

  @Column({ name: 'failure_message', type: 'varchar', length: 500, nullable: true })
  failureMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}