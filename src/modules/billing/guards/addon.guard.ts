import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyVerticalAddonEntity } from '../company-addons/entities/company-vertical-addon.entity';
import { AddonEntity } from '../addons/entities/addon.entity';

export function AddonGuard(addonKey: string) {
  @Injectable()
  class AddonGuardMixin implements CanActivate {
    constructor(
      @InjectRepository(CompanyVerticalAddonEntity)
      readonly companyAddonsRepo: Repository<CompanyVerticalAddonEntity>,

      @InjectRepository(AddonEntity)
      readonly addonsRepo: Repository<AddonEntity>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();

      const companyVerticalId =
        req.body?.companyVerticalId ||
        req.query?.companyVerticalId ||
        req.params?.companyVerticalId;

      if (!companyVerticalId) {
        throw new ForbiddenException('companyVerticalId is required');
      }

      const addon = await this.addonsRepo.findOne({
        where: { key: addonKey, isActive: true },
      });

      if (!addon) {
        throw new ForbiddenException('Addon not available');
      }

      const enabled = await this.companyAddonsRepo.findOne({
        where: {
          companyVerticalId,
          addonId: addon.id,
          isEnabled: true,
        },
      });

      if (!enabled) {
        throw new ForbiddenException(`Addon ${addonKey} not enabled`);
      }

      return true;
    }
  }

  return mixin(AddonGuardMixin);
}
