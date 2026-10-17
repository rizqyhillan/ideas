import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJadwalPiketDto {
  @IsInt()
  @Min(1)
  semesterId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nama: string;

  @IsIn(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'])
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
  jamMulai: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
  jamSelesai: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lokasi?: string | null;

  @IsOptional()
  @IsBoolean()
  statusAktif?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  @Min(1, { each: true })
  guruIds?: number[];
}

export class UpdateJadwalPiketDto extends PartialType(CreateJadwalPiketDto) {}
