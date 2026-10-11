import { IsArray, IsNumber } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray({ message: 'permissionIds harus berupa array' })
  @IsNumber({}, { each: true, message: 'Setiap permission ID harus berupa angka' })
  permissionIds: number[];
}
