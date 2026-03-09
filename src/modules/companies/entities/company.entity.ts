import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyStatus } from '../enums/company-status.enum';
import { CompanyContactEntity } from '../../company-contacts/entities/company-contact.entity';
import { CompanyVerticalEntity } from '../../company-verticals/entities/company-vertical.entity';

@Entity('companies')
@Index('UQ_companies_tax_id', ['taxId'], { unique: true })
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  legalName: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  taxId: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string | null;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status: CompanyStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => CompanyContactEntity, (contact) => contact.company)
  contacts: CompanyContactEntity[];

  @OneToMany(
    () => CompanyVerticalEntity,
    (companyVertical) => companyVertical.company,
  )
  companyVerticals: CompanyVerticalEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}