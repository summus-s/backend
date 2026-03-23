import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyEntity } from '../../companies/entities/company.entity';
import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';
import { InviteStatus } from '../enums/invite-status.enum';

@Entity('invites')
@Index(['token'], { unique: true })
export class InviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.invites, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @ManyToOne(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.invites,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160, nullable: true })
  fullName: string | null;

  @Column({ name: 'platform_role_key', type: 'varchar', length: 80 })
  platformRoleKey: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ type: 'varchar', length: 128, unique: true })
  token: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'status_reason', type: 'varchar', length: 300, nullable: true })
  statusReason: string | null;

  @Column({ name: 'accepted_user_id', type: 'uuid', nullable: true })
  acceptedUserId: string | null;

  @Column({ name: 'resend_count', type: 'int', default: 0 })
  resendCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}