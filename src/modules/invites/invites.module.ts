import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InviteEntity } from './entities/invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InviteEntity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class InvitesModule {}