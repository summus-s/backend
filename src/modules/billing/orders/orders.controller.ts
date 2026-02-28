import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { VendorGuard } from '../../../common/guards/vendor.guard';

@UseGuards(JwtGuard, VendorGuard)
@Controller('billing/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
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

  @Post(':id/paid')
  markPaid(@Param('id') id: string) {
    return this.service.markAsPaid(id);
  }

  @Post(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.service.finalizeOrder(id);
  }

}
