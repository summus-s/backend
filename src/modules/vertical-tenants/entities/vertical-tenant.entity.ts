import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';
import { VerticalTenantStatus } from '../enums/vertical-tenant-status.enum';

@Entity('vertical_tenants')
@Index(['companyVerticalId'], { unique: true })
export class VerticalTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @OneToOne(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.verticalTenant,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({
    type: 'enum',
    enum: VerticalTenantStatus,
    default: VerticalTenantStatus.PENDING,
  })
  status: VerticalTenantStatus;

  @Column({
    name: 'external_tenant_id',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  externalTenantId: string | null;

  @Column({
    name: 'external_company_id',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  externalCompanyId: string | null;

  @Column({
    name: 'external_workspace_id',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  externalWorkspaceId: string | null;

  @Column({
    name: 'external_url',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  externalUrl: string | null;

  @Column({
    name: 'sync_reference',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  syncReference: string | null;

  @Column({
    name: 'last_request_payload',
    type: 'jsonb',
    nullable: true,
  })
  lastRequestPayload: Record<string, unknown> | null;

  @Column({
    name: 'last_response_payload',
    type: 'jsonb',
    nullable: true,
  })
  lastResponsePayload: Record<string, unknown> | null;

  @Column({
    name: 'last_error_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastErrorCode: string | null;

  @Column({
    name: 'last_error_message',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  lastErrorMessage: string | null;

  @Column({
    name: 'provisioning_attempts',
    type: 'int',
    default: 0,
  })
  provisioningAttempts: number;

  @Column({
    name: 'last_attempt_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastAttemptAt: Date | null;

  @Column({
    name: 'provisioned_at',
    type: 'timestamptz',
    nullable: true,
  })
  provisionedAt: Date | null;

  @Column({
    name: 'suspended_at',
    type: 'timestamptz',
    nullable: true,
  })
  suspendedAt: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}