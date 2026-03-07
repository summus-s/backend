import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyEntity } from '../../companies/entities/company.entity';
import { VerticalEntity } from '../../catalog/verticals/entities/vertical.entity';
import { CompanyVerticalStatus } from '../enums/company-vertical-status.enum';
import { SubscriptionEntity } from '../../billing/subscriptions/entities/subscription.entity';
import { OrderEntity } from '../../billing/orders/entities/order.entity';
import { VerticalTenantEntity } from '../../vertical-tenants/entities/vertical-tenant.entity';
import { InviteEntity } from '../../invites/entities/invite.entity';

@Entity({ name: 'company_verticals' })
@Index(['companyId', 'verticalId'], { unique: true })
export class CompanyVerticalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.companyVerticals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => VerticalEntity, (vertical) => vertical.companyVerticals, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vertical_id' })
  vertical: VerticalEntity;

  @Column({
    type: 'enum',
    enum: CompanyVerticalStatus,
    default: CompanyVerticalStatus.PENDING,
  })
  status: CompanyVerticalStatus;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'suspended_reason', type: 'varchar', length: 200, nullable: true })
  suspendedReason: string | null;

  @OneToOne(() => SubscriptionEntity, (subscription) => subscription.companyVertical)
  subscription: SubscriptionEntity | null;

  @OneToMany(() => OrderEntity, (order) => order.companyVertical)
  orders: OrderEntity[];

  @OneToOne(() => VerticalTenantEntity, (tenant) => tenant.companyVertical)
  verticalTenant: VerticalTenantEntity | null;

  @OneToMany(() => InviteEntity, (invite) => invite.companyVertical)
  invites: InviteEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}