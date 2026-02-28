import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MembershipEntity,
  MembershipStatus,
} from '../access/memberships/entities/membership.entity';
import { CompanyVerticalEntity } from '../company-verticals/entities/company-vertical.entity';
import { CompanyEntity } from '../companies/entities/company.entity';
import { VerticalEntity } from '../catalog/verticals/entities/vertical.entity';
import { MembershipRoleEntity } from '../access/membership-roles/entities/membership-role.entity';
import { RoleEntity } from '../access/roles/entities/role.entity';

import { SsoService } from '../sso/sso.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipsRepo: Repository<MembershipEntity>,
    @InjectRepository(CompanyVerticalEntity)
    private readonly companyVerticalsRepo: Repository<CompanyVerticalEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companiesRepo: Repository<CompanyEntity>,
    @InjectRepository(VerticalEntity)
    private readonly verticalsRepo: Repository<VerticalEntity>,
    @InjectRepository(MembershipRoleEntity)
    private readonly membershipRolesRepo: Repository<MembershipRoleEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,

    private readonly ssoService: SsoService,
  ) {}

  async getCompanyVerticals(userId: string) {
    const memberships = await this.membershipsRepo.find({
      where: { userId, status: MembershipStatus.ACTIVE },
    });

    const results: {
      membershipId: string;
      companyVerticalId: string;
      companyId?: string;
      companyName?: string;
      verticalId?: string;
      verticalKey?: string;
      verticalName?: string;
      roles: string[];
      status: string;
      isOwner: boolean;
    }[] = [];

    for (const m of memberships) {
      const cv = await this.companyVerticalsRepo.findOne({
        where: { id: m.companyVerticalId },
      });
      if (!cv) continue;

      const company = await this.companiesRepo.findOne({
        where: { id: cv.companyId },
      });

      const vertical = await this.verticalsRepo.findOne({
        where: { id: cv.verticalId },
      });

      const roleLinks = await this.membershipRolesRepo.find({
        where: { membershipId: m.id },
      });

      const roles: string[] = [];
      for (const rl of roleLinks) {
        const role = await this.rolesRepo.findOne({ where: { id: rl.roleId } });
        if (role) roles.push(role.name);
      }

      results.push({
        membershipId: m.id,
        companyVerticalId: cv.id,
        companyId: company?.id,
        companyName: company?.name,
        verticalId: vertical?.id,
        verticalKey: vertical?.key,
        verticalName: vertical?.name,
        roles,
        status: cv.status,
        isOwner: m.isOwner,
      });
    }

    return results;
  }

  createRedirect(userId: string, companyVerticalId: string) {
    return this.ssoService.createRedirect(userId, companyVerticalId);
  }
}