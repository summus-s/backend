import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SsoService } from './sso.service';
import { SsoController } from './sso.controller';
import { SsoTicketEntity } from './entities/sso-ticket.entity';
import { MembershipEntity } from '../access/memberships/entities/membership.entity';
import { VerticalEntity } from '../catalog/verticals/entities/vertical.entity';
import { CompanyVerticalEntity } from '../company-verticals/entities/company-vertical.entity';
import { SubscriptionsModule } from '../billing/subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SsoTicketEntity,
      MembershipEntity,
      CompanyVerticalEntity, // ✅ ESTE ES EL QUE TE FALTA
      VerticalEntity,
    ]),
    SubscriptionsModule, // ✅ aquí
  ],
  controllers: [SsoController],
  providers: [SsoService],
  exports: [SsoService],
})
export class SsoModule {}
