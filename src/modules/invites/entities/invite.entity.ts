import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';
import { PlatformUserEntity } from '../../platform-users/entities/platform-user.entity';
import { InviteStatus } from '../enums/invite-status.enum';
import { InviteRoleHint } from '../enums/invite-role-hint.enum';

@Entity({ name: 'invites' })
export class InviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_vertical_id', type: 'uuid' })
  companyVerticalId: string;

  @ManyToOne(() => CompanyVerticalEntity, (companyVertical) => companyVertical.invites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120, nullable: true })
  fullName: string | null;

  @Column({
    name: 'role_hint',
    type: 'enum',
    enum: InviteRoleHint,
  })
  roleHint: InviteRoleHint;

  @Column({ name: 'token_hash', type: 'varchar', length: 200 })
  tokenHash: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => PlatformUserEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  creator: PlatformUserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}