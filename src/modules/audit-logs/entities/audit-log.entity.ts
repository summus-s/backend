import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PlatformUserEntity } from '../../platform-users/entities/platform-user.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntityType } from '../enums/audit-entity-type.enum';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId: string | null;

  @ManyToOne(() => PlatformUserEntity, (platformUser) => platformUser.auditLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser: PlatformUserEntity | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column({ name: 'entity_id', type: 'varchar', length: 120 })
  entityId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}