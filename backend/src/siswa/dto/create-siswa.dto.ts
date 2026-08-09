import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSiswaDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  nisn: string;

  @IsOptional()
  @IsString()
  nis?: string;

  @IsString()
  namaLengkap: string;

  @IsEnum(['L', 'P'])
  jenisKelamin: 'L' | 'P';

  @IsOptional()
  @IsString()
  tempatLahir?: string;

  @IsOptional()
  @IsString()
  tanggalLahir?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  noTelepon?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  namaWali?: string;

  @IsOptional()
  @IsString()
  noTeleponWali?: string;

  @IsOptional()
  @IsBoolean()
  statusAktif?: boolean;
}