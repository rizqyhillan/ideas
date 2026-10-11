import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Kode role wajib diisi' })
  @IsString({ message: 'Kode role harus berupa teks' })
  @MaxLength(50, { message: 'Kode role maksimal 50 karakter' })
  code: string;

  @IsNotEmpty({ message: 'Nama role wajib diisi' })
  @IsString({ message: 'Nama role harus berupa teks' })
  @MaxLength(100, { message: 'Nama role maksimal 100 karakter' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isSystem harus berupa boolean' })
  isSystem?: boolean;
}
