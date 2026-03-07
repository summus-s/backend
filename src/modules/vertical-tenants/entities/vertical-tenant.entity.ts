import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';
import { ProvisionStatus } from '../enums/provision-status.enum';

@Entity({ name: 'vertical_tenants' })
@Index(['companyVerticalId'], { unique: true })
export class VerticalTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @OneToOne(() => CompanyVerticalEntity, (companyVertical) => companyVertical.verticalTenant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({ name: 'external_tenant_id', type: 'varchar', length: 120 })
  externalTenantId: string;

  @Column({ name: 'external_workspace', type: 'varchar', length: 120, nullable: true })
  externalWorkspace: string | null;

  @Column({
    name: 'provision_status',
    type: 'enum',
    enum: ProvisionStatus,
    default: ProvisionStatus.PENDING,
  })
  provisionStatus: ProvisionStatus;

  @Column({ name: 'provisioned_at', type: 'timestamp', nullable: true })
  provisionedAt: Date | null;

  @Column({ name: 'last_error', type: 'varchar', length: 200, nullable: true })
  lastError: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}