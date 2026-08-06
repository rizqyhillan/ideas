import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePegawaiDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  namaLengkap: string;

  @IsOptional()
  @IsString()
  nip?: string;

  @IsOptional()
  @IsString()
  nuptk?: string;

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
  jabatan?: string;

  @IsOptional()
  @IsBoolean()
  statusAktif?: boolean;
}