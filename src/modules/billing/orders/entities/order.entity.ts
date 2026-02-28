import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

@Entity('orders')
@Index(['companyVerticalId', 'createdAt'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @Column({ type: 'varchar', length: 20 })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  tax: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ name: 'payment_provider', type: 'varchar', length: 30, nullable: true })
  paymentProvider: string | null;

  @Column({ name: 'provider_payment_id', type: 'varchar', length: 120, nullable: true })
  providerPaymentId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
