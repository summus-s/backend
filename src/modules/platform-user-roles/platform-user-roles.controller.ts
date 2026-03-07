import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { PlatformUserRolesService } from './platform-user-roles.service';
import { AssignPlatformRoleDto } from './dto/assign-platform-role.dto';
import { RemovePlatformRoleDto } from './dto/remove-platform-role.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from 'src/common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from 'src/common/guards/platform-roles.guard';


@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('platform-user-roles')
export class PlatformUserRolesController {
  constructor(
    private readonly platformUserRolesService: PlatformUserRolesService,
  ) {}

  @Post()
  assignRole(@Body() assignDto: AssignPlatformRoleDto) {
    return this.platformUserRolesService.assignRole(assignDto);
  }

  @Delete()
  removeRole(@Body() removeDto: RemovePlatformRoleDto) {
    return this.platformUserRolesService.removeRole(removeDto);
  }

  @Get('user/:userId')
  findRolesByUser(@Param('userId') userId: string) {
    return this.platformUserRolesService.findRolesByUserId(userId);
  }
}