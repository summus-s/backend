import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PlatformUserStatus } from '../enums/platform-user-status.enum';
import { PlatformUserRoleEntity } from '../../platform-user-roles/entities/platform-user-role.entity';
import { AuditLogEntity } from '../../audit-logs/entities/audit-log.entity';

@Entity({ name: 'platform_users' })
export class PlatformUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 200,
  })
  passwordHash: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 120,
  })
  fullName: string;

  @Column({
    type: 'enum',
    enum: PlatformUserStatus,
    default: PlatformUserStatus.ACTIVE,
  })
  status: PlatformUserStatus;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @OneToMany(
    () => PlatformUserRoleEntity,
    (platformUserRole) => platformUserRole.platformUser,
  )
  platformUserRoles: PlatformUserRoleEntity[];

  @OneToMany(() => AuditLogEntity, (auditLog) => auditLog.actorUser)
  auditLogs: AuditLogEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}