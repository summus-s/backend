import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('plans')
@Index(['verticalId', 'code', 'billingCycle'], { unique: true })
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @Column({ type: 'varchar', length: 40 })
  code: string; // FREE | BASIC | PRO | ENTERPRISE

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 10 })
  billingCycle: BillingCycle;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  price: string; // usar string para numeric en TS

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'max_seats', type: 'int', default: 1 })
  maxSeats: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
