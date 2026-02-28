import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MembershipRoleEntity } from '../membership-roles/entities/membership-role.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { AssignRoleDto } from './dtos/assign-role.dto';
import { RemoveRoleDto } from './dtos/remove-role.dto';

@Injectable()
export class MembershipRolesService {
  constructor(
    @InjectRepository(MembershipRoleEntity)
    private readonly repo: Repository<MembershipRoleEntity>,

    @InjectRepository(MembershipEntity)
    private readonly membershipsRepo: Repository<MembershipEntity>,

    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
  ) {}

  /**
   * ✅ Regla clave:
   * Solo puedes asignar un role si:
   * - membership existe
   * - role existe
   * - ambos pertenecen al MISMO companyVerticalId (scope)
   */
  async assign(dto: AssignRoleDto) {
    const membership = await this.membershipsRepo.findOne({ where: { id: dto.membershipId } });
    if (!membership) throw new NotFoundException('Membership not found');

    const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    if (membership.companyVerticalId !== role.companyVerticalId) {
      throw new BadRequestException('Role does not belong to the same company vertical as membership');
    }

    const exists = await this.repo.findOne({
      where: { membershipId: dto.membershipId, roleId: dto.roleId },
    });
    if (exists) throw new BadRequestException('Role already assigned to this membership');

    const mr = this.repo.create({
      membershipId: dto.membershipId,
      roleId: dto.roleId,
    });

    return this.repo.save(mr);
  }

  async remove(dto: RemoveRoleDto) {
    const exists = await this.repo.findOne({
      where: { membershipId: dto.membershipId, roleId: dto.roleId },
    });

    if (!exists) throw new NotFoundException('Role assignment not found');

    await this.repo.delete({ id: exists.id });
    return { ok: true };
  }

  /**
   * Lista roles asignados a una membership
   */
  async listByMembership(membershipId: string) {
    return this.repo.find({
      where: { membershipId },
      order: { createdAt: 'DESC' },
    });
  }
}
