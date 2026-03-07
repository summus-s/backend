import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyStatus } from '../enums/company-status.enum';
import { CompanyContactEntity } from '../../company-contacts/entities/company-contact.entity';
import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';

@Entity({ name: 'companies' })
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'legal_name', type: 'varchar', length: 150, nullable: true })
  legalName: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 50, nullable: true })
  taxId: string | null;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status: CompanyStatus;

  @Column({ name: 'suspended_reason', type: 'varchar', length: 200, nullable: true })
  suspendedReason: string | null;

  @OneToMany(() => CompanyContactEntity, (contact) => contact.company)
  contacts: CompanyContactEntity[];

  @OneToMany(() => CompanyVerticalEntity, (companyVertical) => companyVertical.company)
  companyVerticals: CompanyVerticalEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}