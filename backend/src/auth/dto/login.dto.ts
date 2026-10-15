import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Diterima sebagai email atau username. Nama properti dipertahankan
  // sebagai `email` agar kompatibel dengan client lama.
  @IsString({ message: 'Email atau username harus berupa teks' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password!: string;
}
