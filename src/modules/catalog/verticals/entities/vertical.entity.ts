import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyVerticalEntity } from '../../../company-verticals/entities/company-vertical.entity';
import { PlanEntity } from '../../../billing/plans/entities/plan.entity';

@Entity({ name: 'verticals' })
export class VerticalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'marketing_path', type: 'varchar', length: 120, unique: true })
  marketingPath: string;

  @Column({ name: 'app_base_url', type: 'varchar', length: 200 })
  appBaseUrl: string;

  @Column({ name: 'api_base_url', type: 'varchar', length: 200, nullable: true })
  apiBaseUrl: string | null;

  @OneToMany(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.vertical,
  )
  companyVerticals: CompanyVerticalEntity[];

  @OneToMany(() => PlanEntity, (plan) => plan.vertical)
  plans: PlanEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}