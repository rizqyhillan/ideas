import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Roles } from '../database/entities/entities/Roles';
import { Permissions } from '../database/entities/entities/Permissions';
import { RolePermissions } from '../database/entities/entities/RolePermissions';

import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Permissions, RolePermissions])],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
