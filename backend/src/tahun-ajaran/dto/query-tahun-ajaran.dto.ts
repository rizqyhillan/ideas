import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class QueryTahunAjaranDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @IsOptional()
  @IsIn([
    'id',
    'nama',
    'tanggalMulai',
    'tanggalSelesai',
    'createdAt',
  ])
  sort: string = 'id';

  @IsOptional()
  @IsIn([
    'ASC',
    'DESC',
    'asc',
    'desc',
  ])
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  order: 'ASC' | 'DESC' = 'ASC';
}
