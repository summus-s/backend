import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';

import { PlatformRolesService } from './platform-roles.service';
import { CreatePlatformRoleDto } from './dto/create-platform-role.dto';
import { UpdatePlatformRoleDto } from './dto/update-platform-role.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';
import { PaginationDto } from '../../common/dto/pagination.dto'

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('platform-roles')
export class PlatformRolesController {
  constructor(private readonly platformRolesService: PlatformRolesService) {}

  @Post()
  create(@Body() createDto: CreatePlatformRoleDto) {
    return this.platformRolesService.create(createDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.platformRolesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformRolesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePlatformRoleDto) {
    return this.platformRolesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformRolesService.remove(id);
  }
}