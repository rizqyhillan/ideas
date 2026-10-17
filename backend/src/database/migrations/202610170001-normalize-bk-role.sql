-- Keep one canonical role for Bimbingan Konseling.
-- Existing users and permissions are preserved while the legacy `bk` code is
-- merged into `guru_bk`.
DO $$
DECLARE
  legacy_id SMALLINT;
  canonical_id SMALLINT;
BEGIN
  SELECT id INTO legacy_id FROM roles WHERE code = 'bk';
  SELECT id INTO canonical_id FROM roles WHERE code = 'guru_bk';

  IF legacy_id IS NULL THEN
    RETURN;
  END IF;

  IF canonical_id IS NULL THEN
    UPDATE roles
    SET code = 'guru_bk',
        name = COALESCE(NULLIF(name, ''), 'Guru BK'),
        description = COALESCE(description, 'Guru bimbingan dan konseling')
    WHERE id = legacy_id;
    RETURN;
  END IF;

  INSERT INTO user_roles (user_id, role_id, assigned_at, expires_at, assigned_by)
  SELECT user_id, canonical_id, assigned_at, expires_at, assigned_by
  FROM user_roles
  WHERE role_id = legacy_id
  ON CONFLICT (user_id, role_id) DO NOTHING;

  INSERT INTO role_permissions (role_id, permission_id, created_at)
  SELECT canonical_id, permission_id, created_at
  FROM role_permissions
  WHERE role_id = legacy_id
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  DELETE FROM user_roles WHERE role_id = legacy_id;
  DELETE FROM role_permissions WHERE role_id = legacy_id;
  DELETE FROM roles WHERE id = legacy_id;
END $$;
