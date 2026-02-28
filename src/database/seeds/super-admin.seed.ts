import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../modules/users/entities/user.entity';
import { AccountType } from '../../modules/users/enums/account-type.enum';
import { UserStatus } from '../../modules/users/enums/user-status.enum';

@Injectable()
export class SuperAdminSeed {
  private readonly logger = new Logger(SuperAdminSeed.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const email = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD;
    const fullName = process.env.SUPERADMIN_NAME ?? 'Super Admin';

    if (!email || !password) {
      this.logger.warn('SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no configurados');
      return;
    }

    const repo = this.dataSource.getRepository(UserEntity);

    const exists = await repo.findOne({ where: { email } });
    if (exists) {
      this.logger.log(`Super admin ya existe: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = repo.create({
      email,
      passwordHash,
      fullName,
      accountType: AccountType.VENDOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    await repo.save(user);

    this.logger.log(`Super admin creado: ${email}`);
  }
}
