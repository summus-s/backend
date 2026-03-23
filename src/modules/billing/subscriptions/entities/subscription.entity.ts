import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../../company-verticals/entities/company-vertical.entity';
import { PlanEntity } from '../../plans/entities/plan.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';

@Entity('subscriptions')
@Index(['companyVerticalId'], { unique: true })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @OneToOne(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.subscription,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => PlanEntity, (plan) => plan.subscriptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ name: 'plan_code_snapshot', type: 'varchar', length: 60 })
  planCodeSnapshot: string;

  @Column({ name: 'plan_name_snapshot', type: 'varchar', length: 120 })
  planNameSnapshot: string;

  @Column({ name: 'price_snapshot', type: 'decimal', precision: 12, scale: 2 })
  priceSnapshot: string;

  @Column({ name: 'currency_snapshot', type: 'varchar', length: 3 })
  currencySnapshot: string;

  @Column({
    name: 'billing_cycle_snapshot',
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycleSnapshot: BillingCycle;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'current_period_starts_at', type: 'timestamptz', nullable: true })
  currentPeriodStartsAt: Date | null;

  @Column({ name: 'current_period_ends_at', type: 'timestamptz', nullable: true })
  currentPeriodEndsAt: Date | null;

  @Column({ name: 'cancel_at', type: 'timestamptz', nullable: true })
  cancelAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'auto_renew', type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ name: 'status_reason', type: 'varchar', length: 300, nullable: true })
  statusReason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => OrderEntity, (order) => order.subscription)
  orders: OrderEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}