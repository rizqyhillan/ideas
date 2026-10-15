import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Roles } from '../database/entities/entities/Roles';
import { Permissions } from '../database/entities/entities/Permissions';
import { RolePermissions } from '../database/entities/entities/RolePermissions';

import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { RolesService } from './roles.service';
import { RolesExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Permissions, RolePermissions])],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, RolesExportImportService],
  exports: [RolesService, RolesExportImportService],
})
export class RolesModule {}
