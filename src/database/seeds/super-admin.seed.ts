import { Injectable, Logger } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';

import { PlatformUserEntity } from '../../modules/platform-users/entities/platform-user.entity';
import { PlatformUserStatus } from '../../modules/platform-users/enums/platform-user-status.enum';
import { PlatformRoleEntity } from '../../modules/platform-roles/entities/platform-role.entity';
import { PlatformRoleKey } from '../../modules/platform-roles/enums/platform-role-key.enum';
import { PlatformUserRoleEntity } from '../../modules/platform-user-roles/entities/platform-user-role.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';

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

    const userRepo = this.dataSource.getRepository(PlatformUserEntity);
    const roleRepo = this.dataSource.getRepository(PlatformRoleEntity);
    const userRoleRepo = this.dataSource.getRepository(PlatformUserRoleEntity);

    let superAdminRole = await roleRepo.findOne({
      where: { key: PlatformRoleKey.SUPERADMIN },
    });

    if (!superAdminRole) {
      superAdminRole = roleRepo.create({
        key: PlatformRoleKey.SUPERADMIN,
        name: 'Super Admin',
      });

      superAdminRole = await roleRepo.save(superAdminRole);
      this.logger.log(`Rol creado: ${superAdminRole.key}`);
    } else {
      this.logger.log(`Rol ya existe: ${superAdminRole.key}`);
    }

    let user = await userRepo.findOne({
      where: { email },
    });

    if (!user) {
      const passwordHash = await CryptoUtil.hashPassword(password);

      user = userRepo.create({
        email,
        passwordHash,
        fullName,
        status: PlatformUserStatus.ACTIVE,
      });

      user = await userRepo.save(user);
      this.logger.log(`Superadmin creado: ${email}`);
    } else {
      this.logger.log(`Superadmin ya existe: ${email}`);
    }

    const existingUserRole = await userRoleRepo.findOne({
      where: {
        platformUserId: user.id,
        platformRoleId: superAdminRole.id,
        companyVerticalId: IsNull(),
      },
    });

    if (!existingUserRole) {
      const userRole = userRoleRepo.create({
        platformUserId: user.id,
        platformRoleId: superAdminRole.id,
        companyVerticalId: null,
        isActive: true,
        assignedAt: new Date(),
        revokedAt: null,
        statusReason: 'Asignación inicial de superadmin',
        notes: null,
      });

      await userRoleRepo.save(userRole);
      this.logger.log(`Rol ${superAdminRole.key} asignado a ${email}`);
    } else {
      this.logger.log(
        `El usuario ${email} ya tiene el rol ${superAdminRole.key}`,
      );
    }
  }
}