import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { PlatformUserEntity } from '../../modules/platform-users/entities/platform-user.entity';
import { PlatformUserStatus } from '../../modules/platform-users/enums/platform-user-status.enum';

@Injectable()
export class SuperAdminSeed {
  private readonly logger = new Logger(SuperAdminSeed.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const email = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.SUPERADMIN_PASSWORD;
    const fullName = process.env.SUPERADMIN_NAME ?? 'Super Admin';

    if (!email || !password) {
      this.logger.warn(
        'SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no configurados en .env',
      );
      return;
    }

    const repo = this.dataSource.getRepository(PlatformUserEntity);

    const existing = await repo.findOne({
      where: { email },
    });

    if (existing) {
      this.logger.log(`Superadmin ya existe: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = repo.create({
      email,
      passwordHash,
      fullName,
      status: PlatformUserStatus.ACTIVE,
    });

    await repo.save(user);

    this.logger.log(`Superadmin creado: ${email}`);
  }
}