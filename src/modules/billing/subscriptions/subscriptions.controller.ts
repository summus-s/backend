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

import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('billing/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QuerySubscriptionsDto) {
    return this.subscriptionsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.subscriptionsService.activate(id);
  }

  @Patch(':id/suspend')
  suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.subscriptionsService.suspend(id, reason);
  }

  @Patch(':id/past-due')
  markPastDue(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.subscriptionsService.markPastDue(id, reason);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancel(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}