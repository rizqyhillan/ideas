import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Tahun ajaran tidak boleh kosong' })
  @IsInt({ message: 'Tahun ajaran ID harus berupa bilangan bulat' })
  tahunAjaranId: number;

  @IsNotEmpty({ message: 'Nama kelas tidak boleh kosong' })
  @IsString({ message: 'Nama kelas harus berupa string' })
  @MaxLength(50, { message: 'Nama kelas maksimal 50 karakter' })
  nama: string;

  @IsNotEmpty({ message: 'Tingkat kelas tidak boleh kosong' })
  @IsInt({ message: 'Tingkat kelas harus berupa angka' })
  @Min(7, { message: 'Tingkat kelas minimal 7' })
  @Max(9, { message: 'Tingkat kelas maksimal 9' })
  tingkat: number;

  @IsOptional()
  @IsInt({ message: 'Wali kelas ID harus berupa bilangan bulat' })
  waliKelasId?: number;

  @IsOptional()
  @IsInt({ message: 'Kapasitas harus berupa angka bulat' })
  @Min(1, { message: 'Kapasitas minimal 1' })
  kapasitas?: number;

  @IsOptional()
  @IsString({ message: 'Ruang kelas harus berupa string' })
  @MaxLength(100, { message: 'Ruang kelas maksimal 100 karakter' })
  ruang?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  statusAktif?: boolean;
}
