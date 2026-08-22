import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

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
  role: string;
}
