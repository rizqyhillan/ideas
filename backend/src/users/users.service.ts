import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from '../database/entities/entities/Users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

async findById(id: number) {
  return this.usersRepository.findOne({
    where: {
      id,
    },

    relations: {
      userRoles2: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },

      userPermissions2: {
        permission: true,
      },
    },
  });
}

  async findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async updateLastLogin(id: number) {
  await this.usersRepository.update(id, {
    lastLoginAt: new Date(),
  });
}
}