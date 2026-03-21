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

import { CompanyVerticalsService } from './company-verticals.service';
import { CreateCompanyVerticalDto } from './dto/create-company-vertical.dto';
import { UpdateCompanyVerticalDto } from './dto/update-company-vertical.dto';
import { QueryCompanyVerticalsDto } from './dto/query-company-verticals.dto';
import { SuspendCompanyVerticalDto } from './dto/suspend-company-vertical.dto';
import { CancelCompanyVerticalDto } from './dto/cancel-company-vertical.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';
import { ActivateCompanyVerticalDto } from './dto/activate-company-vertical.dto';


@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('company-verticals')
export class CompanyVerticalsController {
  constructor(
    private readonly companyVerticalsService: CompanyVerticalsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateCompanyVerticalDto) {
    return this.companyVerticalsService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryCompanyVerticalsDto) {
    return this.companyVerticalsService.findAll(queryDto);
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.companyVerticalsService.findByCompanyId(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyVerticalsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyVerticalDto,
  ) {
    return this.companyVerticalsService.update(id, updateDto);
  }

  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
    @Body() _activateDto: ActivateCompanyVerticalDto,
  ) {
    return this.companyVerticalsService.activate(id);
  }

  @Patch(':id/suspend')
  suspend(
    @Param('id') id: string,
    @Body() suspendDto: SuspendCompanyVerticalDto,
  ) {
    return this.companyVerticalsService.suspend(id, suspendDto);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelCompanyVerticalDto,
  ) {
    return this.companyVerticalsService.cancel(id, cancelDto);
  }
  
}