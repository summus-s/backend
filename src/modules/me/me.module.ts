import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeController } from './me.controller';
import { MeService } from './me.service';

import { MembershipEntity } from '../access/memberships/entities/membership.entity';
import { CompanyVerticalEntity } from '../company-verticals/entities/company-vertical.entity';
import { CompanyEntity } from '../companies/entities/company.entity';
import { VerticalEntity } from '../catalog/verticals/entities/vertical.entity';
import { MembershipRoleEntity } from '../access/membership-roles/entities/membership-role.entity';
import { RoleEntity } from '../access/roles/entities/role.entity';

import { SsoModule } from '../sso/sso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MembershipEntity,
      CompanyVerticalEntity,
      CompanyEntity,
      VerticalEntity,
      MembershipRoleEntity,
      RoleEntity,
    ]),
    SsoModule,
  ],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}