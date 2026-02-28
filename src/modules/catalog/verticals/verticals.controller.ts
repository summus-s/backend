import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { VerticalsService } from './verticals.service';
import { CreateVerticalDto } from './dtos/create-vertical.dto';
import { UpdateVerticalDto } from './dtos/update-vertical.dto';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { VendorGuard } from '../../../common/guards/vendor.guard';

@Controller('catalog/verticals')
export class VerticalsController {
  constructor(private readonly service: VerticalsService) {}

  // ✅ Público: catálogo visible (si quieres)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ✅ Público: ver detalle (si quieres)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 🔒 Solo staff Lumo (VENDOR)
  @UseGuards(JwtGuard, VendorGuard)
  @Post()
  create(@Body() dto: CreateVerticalDto) {
    return this.service.create(dto);
  }

  // 🔒 Solo staff Lumo (VENDOR)
  @UseGuards(JwtGuard, VendorGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVerticalDto) {
    return this.service.update(id, dto);
  }

  // 🔒 Solo staff Lumo (VENDOR)
  @UseGuards(JwtGuard, VendorGuard)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
