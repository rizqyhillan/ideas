import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentAttendanceDto {
  @IsInt()
  siswaId: number;

  @IsEnum(['hadir', 'sakit', 'izin', 'alpa'])
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';

  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class CreateAbsensiSesiDto {
  @IsInt()
  kelasId: number;

  @IsOptional()
  @IsInt()
  guruId?: number;

  @IsDateString()
  tanggal: string;

  @IsOptional()
  @IsString()
  jamKe?: string;

  @IsOptional()
  @IsString()
  mataPelajaran?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  items: StudentAttendanceDto[];
}
