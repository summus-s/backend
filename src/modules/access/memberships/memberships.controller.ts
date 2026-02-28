import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dtos/create-membership.dto';
import { UpdateMembershipDto } from './dtos/update-membership.dto';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { VendorGuard } from '../../../common/guards/vendor.guard';

@UseGuards(JwtGuard, VendorGuard)
@Controller('access/memberships')
export class MembershipsController {
  constructor(private readonly service: MembershipsService) {}

  @Post()
  create(@Body() dto: CreateMembershipDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMembershipDto) {
    return this.service.update(id, dto);
  }
}
