import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTahunAjaranDto {
  @IsNotEmpty({ message: 'Nama tahun ajaran tidak boleh kosong' })
  @IsString({ message: 'Nama tahun ajaran harus berupa string' })
  @Matches(/^[0-9]{4}\/[0-9]{4}$/, {
    message: 'Format tahun ajaran harus YYYY/YYYY (contoh: 2024/2025)',
  })
  nama: string;

  @IsNotEmpty({ message: 'Tanggal mulai tidak boleh kosong' })
  @IsDateString({}, { message: 'Tanggal mulai harus berupa format tanggal valid (YYYY-MM-DD)' })
  tanggalMulai: string;

  @IsNotEmpty({ message: 'Tanggal selesai tidak boleh kosong' })
  @IsDateString({}, { message: 'Tanggal selesai harus berupa format tanggal valid (YYYY-MM-DD)' })
  tanggalSelesai: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus berupa boolean' })
  isActive?: boolean;
}
