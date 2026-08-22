import * as bcrypt from 'bcryptjs';

import { AppDataSource } from '../datasource';

import { Users } from '../entities/entities/Users';
import { Roles } from '../entities/entities/Roles';
import { UserRoles } from '../entities/entities/UserRoles';

export async function adminSeeder() {
  const userRepository = AppDataSource.getRepository(Users);
  const roleRepository = AppDataSource.getRepository(Roles);
  const userRoleRepository = AppDataSource.getRepository(UserRoles);

  const username = 'admin';

  const email = 'admin@ideas.id';

  const password = 'admin123';

  //----------------------------------------------------

  const existing = await userRepository.findOne({
    where: {
      username,
    },
  });

  if (existing) {
    console.log('✔ Admin sudah ada');

    return;
  }

  //----------------------------------------------------

  const adminRole = await roleRepository.findOne({
    where: {
      code: 'admin',
    },
  });

  if (!adminRole) {
    throw new Error(
      'Role ADMIN tidak ditemukan. Pastikan database SQL sudah diimport.',
    );
  }

  //----------------------------------------------------

  const hash = await bcrypt.hash(password, 10);

  const admin = userRepository.create({
    username,
    email,
    passwordHash: hash,
    status: 'aktif',
  });

  const savedUser = await userRepository.save(admin);

  //----------------------------------------------------

  const userRole = userRoleRepository.create({
    userId: savedUser.id,
    roleId: adminRole.id,
  });

  await userRoleRepository.save(userRole);

  console.log('======================================');

  console.log('Admin berhasil dibuat');

  console.log('Username : admin');

  console.log('Password : admin123');

  console.log('======================================');
}
