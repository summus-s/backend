import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VerticalEntity } from '../../../catalog/verticals/entities/vertical.entity';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { Currency } from '../enums/currency.enum';
import { SubscriptionEntity } from '../../subscriptions/entities/subscription.entity';

@Entity({ name: 'plans' })
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @ManyToOne(() => VerticalEntity, (vertical) => vertical.plans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vertical_id' })
  vertical: VerticalEntity;

  @Column({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: string;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.plan)
  subscriptions: SubscriptionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}