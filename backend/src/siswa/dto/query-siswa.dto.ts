import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class QuerySiswaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  statusAktif?: string;

  @IsOptional()
  @IsIn(['namaLengkap', 'nis', 'nisn', 'createdAt'])
  sort: 'namaLengkap' | 'nis' | 'nisn' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}
