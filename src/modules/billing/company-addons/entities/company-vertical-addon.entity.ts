import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_vertical_addons')
@Index(['companyVerticalId', 'addonId'], { unique: true })
export class CompanyVerticalAddonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @Column({ name: 'addon_id', type: 'uuid' })
  addonId: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'enabled_at', type: 'timestamp', nullable: true })
  enabledAt: Date | null;

  @Column({ name: 'disabled_at', type: 'timestamp', nullable: true })
  disabledAt: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'PURCHASE' })
  source: string; // PURCHASE | OVERRIDE | SUPPORT

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
