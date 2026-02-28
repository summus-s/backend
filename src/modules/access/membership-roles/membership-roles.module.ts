import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MembershipRolesController } from './membership-roles.controller';
import { MembershipRolesService } from './membership-roles.service';

import { MembershipRoleEntity } from './entities/membership-role.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { RoleEntity } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipRoleEntity, MembershipEntity, RoleEntity])],
  controllers: [MembershipRolesController],
  providers: [MembershipRolesService],
})
export class MembershipRolesModule {}
