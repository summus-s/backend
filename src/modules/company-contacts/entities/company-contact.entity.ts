import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CompanyEntity } from '../../companies/entities/company.entity';

@Entity({ name: 'company_contacts' })
export class CompanyContactEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.contacts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}