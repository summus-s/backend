import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CompanyVerticalsService } from './company-verticals.service';
import { CreateCompanyVerticalDto } from './dtos/create-company-vertical.dto';
import { UpdateCompanyVerticalDto } from './dtos/update-company-vertical.dto';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { VendorGuard } from '../../common/guards/vendor.guard';

@UseGuards(JwtGuard, VendorGuard)
@Controller('company-verticals')
export class CompanyVerticalsController {
  constructor(private readonly service: CompanyVerticalsService) {}

  @Post()
  create(@Body() dto: CreateCompanyVerticalDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCompanyVerticalDto) {
    return this.service.update(id, dto);
  }
}
