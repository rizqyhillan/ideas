import { IsIn, IsOptional, IsString } from 'class-validator';

export class ProvisionAccountsDto {
  @IsString()
  @IsIn(['guru', 'siswa'])
  source: 'guru' | 'siswa';

  /**
   * Guru BK is assigned explicitly by the admin. The canonical role code is
   * guru_bk; the old bk alias is intentionally not accepted here.
   */
  @IsOptional()
  @IsString()
  @IsIn(['guru', 'guru_bk'])
  role?: 'guru' | 'guru_bk';
}
