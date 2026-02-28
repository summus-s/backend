import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('addons')
@Index(['verticalId', 'key'], { unique: true }) // verticalId null = global
export class AddonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vertical_id', type: 'uuid', nullable: true })
  verticalId: string | null;

  @Column({ type: 'varchar', length: 60 })
  key: string; // E_INVOICE, PAYROLL, SUPPORT_PREMIUM

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: '0.00' })
  price: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
