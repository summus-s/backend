import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../../company-verticals/entities/company-vertical.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { Currency } from '../../plans/enums/currency.enum';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @ManyToOne(() => CompanyVerticalEntity, (companyVertical) => companyVertical.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount: string;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({ name: 'provider_payment_id', type: 'varchar', length: 120, nullable: true })
  providerPaymentId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}