import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CompanyVerticalStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

@Entity('company_verticals')
@Index(['companyId', 'verticalId'], { unique: true })
export class CompanyVerticalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @Column({ type: 'varchar', length: 20, default: CompanyVerticalStatus.PENDING })
  status: CompanyVerticalStatus;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'suspended_at', type: 'timestamp', nullable: true })
  suspendedAt: Date | null;

  @Column({ name: 'suspended_reason', type: 'varchar', length: 200, nullable: true })
  suspendedReason: string | null;

  // 🔑 para conectar con el proyecto del vertical (otra BD)
  @Column({ name: 'external_tenant_key', type: 'varchar', length: 120, nullable: true })
  externalTenantKey: string | null;

  @Column({ name: 'provisioned_at', type: 'timestamp', nullable: true })
  provisionedAt: Date | null;

  @Column({ name: 'last_provision_error', type: 'varchar', length: 300, nullable: true })
  lastProvisionError: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
