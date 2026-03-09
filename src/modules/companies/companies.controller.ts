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

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { SuspendCompanyDto } from './dto/suspend-company.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createDto: CreateCompanyDto) {
    return this.companiesService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryCompaniesDto) {
    return this.companiesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateDto);
  }

  @Patch(':id/suspend')
  suspend(
    @Param('id') id: string,
    @Body() suspendDto: SuspendCompanyDto,
  ) {
    return this.companiesService.suspend(id, suspendDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.companiesService.activate(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.companiesService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}