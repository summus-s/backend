import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { SsoService } from './sso.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { ExchangeTicketDto } from './dtos/exchange-ticket.dto';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../common/types/auth-request.type';
import { SubscriptionGuard } from '../billing/guards/subscription.guard';

@Controller('sso')
export class SsoController {
  constructor(private readonly service: SsoService) {}

  /**
   * 🔐 Usuario logueado en Lumo
   */
  @UseGuards(JwtGuard, SubscriptionGuard)
  @Post('ticket')
  createTicket(@Req() req: AuthRequest, @Body() dto: CreateTicketDto) {
    return this.service.createTicket(req.user.sub, dto.companyVerticalId);
  }

  @UseGuards(JwtGuard, SubscriptionGuard)
  @Post('redirect')
  redirect(@Req() req: AuthRequest, @Body() dto: CreateTicketDto) {
    return this.service.createRedirect(req.user.sub, dto.companyVerticalId);
  }
  /**
   * 🔓 Vertical app (sin JWT de Lumo)
   */
  @Post('exchange')
  exchange(@Body() dto: ExchangeTicketDto) {
    return this.service.exchangeTicket(dto.ticket);
  }
}
