import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../../company-verticals/entities/company-vertical.entity';
import { PlanEntity } from '../../plans/entities/plan.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { BillingProvider } from '../enums/billing-provider.enum';

@Entity({ name: 'subscriptions' })
@Index(['companyVerticalId'], { unique: true })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @OneToOne(() => CompanyVerticalEntity, (companyVertical) => companyVertical.subscription, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @ManyToOne(() => PlanEntity, (plan) => plan.subscriptions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({
    type: 'enum',
    enum: BillingProvider,
  })
  provider: BillingProvider;

  @Column({ name: 'provider_customer_id', type: 'varchar', length: 120, nullable: true })
  providerCustomerId: string | null;

  @Column({ name: 'provider_subscription_id', type: 'varchar', length: 120, nullable: true })
  providerSubscriptionId: string | null;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}