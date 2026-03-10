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

import { CompanyContactsService } from './company-contacts.service';
import { CreateCompanyContactDto } from './dto/create-company-contact.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';
import { QueryCompanyContactsDto } from './dto/query-company-contacts.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('company-contacts')
export class CompanyContactsController {
  constructor(
    private readonly companyContactsService: CompanyContactsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateCompanyContactDto) {
    return this.companyContactsService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryCompanyContactsDto) {
    return this.companyContactsService.findAll(queryDto);
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.companyContactsService.findByCompanyId(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyContactsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyContactDto,
  ) {
    return this.companyContactsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyContactsService.remove(id);
  }
}