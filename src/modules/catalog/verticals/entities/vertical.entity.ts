import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('verticals')
export class VerticalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  key: string; // DAIRY | MEAT | LASER

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Para referenciar el dashboard del vertical
  @Column({ name: 'app_base_url', type: 'varchar', length: 200 })
  appBaseUrl: string; // https://dairy.tudominio.com

  @Column({ name: 'sso_callback_path', type: 'varchar', length: 120, default: '/sso/callback' })
  ssoCallbackPath: string; // /sso/callback

  @Column({ name: 'logout_path', type: 'varchar', length: 120, nullable: true })
  logoutPath: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
