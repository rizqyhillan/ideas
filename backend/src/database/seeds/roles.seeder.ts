import { AppDataSource } from '../datasource';
import { Roles } from '../entities/entities/Roles';
import { UserRoles } from '../entities/entities/UserRoles';

export async function rolesSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Roles);
  const userRoleRepo = AppDataSource.getRepository(UserRoles);

  const roles = [
    { code: 'admin', name: 'Administrator', description: 'Akses penuh ke sistem', isSystem: true },
    { code: 'guru', name: 'Guru', description: 'Guru / PNS', isSystem: true },
    { code: 'guru_bk', name: 'Guru BK', description: 'Guru bimbingan dan konseling', isSystem: true },
    { code: 'siswa', name: 'Siswa', description: 'Siswa aktif', isSystem: true },
  ];

  // Database lama pernah memakai nama super_admin dan bk. Migrasikan
  // assignment-nya ke role canonical tanpa menghapus user atau data domain.
  const roleAliases: Record<string, string> = {
    super_admin: 'admin',
    bk: 'guru_bk',
  };
  for (const [legacyCode, canonicalCode] of Object.entries(roleAliases)) {
    const legacy = await repo.findOne({ where: { code: legacyCode } });
    if (!legacy) continue;
    const canonical = await repo.findOne({ where: { code: canonicalCode } });
    if (!canonical) continue;

    const assignments = await userRoleRepo.find({ where: { roleId: legacy.id } });
    for (const assignment of assignments) {
      const alreadyAssigned = await userRoleRepo.findOne({
        where: { userId: assignment.userId, roleId: canonical.id },
      });
      if (!alreadyAssigned) {
        await userRoleRepo.save(
          userRoleRepo.create({ userId: assignment.userId, roleId: canonical.id }),
        );
      }
    }
    if (assignments.length > 0) {
      await userRoleRepo.delete({ roleId: legacy.id });
    }
    await repo.remove(legacy);
    console.log(`↻ Role lama '${legacyCode}' dimigrasikan ke '${canonicalCode}'`);
  }

  let created = 0;
  for (const data of roles) {
    const existing = await repo.findOne({ where: { code: data.code } });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    } else if (
      existing.name !== data.name ||
      existing.description !== data.description ||
      existing.isSystem !== data.isSystem
    ) {
      existing.name = data.name;
      existing.description = data.description;
      existing.isSystem = data.isSystem;
      await repo.save(existing);
    }
  }

  console.log(`✔  Roles created: ${created}`);
  console.log('   - admin, guru, guru_bk, siswa');
}
