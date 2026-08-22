import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['aktif', 'nonaktif', 'ditangguhkan'])
  status?: 'aktif' | 'nonaktif' | 'ditangguhkan';

  @IsOptional()
  @IsString()
  @IsIn([
    'admin',
    'guru',
    'guru_bk',
    'staff_perpustakaan',
    'staff_ekstrakurikuler',
    'kepala_sekolah',
    'siswa',
  ])
  role?: string;
}
