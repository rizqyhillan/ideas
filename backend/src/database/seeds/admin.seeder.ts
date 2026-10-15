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

  const existing = await userRepository.findOne({
    where: {
      username,
    },
  });

  if (existing) {
    // Pastikan akun admin tidak menyimpan role lain akibat perubahan manual.
    const assignedRoles = await userRoleRepository.find({
      where: { userId: existing.id },
    });
    const staleRoles = assignedRoles.filter(
      (userRole) => userRole.roleId !== adminRole.id,
    );
    if (staleRoles.length > 0) {
      await userRoleRepository.remove(staleRoles);
    }
    if (!assignedRoles.some((userRole) => userRole.roleId === adminRole.id)) {
      await userRoleRepository.save(
        userRoleRepository.create({ userId: existing.id, roleId: adminRole.id }),
      );
    }
    console.log('↻ Admin sudah ada, role admin disinkronkan');

    return;
  }

  //----------------------------------------------------

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
