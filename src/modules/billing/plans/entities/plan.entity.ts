import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VerticalEntity } from '../../../catalog/verticals/entities/vertical.entity';
import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';
import { SubscriptionEntity } from '../../subscriptions/entities/subscription.entity';

@Entity('plans')
@Index(['verticalId', 'code'], { unique: true })
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @ManyToOne(() => VerticalEntity, (vertical) => vertical.plans, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vertical_id' })
  vertical: VerticalEntity;

  @Column({ type: 'varchar', length: 60 })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, unknown> | null;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.plan)
  subscriptions: SubscriptionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}