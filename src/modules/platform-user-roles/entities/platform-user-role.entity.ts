import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PlatformUserEntity } from '../../platform-users/entities/platform-user.entity';
import { PlatformRoleEntity } from '../../platform-roles/entities/platform-role.entity';

@Entity({ name: 'platform_user_roles' })
@Index(['userId', 'roleId'], { unique: true })
export class PlatformUserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => PlatformUserEntity, (user) => user.platformUserRoles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: PlatformUserEntity;

  @ManyToOne(() => PlatformRoleEntity, (role) => role.platformUserRoles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: PlatformRoleEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}