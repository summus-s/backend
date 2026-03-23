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

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { MarkOrderPaidDto } from './dto/mark-order-paid.dto';
import { MarkOrderFailedDto } from './dto/mark-order-failed.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('billing/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateDto);
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string, @Body() dto: MarkOrderPaidDto) {
    return this.ordersService.markPaid(id, dto);
  }

  @Patch(':id/mark-failed')
  markFailed(@Param('id') id: string, @Body() dto: MarkOrderFailedDto) {
    return this.ordersService.markFailed(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.ordersService.cancel(id, reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}