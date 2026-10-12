import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../database/entities/entities/Users';
import { Roles } from '../database/entities/entities/Roles';
import { UserRoles } from '../database/entities/entities/UserRoles';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Roles, UserRoles])],

  controllers: [UsersController],

  providers: [UsersService, { provide: EXPORT_IMPORT_SERVICE, useClass: UsersExportImportService }, PdfService],

  exports: [UsersService],
})
export class UsersModule {}
