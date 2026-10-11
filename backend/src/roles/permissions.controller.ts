import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles as RolesDecorator } from '../auth/decorators/roles.decorator';

import { RolesService } from './roles.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesDecorator('admin')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Query('module') module?: string) {
    return this.rolesService.findAllPermissions(module);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOnePermission(id);
  }
}
