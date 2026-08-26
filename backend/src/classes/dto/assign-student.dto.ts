import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class AssignStudentsDto {
  @IsNotEmpty({ message: 'Daftar siswa tidak boleh kosong' })
  @IsArray({ message: 'siswaIds harus berupa array ID siswa' })
  @ArrayMinSize(1, { message: 'Minimal pilih 1 siswa' })
  @IsInt({ each: true, message: 'Setiap ID siswa harus berupa angka bulat' })
  siswaIds: number[];

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggalMasuk harus berupa YYYY-MM-DD' })
  tanggalMasuk?: string;
}

export class RemoveStudentDto {
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggalKeluar harus berupa YYYY-MM-DD' })
  tanggalKeluar?: string;
}
