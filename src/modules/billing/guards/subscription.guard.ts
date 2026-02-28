import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SubscriptionEntity,
  SubscriptionStatus,
} from '../subscriptions/entities/subscription.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subsRepo: Repository<SubscriptionEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    /**
     * El companyVerticalId puede venir:
     * - en body (POST)
     * - en query
     * - o inyectado luego en headers
     */
    const companyVerticalId =
      req.body?.companyVerticalId ||
      req.query?.companyVerticalId ||
      req.params?.companyVerticalId;

    if (!companyVerticalId) {
      throw new ForbiddenException('companyVerticalId is required');
    }

    const sub = await this.subsRepo.findOne({
      where: { companyVerticalId },
    });

    if (!sub) {
      throw new ForbiddenException('No subscription found');
    }

    if (
      sub.status !== SubscriptionStatus.ACTIVE &&
      sub.status !== SubscriptionStatus.TRIAL
    ) {
      throw new ForbiddenException('Subscription inactive');
    }

    return true;
  }
}
