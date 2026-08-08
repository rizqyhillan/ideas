import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Body,
  Post,
  Patch,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { Permissions } from '../auth/decorators/permissions.decorator';

import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Permissions('users.view')
  findAll(
    @Query() query: QueryUserDto,
  ) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions('users.view')
  findOne(
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(+id);
  }

@Post()
create(
  @Body() dto: CreateUserDto,
) {
  return this.usersService.create(dto);
}
@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateUserDto,
) {
  return this.usersService.update(id, dto);
}
@Delete(':id')
remove(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.usersService.remove(id);
}
}