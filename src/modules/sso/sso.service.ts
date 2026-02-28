import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { SsoTicketEntity } from './entities/sso-ticket.entity';
import { MembershipEntity, MembershipStatus } from '../access/memberships/entities/membership.entity';
import { CompanyVerticalEntity } from '../company-verticals/entities/company-vertical.entity';
import { VerticalEntity } from '../catalog/verticals/entities/vertical.entity';

@Injectable()
export class SsoService {
  constructor(
    @InjectRepository(SsoTicketEntity)
    private readonly ticketsRepo: Repository<SsoTicketEntity>,

    @InjectRepository(MembershipEntity)
    private readonly membershipsRepo: Repository<MembershipEntity>,

    @InjectRepository(CompanyVerticalEntity)
    private readonly companyVerticalsRepo: Repository<CompanyVerticalEntity>,

    @InjectRepository(VerticalEntity)
    private readonly verticalsRepo: Repository<VerticalEntity>,
  ) {}

  /**
   * Usuario logueado en Lumo → genera ticket SSO
   */
  async createTicket(userId: string, companyVerticalId: string) {
    const membership = await this.membershipsRepo.findOne({
      where: { userId, companyVerticalId, status: MembershipStatus.ACTIVE },
    });

    if (!membership) {
      throw new ForbiddenException('User has no access to this vertical');
    }

    const token = randomBytes(48).toString('hex');

    const ticket = this.ticketsRepo.create({
      token,
      userId,
      companyVerticalId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2), // 2 minutos
      usedAt: null,
    });

    await this.ticketsRepo.save(ticket);

    return { ticket: token };
  }

  /**
   * Vertical app → intercambia ticket por identidad
   */
  async exchangeTicket(token: string) {
    const ticket = await this.ticketsRepo.findOne({
      where: { token },
    });

    if (!ticket) {
      throw new UnauthorizedException('Invalid ticket');
    }

    if (ticket.usedAt) {
      throw new UnauthorizedException('Ticket already used');
    }

    if (ticket.expiresAt < new Date()) {
      throw new UnauthorizedException('Ticket expired');
    }

    ticket.usedAt = new Date();
    await this.ticketsRepo.save(ticket);

    return {
      userId: ticket.userId,
      companyVerticalId: ticket.companyVerticalId,
    };
  }
  /**
 * Usuario logueado → devuelve URL final para redirigir al vertical
 */
  async createRedirect(userId: string, companyVerticalId: string) {
    // 1️⃣ reutilizamos lo que ya funciona
    const { ticket } = await this.createTicket(userId, companyVerticalId);

    // 2️⃣ buscamos el contrato
    const cv = await this.companyVerticalsRepo.findOne({
      where: { id: companyVerticalId },
    });
    if (!cv) {
      throw new BadRequestException('CompanyVertical not found');
    }

    // 3️⃣ buscamos el vertical
    const vertical = await this.verticalsRepo.findOne({
      where: { id: cv.verticalId },
    });
    if (!vertical) {
      throw new BadRequestException('Vertical not found');
    }

    // 4️⃣ armamos URL final
    const redirectUrl =
      `${vertical.appBaseUrl}${vertical.ssoCallbackPath}?ticket=${ticket}`;

    return { redirectUrl };
  }
}
