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

import { VerticalTenantsService } from './vertical-tenants.service';
import { CreateVerticalTenantDto } from './dto/create-vertical-tenant.dto';
import { UpdateVerticalTenantDto } from './dto/update-vertical-tenant.dto';
import { QueryVerticalTenantsDto } from './dto/query-vertical-tenants.dto';
import { MarkProvisioningDto } from './dto/mark-provisioning.dto';
import { MarkProvisionedDto } from './dto/mark-provisioned.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { SuspendVerticalTenantDto } from './dto/suspend-vertical-tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('vertical-tenants')
export class VerticalTenantsController {
  constructor(
    private readonly verticalTenantsService: VerticalTenantsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateVerticalTenantDto) {
    return this.verticalTenantsService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryVerticalTenantsDto) {
    return this.verticalTenantsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verticalTenantsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateVerticalTenantDto) {
    return this.verticalTenantsService.update(id, updateDto);
  }

  @Patch(':id/mark-provisioning')
  markProvisioning(
    @Param('id') id: string,
    @Body() dto: MarkProvisioningDto,
  ) {
    return this.verticalTenantsService.markProvisioning(id, dto);
  }

  @Patch(':id/mark-provisioned')
  markProvisioned(
    @Param('id') id: string,
    @Body() dto: MarkProvisionedDto,
  ) {
    return this.verticalTenantsService.markProvisioned(id, dto);
  }

  @Patch(':id/mark-failed')
  markFailed(@Param('id') id: string, @Body() dto: MarkFailedDto) {
    return this.verticalTenantsService.markFailed(id, dto);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body() dto: SuspendVerticalTenantDto) {
    return this.verticalTenantsService.suspend(id, dto);
  }

  @Patch(':id/retry')
  retry(@Param('id') id: string, @Body() dto: MarkProvisioningDto) {
    return this.verticalTenantsService.retry(id, dto);
  }
}