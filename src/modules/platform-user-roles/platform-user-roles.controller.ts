import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PlatformUserRolesService } from './platform-user-roles.service';
import { CreatePlatformUserRoleDto } from './dto/create-platform-user-role.dto';
import { QueryPlatformUserRolesDto } from './dto/query-platform-user-roles.dto';
import { RevokePlatformUserRoleDto } from './dto/revoke-platform-user-role.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('platform-user-roles')
export class PlatformUserRolesController {
  constructor(
    private readonly platformUserRolesService: PlatformUserRolesService,
  ) {}

  @Post()
  create(@Body() createDto: CreatePlatformUserRoleDto) {
    return this.platformUserRolesService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryPlatformUserRolesDto) {
    return this.platformUserRolesService.findAll(queryDto);
  }

  @Get('user/:platformUserId')
  findByUserId(@Param('platformUserId') platformUserId: string) {
    return this.platformUserRolesService.findByUserId(platformUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformUserRolesService.findById(id);
  }

  @Patch(':id/revoke')
  revoke(@Param('id') id: string, @Body() dto: RevokePlatformUserRoleDto) {
    return this.platformUserRolesService.revoke(id, dto);
  }
}