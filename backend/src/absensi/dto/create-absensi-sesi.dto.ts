import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @IsOptional()
  @IsIn(['mengajar', 'piket', 'substitusi'])
  mode?: 'mengajar' | 'piket' | 'substitusi';

  @IsDateString()
  tanggal: string;

  @IsNotEmpty()
  @IsString()
  jamKe: string;

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
