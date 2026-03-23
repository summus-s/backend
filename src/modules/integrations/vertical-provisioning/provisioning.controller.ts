import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import { ProvisioningService } from './provisioning.service';
import { ProvisionVerticalTenantDto } from './dto/provision-vertical-tenant.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('integrations/vertical-provisioning')
export class ProvisioningController {
  constructor(private readonly provisioningService: ProvisioningService) {}

  @Post('vertical-tenants/:id/provision')
  provision(
    @Param('id') id: string,
    @Body() dto: ProvisionVerticalTenantDto,
  ) {
    return this.provisioningService.provision(id, dto);
  }
}