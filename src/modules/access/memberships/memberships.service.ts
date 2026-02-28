import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MembershipEntity, MembershipStatus } from './entities/membership.entity';
import { CreateMembershipDto } from './dtos/create-membership.dto';
import { UpdateMembershipDto } from './dtos/update-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly repo: Repository<MembershipEntity>,
  ) {}

  async create(dto: CreateMembershipDto) {
    const exists = await this.repo.findOne({
      where: { companyVerticalId: dto.companyVerticalId, userId: dto.userId },
    });
    if (exists) throw new BadRequestException('User already has membership for this company vertical');

    const membership = this.repo.create({
      companyVerticalId: dto.companyVerticalId,
      userId: dto.userId,
      status: MembershipStatus.ACTIVE,
      isOwner: dto.isOwner,
      deletedAt: null,
    });

    return this.repo.save(membership);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Membership not found');
    return m;
  }

  async update(id: string, dto: UpdateMembershipDto) {
    const m = await this.findOne(id);

    if (dto.status) {
      m.status = dto.status;
      if (dto.status === MembershipStatus.REMOVED) {
        m.deletedAt = new Date();
      }
    }

    if (dto.isOwner !== undefined) {
      m.isOwner = !!dto.isOwner;
    }

    return this.repo.save(m);
  }
}
