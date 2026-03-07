import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { PlatformUserRolesService } from './platform-user-roles.service';
import { AssignPlatformRoleDto } from './dto/assign-platform-role.dto';
import { RemovePlatformRoleDto } from './dto/remove-platform-role.dto';

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