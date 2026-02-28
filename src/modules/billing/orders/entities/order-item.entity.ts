import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum OrderItemType {
  PLAN = 'PLAN',
  ADDON = 'ADDON',
}

@Entity('order_items')
@Index(['orderId'])
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar', length: 20 })
  type: OrderItemType;

  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId: string; // planId o addonId

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  unitPrice: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total: string;
}
