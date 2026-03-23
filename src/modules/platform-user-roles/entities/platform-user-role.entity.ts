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

import { PlatformUserEntity } from '../../platform-users/entities/platform-user.entity';
import { PlatformRoleEntity } from '../../platform-roles/entities/platform-role.entity';
import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';

@Entity('platform_user_roles')
@Index(['platformUserId', 'platformRoleId', 'companyVerticalId'], { unique: true })
export class PlatformUserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'platform_user_id', type: 'uuid' })
  platformUserId: string;

  @ManyToOne(() => PlatformUserEntity, (user) => user.platformUserRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'platform_user_id' })
  platformUser: PlatformUserEntity;

  @Column({ name: 'platform_role_id', type: 'uuid' })
  platformRoleId: string;

  @ManyToOne(() => PlatformRoleEntity, (role) => role.platformUserRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'platform_role_id' })
  platformRole: PlatformRoleEntity;

  @Column({ name: 'company_vertical_id', type: 'uuid', nullable: true })
  companyVerticalId: string | null;

  @ManyToOne(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.platformUserRoles,
    {
      onDelete: 'RESTRICT',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'company_vertical_id' })
  companyVertical: CompanyVerticalEntity | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'status_reason', type: 'varchar', length: 300, nullable: true })
  statusReason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}