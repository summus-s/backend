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

import { VerticalsService } from './verticals.service';
import { CreateVerticalDto } from './dto/create-vertical.dto';
import { UpdateVerticalDto } from './dto/update-vertical.dto';
import { QueryVerticalsDto } from './dto/query-verticals.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('verticals')
export class VerticalsController {
  constructor(private readonly verticalsService: VerticalsService) {}

  @Post()
  create(@Body() createDto: CreateVerticalDto) {
    return this.verticalsService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryVerticalsDto) {
    return this.verticalsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verticalsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVerticalDto,
  ) {
    return this.verticalsService.update(id, updateDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.verticalsService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.verticalsService.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verticalsService.remove(id);
  }
}