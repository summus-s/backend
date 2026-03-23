import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PlatformRoleKey } from '../enums/platform-role-key.enum';
import { PlatformUserRoleEntity } from '../../platform-user-roles/entities/platform-user-role.entity';

@Entity({ name: 'platform_roles' })
export class PlatformRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlatformRoleKey,
    unique: true,
  })
  key: PlatformRoleKey;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @OneToMany(
    () => PlatformUserRoleEntity,
    (platformUserRole) => platformUserRole.platformRole,
  )
  platformUserRoles: PlatformUserRoleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}