import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../database/entities/entities/Users';
import { Roles } from '../database/entities/entities/Roles';
import { UserRoles } from '../database/entities/entities/UserRoles';
import { Pegawai } from '../database/entities/entities/Pegawai';
import { Siswa } from '../database/entities/entities/Siswa';
import { Guru } from '../database/entities/entities/Guru';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Roles, UserRoles, Pegawai, Siswa, Guru])],

  controllers: [UsersController],

  providers: [UsersService, UsersExportImportService],

  exports: [UsersService, UsersExportImportService],
})
export class UsersModule {}
