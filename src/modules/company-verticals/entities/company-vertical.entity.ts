import {
  Column,
  CreateDateColumn,
  Entity,
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
import { BillingCycle } from '../enums/billing-cycle.enum';
import { ProvisioningStatus } from '../enums/provisioning-status.enum';
import { OrderEntity } from '../../billing/orders/entities/order.entity';
import { SubscriptionEntity } from '../../billing/subscriptions/entities/subscription.entity';
import { InviteEntity } from '../../invites/entities/invite.entity';
import { VerticalTenantEntity } from '../../vertical-tenants/entities/vertical-tenant.entity';

@Entity('company_verticals')
export class CompanyVerticalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.companyVerticals, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ name: 'vertical_id', type: 'uuid' })
  verticalId: string;

  @ManyToOne(
    () => VerticalEntity,
    (vertical) => vertical.companyVerticals,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'vertical_id' })
  vertical: VerticalEntity;

  @Column({
    type: 'enum',
    enum: CompanyVerticalStatus,
    default: CompanyVerticalStatus.PENDING,
  })
  status: CompanyVerticalStatus;

  @Column({ name: 'plan_name', type: 'varchar', length: 120, nullable: true })
  planName: string | null;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
    nullable: true,
  })
  billingCycle: BillingCycle | null;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({
    name: 'external_company_id',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  externalCompanyId: string | null;

  @Column({
    name: 'external_tenant_id',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  externalTenantId: string | null;

  @Column({
    name: 'provisioning_status',
    type: 'enum',
    enum: ProvisioningStatus,
    default: ProvisioningStatus.NOT_SENT,
  })
  provisioningStatus: ProvisioningStatus;

  @Column({ name: 'provisioned_at', type: 'timestamptz', nullable: true })
  provisionedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => OrderEntity, (order) => order.companyVertical)
  orders: OrderEntity[];

  @OneToOne(
    () => SubscriptionEntity,
    (subscription) => subscription.companyVertical,
  )
  subscription: SubscriptionEntity | null;

  @OneToMany(() => InviteEntity, (invite) => invite.companyVertical)
  invites: InviteEntity[];

  @OneToOne(
    () => VerticalTenantEntity,
    (verticalTenant) => verticalTenant.companyVertical,
  )
  verticalTenant: VerticalTenantEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}