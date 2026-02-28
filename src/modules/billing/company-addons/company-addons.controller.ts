import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CompanyAddonsService } from './company-addons.service';
import { EnableAddonDto } from './dtos/enable-addon.dto';
import { DisableAddonDto } from './dtos/disable-addon.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { VendorGuard } from '../../../common/guards/vendor.guard';

@UseGuards(JwtGuard, VendorGuard)
@Controller('billing/company-addons')
export class CompanyAddonsController {
  constructor(private readonly service: CompanyAddonsService) {}

  @Post('enable')
  enable(@Body() dto: EnableAddonDto) {
    return this.service.enable(dto);
  }

  @Post('disable')
  disable(@Body() dto: DisableAddonDto) {
    return this.service.disable(dto);
  }

  @Get(':companyVerticalId')
  list(@Param('companyVerticalId') companyVerticalId: string) {
    return this.service.listByCompanyVertical(companyVerticalId);
  }
}
