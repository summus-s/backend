import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MeService } from '../me/me.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { AuthRequest } from '../../common/types/auth-request.type';
import { CreateTicketDto } from '../sso/dtos/create-ticket.dto';

@UseGuards(JwtGuard)
@Controller('me')
export class MeController {
  constructor(private readonly service: MeService) {}

  @Get('company-verticals')
  getCompanyVerticals(@Req() req: AuthRequest) {
    return this.service.getCompanyVerticals(req.user.sub);
  }

  @Post('redirect')
  redirect(@Req() req: AuthRequest, @Body() dto: CreateTicketDto) {
    return this.service.createRedirect(req.user.sub, dto.companyVerticalId);
  }
}