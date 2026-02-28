import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { MembershipRolesService } from './membership-roles.service';
import { AssignRoleDto } from './dtos/assign-role.dto';
import { RemoveRoleDto } from './dtos/remove-role.dto';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { VendorGuard } from '../../../common/guards/vendor.guard';

@UseGuards(JwtGuard, VendorGuard)
@Controller('access/membership-roles')
export class MembershipRolesController {
  constructor(private readonly service: MembershipRolesService) {}

  @Post('assign')
  assign(@Body() dto: AssignRoleDto) {
    return this.service.assign(dto);
  }

  @Delete('remove')
  remove(@Body() dto: RemoveRoleDto) {
    return this.service.remove(dto);
  }

  @Get('membership/:membershipId')
  listByMembership(@Param('membershipId') membershipId: string) {
    return this.service.listByMembership(membershipId);
  }
}
