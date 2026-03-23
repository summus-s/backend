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

import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('billing/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@Body() createDto: CreatePlanDto) {
    return this.plansService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryPlansDto) {
    return this.plansService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePlanDto) {
    return this.plansService.update(id, updateDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.plansService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.plansService.deactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}