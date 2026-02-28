import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
}

@Entity('subscriptions')
@Index(['companyVerticalId'], { unique: true }) // 1 suscripción activa por CompanyVertical
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'varchar', length: 20 })
  status: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ name: 'renews_at', type: 'date', nullable: true })
  renewsAt: string | null;

  @Column({ name: 'seats_included', type: 'int' })
  seatsIncluded: number;

  // pagos
  @Column({ name: 'payment_provider', type: 'varchar', length: 30, nullable: true })
  paymentProvider: string | null;

  @Column({ name: 'provider_customer_id', type: 'varchar', length: 120, nullable: true })
  providerCustomerId: string | null;

  @Column({ name: 'provider_subscription_id', type: 'varchar', length: 120, nullable: true })
  providerSubscriptionId: string | null;

  @Column({ name: 'last_payment_at', type: 'timestamp', nullable: true })
  lastPaymentAt: Date | null;

  @Column({ name: 'next_invoice_at', type: 'timestamp', nullable: true })
  nextInvoiceAt: Date | null;

  @Column({ name: 'grace_period_until', type: 'timestamp', nullable: true })
  gracePeriodUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
