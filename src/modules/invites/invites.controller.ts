import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { QueryInvitesDto } from './dto/query-invites.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { RevokeInviteDto } from './dto/revoke-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPlatformAuthGuard } from '../../common/guards/jwt-platform-auth.guard';
import { PlatformRolesGuard } from '../../common/guards/platform-roles.guard';

@UseGuards(JwtPlatformAuthGuard, PlatformRolesGuard)
@Roles('SUPERADMIN')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  create(@Body() createDto: CreateInviteDto) {
    return this.invitesService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryInvitesDto) {
    return this.invitesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitesService.findById(id);
  }

  @Patch(':id/resend')
  resend(@Param('id') id: string, @Body() dto: ResendInviteDto) {
    return this.invitesService.resend(id, dto);
  }

  @Patch(':id/revoke')
  revoke(@Param('id') id: string, @Body() dto: RevokeInviteDto) {
    return this.invitesService.revoke(id, dto);
  }
}

@Controller('public/invites')
export class PublicInvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.invitesService.findByToken(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invitesService.accept(token, dto);
  }
}