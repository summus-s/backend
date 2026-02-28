import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AccountType } from '../../modules/users/enums/account-type.enum';

@Injectable()
export class VendorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    if (user.accountType !== AccountType.VENDOR) {
      throw new ForbiddenException('Only Lumo staff can access this resource');
    }

    return true;
  }
}
