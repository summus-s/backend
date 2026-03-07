import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformUserEntity } from './entities/platform-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformUserEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class PlatformUsersModule {}