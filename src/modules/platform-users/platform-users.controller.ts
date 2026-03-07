import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PlatformUsersService } from './platform-users.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserDto } from './dto/update-platform-user.dto';
import { QueryPlatformUsersDto } from './dto/query-platform-users.dto';
import { SetPlatformUserStatusDto } from './dto/set-platform-user-status.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from 'src/common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from 'src/common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('platform-users')
export class PlatformUsersController {
  constructor(private readonly platformUsersService: PlatformUsersService) {}

  @Post()
  create(@Body() createDto: CreatePlatformUserDto) {
    return this.platformUsersService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryPlatformUsersDto) {
    return this.platformUsersService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformUsersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePlatformUserDto) {
    return this.platformUsersService.update(id, updateDto);
  }

  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() statusDto: SetPlatformUserStatusDto,
  ) {
    return this.platformUsersService.setStatus(id, statusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformUsersService.remove(id);
  }
}