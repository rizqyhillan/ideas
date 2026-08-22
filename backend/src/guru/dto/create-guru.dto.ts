import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGuruDto {
  @IsInt()
  pegawaiId: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  kodeGuru?: string;
}
