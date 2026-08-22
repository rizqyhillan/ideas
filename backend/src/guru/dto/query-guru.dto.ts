import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Transform } from 'class-transformer';

export class QueryGuruDto {
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
  @IsIn(['id', 'kodeGuru', 'createdAt'])
  sort: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'ASC';
}
