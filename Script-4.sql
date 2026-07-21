DO $$
BEGIN
    IF current_database() <> 'splasma_db' THEN
        RAISE EXCEPTION
            'Database aktif adalah %, seharusnya splasma_db. Ubah koneksi DBeaver terlebih dahulu.',
            current_database();
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    ) THEN
        RAISE EXCEPTION
            'Schema public tidak kosong. Gunakan database baru atau jalankan 03_reset_database.sql terlebih dahulu.';
    END IF;
END;
$$;

BEGIN;

SET search_path TO public;


-- --------------------------------------------------------------------------
-- ENUM
-- --------------------------------------------------------------------------

CREATE TYPE status_user AS ENUM (
    'aktif',
    'nonaktif',
    'ditangguhkan'
);

CREATE TYPE jenis_kelamin AS ENUM (
    'L',
    'P'
);

CREATE TYPE jenis_semester AS ENUM (
    'ganjil',
    'genap'
);

CREATE TYPE nama_hari AS ENUM (
    'senin',
    'selasa',
    'rabu',
    'kamis',
    'jumat',
    'sabtu'
);

CREATE TYPE status_absensi AS ENUM (
    'hadir',
    'sakit',
    'izin',
    'alpa'
);

CREATE TYPE visibilitas_konseling AS ENUM (
    'rahasia',
    'internal_bk',
    'siswa'
);

CREATE TYPE kondisi_buku AS ENUM (
    'baik',
    'rusak_ringan',
    'rusak_berat',
    'hilang'
);

CREATE TYPE status_inventaris_buku AS ENUM (
    'tersedia',
    'dipinjam',
    'perbaikan',
    'hilang',
    'nonaktif'
);

CREATE TYPE status_keanggotaan AS ENUM (
    'aktif',
    'nonaktif',
    'lulus',
    'keluar'
);

CREATE TYPE aksi_persetujuan AS ENUM (
    'create',
    'update',
    'delete'
);

CREATE TYPE status_persetujuan AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected',
    'cancelled'
);

-- --------------------------------------------------------------------------
-- FUNGSI UMUM
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- --------------------------------------------------------------------------
-- AUTHORIZATION: USERS, ROLES, PERMISSIONS
-- --------------------------------------------------------------------------

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    status status_user NOT NULL DEFAULT 'aktif',
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT ck_users_username_not_blank
        CHECK (BTRIM(username) <> ''),
    CONSTRAINT ck_users_email_not_blank
        CHECK (email IS NULL OR BTRIM(email) <> '')
);

CREATE UNIQUE INDEX uq_users_username_ci
    ON users (LOWER(username))
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_users_email_ci
    ON users (LOWER(email))
    WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_users_status ON users (status);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE roles (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_roles_code_format
        CHECK (code ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT ck_roles_name_not_blank
        CHECK (BTRIM(name) <> '')
);

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE permissions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_permissions_code_format
        CHECK (code ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
    CONSTRAINT uq_permissions_module_action UNIQUE (module, action)
);

CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id SMALLINT NOT NULL,
    assigned_by INTEGER,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,

    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_user_roles_expiry
        CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);

CREATE TABLE role_permissions (
    role_id SMALLINT NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX idx_role_permissions_permission_id
    ON role_permissions (permission_id);

-- Permission langsung dapat menjadi grant atau deny. Deny selalu mengalahkan
-- permission yang berasal dari role.
CREATE TABLE user_permissions (
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    is_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_by INTEGER,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    reason TEXT,

    PRIMARY KEY (user_id, permission_id),
    CONSTRAINT fk_user_permissions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_permissions_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_user_permissions_expiry
        CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE INDEX idx_user_permissions_permission_id
    ON user_permissions (permission_id);

-- --------------------------------------------------------------------------
-- PROFIL PEGAWAI, GURU, DAN SISWA
-- --------------------------------------------------------------------------

CREATE TABLE pegawai (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    nip VARCHAR(30),
    nuptk VARCHAR(30),
    jenis_kelamin jenis_kelamin NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    email VARCHAR(255),
    no_telepon VARCHAR(30),
    alamat TEXT,
    jabatan VARCHAR(150),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_pegawai_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_pegawai_nama_not_blank
        CHECK (BTRIM(nama_lengkap) <> '')
);

CREATE UNIQUE INDEX uq_pegawai_nip
    ON pegawai (nip)
    WHERE nip IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_pegawai_nuptk
    ON pegawai (nuptk)
    WHERE nuptk IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_pegawai_email_ci
    ON pegawai (LOWER(email))
    WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_pegawai_nama ON pegawai (nama_lengkap);
CREATE INDEX idx_pegawai_status_aktif ON pegawai (status_aktif);

CREATE TRIGGER trg_pegawai_updated_at
BEFORE UPDATE ON pegawai
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Guru adalah subtype pegawai. Guru BK tetap direpresentasikan melalui role
-- `guru_bk`, sehingga satu guru dapat sekaligus memiliki role `guru` dan
-- `guru_bk` tanpa menggandakan profil.
CREATE TABLE guru (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pegawai_id INTEGER NOT NULL UNIQUE,
    kode_guru VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_guru_pegawai
        FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_guru_kode
    ON guru (kode_guru)
    WHERE kode_guru IS NOT NULL;

CREATE TRIGGER trg_guru_updated_at
BEFORE UPDATE ON guru
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE siswa (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER UNIQUE,
    nisn VARCHAR(20) NOT NULL,
    nis VARCHAR(30),
    nama_lengkap VARCHAR(255) NOT NULL,
    jenis_kelamin jenis_kelamin NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    email VARCHAR(255),
    no_telepon VARCHAR(30),
    alamat TEXT,
    nama_wali VARCHAR(255),
    no_telepon_wali VARCHAR(30),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_siswa_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_siswa_nisn_not_blank
        CHECK (BTRIM(nisn) <> ''),
    CONSTRAINT ck_siswa_nama_not_blank
        CHECK (BTRIM(nama_lengkap) <> '')
);

CREATE UNIQUE INDEX uq_siswa_nisn
    ON siswa (nisn)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_siswa_nis
    ON siswa (nis)
    WHERE nis IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_siswa_email_ci
    ON siswa (LOWER(email))
    WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_siswa_nama ON siswa (nama_lengkap);
CREATE INDEX idx_siswa_status_aktif ON siswa (status_aktif);

CREATE TRIGGER trg_siswa_updated_at
BEFORE UPDATE ON siswa
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- STRUKTUR AKADEMIK
-- --------------------------------------------------------------------------

CREATE TABLE tahun_ajaran (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama VARCHAR(20) NOT NULL UNIQUE,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_tahun_ajaran_tanggal
        CHECK (tanggal_selesai > tanggal_mulai),
    CONSTRAINT ck_tahun_ajaran_nama
        CHECK (nama ~ '^[0-9]{4}/[0-9]{4}$')
);

CREATE UNIQUE INDEX uq_tahun_ajaran_active
    ON tahun_ajaran (is_active)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_tahun_ajaran_updated_at
BEFORE UPDATE ON tahun_ajaran
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE semester (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tahun_ajaran_id SMALLINT NOT NULL,
    jenis jenis_semester NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_semester_tahun_ajaran
        FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    CONSTRAINT uq_semester_tahun_jenis
        UNIQUE (tahun_ajaran_id, jenis),
    CONSTRAINT ck_semester_tanggal
        CHECK (tanggal_selesai > tanggal_mulai)
);

CREATE UNIQUE INDEX uq_semester_active
    ON semester (is_active)
    WHERE is_active = TRUE;

CREATE INDEX idx_semester_tahun_ajaran ON semester (tahun_ajaran_id);

CREATE TRIGGER trg_semester_updated_at
BEFORE UPDATE ON semester
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE kelas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tahun_ajaran_id SMALLINT NOT NULL,
    nama VARCHAR(50) NOT NULL,
    tingkat SMALLINT NOT NULL,
    wali_kelas_id INTEGER,
    kapasitas SMALLINT,
    ruang VARCHAR(100),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_kelas_tahun_ajaran
        FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    CONSTRAINT fk_kelas_wali
        FOREIGN KEY (wali_kelas_id) REFERENCES guru(id) ON DELETE SET NULL,
    CONSTRAINT fk_kelas_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_kelas_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_kelas_tingkat
        CHECK (tingkat BETWEEN 7 AND 9),
    CONSTRAINT ck_kelas_kapasitas
        CHECK (kapasitas IS NULL OR kapasitas > 0),
    CONSTRAINT ck_kelas_nama_not_blank
        CHECK (BTRIM(nama) <> '')
);

CREATE UNIQUE INDEX uq_kelas_tahun_nama
    ON kelas (tahun_ajaran_id, LOWER(nama))
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_kelas_wali_per_tahun
    ON kelas (tahun_ajaran_id, wali_kelas_id)
    WHERE wali_kelas_id IS NOT NULL
      AND status_aktif = TRUE
      AND deleted_at IS NULL;

CREATE INDEX idx_kelas_tahun_ajaran ON kelas (tahun_ajaran_id);
CREATE INDEX idx_kelas_wali ON kelas (wali_kelas_id);

CREATE TRIGGER trg_kelas_updated_at
BEFORE UPDATE ON kelas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE siswa_kelas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    siswa_id INTEGER NOT NULL,
    kelas_id INTEGER NOT NULL,
    tanggal_masuk DATE NOT NULL,
    tanggal_keluar DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_siswa_kelas_siswa
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_siswa_kelas_kelas
        FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_siswa_kelas_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_siswa_kelas_history
        UNIQUE (siswa_id, kelas_id),
    CONSTRAINT ck_siswa_kelas_tanggal
        CHECK (tanggal_keluar IS NULL OR tanggal_keluar >= tanggal_masuk),
    CONSTRAINT ck_siswa_kelas_active_consistency
        CHECK (
            (is_active = TRUE AND tanggal_keluar IS NULL)
            OR
            (is_active = FALSE AND tanggal_keluar IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uq_siswa_satu_kelas_aktif
    ON siswa_kelas (siswa_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_siswa_kelas_kelas ON siswa_kelas (kelas_id);

CREATE TRIGGER trg_siswa_kelas_updated_at
BEFORE UPDATE ON siswa_kelas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE mata_pelajaran (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kode VARCHAR(30) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT ck_mata_pelajaran_kode_not_blank
        CHECK (BTRIM(kode) <> ''),
    CONSTRAINT ck_mata_pelajaran_nama_not_blank
        CHECK (BTRIM(nama) <> '')
);

CREATE UNIQUE INDEX uq_mata_pelajaran_kode_ci
    ON mata_pelajaran (LOWER(kode))
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_mata_pelajaran_nama_ci
    ON mata_pelajaran (LOWER(nama))
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_mata_pelajaran_updated_at
BEFORE UPDATE ON mata_pelajaran
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE jadwal_pelajaran (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    semester_id SMALLINT NOT NULL,
    kelas_id INTEGER NOT NULL,
    mata_pelajaran_id INTEGER NOT NULL,
    guru_id INTEGER NOT NULL,
    hari nama_hari NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruang VARCHAR(100),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_jadwal_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_kelas
        FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_mata_pelajaran
        FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_guru
        FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_jadwal_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_jadwal_waktu
        CHECK (jam_selesai > jam_mulai)
);

CREATE INDEX idx_jadwal_semester ON jadwal_pelajaran (semester_id);
CREATE INDEX idx_jadwal_kelas ON jadwal_pelajaran (kelas_id);
CREATE INDEX idx_jadwal_guru ON jadwal_pelajaran (guru_id);
CREATE INDEX idx_jadwal_mapel ON jadwal_pelajaran (mata_pelajaran_id);
CREATE INDEX idx_jadwal_hari ON jadwal_pelajaran (hari);

CREATE UNIQUE INDEX uq_jadwal_kelas_start
    ON jadwal_pelajaran (semester_id, kelas_id, hari, jam_mulai)
    WHERE status_aktif = TRUE AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_jadwal_guru_start
    ON jadwal_pelajaran (semester_id, guru_id, hari, jam_mulai)
    WHERE status_aktif = TRUE AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION validate_jadwal_pelajaran_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status_aktif = FALSE OR NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jadwal_pelajaran jp
        WHERE jp.id <> COALESCE(NEW.id, 0)
          AND jp.semester_id = NEW.semester_id
          AND jp.hari = NEW.hari
          AND jp.status_aktif = TRUE
          AND jp.deleted_at IS NULL
          AND (jp.kelas_id = NEW.kelas_id OR jp.guru_id = NEW.guru_id)
          AND NEW.jam_mulai < jp.jam_selesai
          AND NEW.jam_selesai > jp.jam_mulai
    ) THEN
        RAISE EXCEPTION
            'Jadwal bentrok untuk kelas atau guru pada hari dan rentang waktu yang sama';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_jadwal_validate_overlap
BEFORE INSERT OR UPDATE OF semester_id, kelas_id, guru_id, hari, jam_mulai,
    jam_selesai, status_aktif, deleted_at
ON jadwal_pelajaran
FOR EACH ROW EXECUTE FUNCTION validate_jadwal_pelajaran_overlap();

CREATE TRIGGER trg_jadwal_updated_at
BEFORE UPDATE ON jadwal_pelajaran
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- ABSENSI SISWA
-- --------------------------------------------------------------------------

CREATE TABLE sesi_absensi_siswa (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jadwal_pelajaran_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    dibuka_oleh_guru_id INTEGER NOT NULL,
    dibuka_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ditutup_pada TIMESTAMPTZ,
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sesi_absensi_jadwal
        FOREIGN KEY (jadwal_pelajaran_id) REFERENCES jadwal_pelajaran(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sesi_absensi_guru
        FOREIGN KEY (dibuka_oleh_guru_id) REFERENCES guru(id) ON DELETE RESTRICT,
    CONSTRAINT uq_sesi_absensi_jadwal_tanggal
        UNIQUE (jadwal_pelajaran_id, tanggal),
    CONSTRAINT ck_sesi_absensi_waktu_tutup
        CHECK (ditutup_pada IS NULL OR ditutup_pada >= dibuka_pada)
);

CREATE INDEX idx_sesi_absensi_tanggal ON sesi_absensi_siswa (tanggal);
CREATE INDEX idx_sesi_absensi_guru ON sesi_absensi_siswa (dibuka_oleh_guru_id);

CREATE TRIGGER trg_sesi_absensi_updated_at
BEFORE UPDATE ON sesi_absensi_siswa
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE absensi_siswa (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sesi_absensi_id INTEGER NOT NULL,
    siswa_id INTEGER NOT NULL,
    status status_absensi NOT NULL,
    keterangan TEXT,
    dicatat_oleh INTEGER,
    dicatat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absensi_siswa_sesi
        FOREIGN KEY (sesi_absensi_id) REFERENCES sesi_absensi_siswa(id) ON DELETE CASCADE,
    CONSTRAINT fk_absensi_siswa_siswa
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_absensi_siswa_dicatat_oleh
        FOREIGN KEY (dicatat_oleh) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_absensi_siswa_per_sesi
        UNIQUE (sesi_absensi_id, siswa_id),
    CONSTRAINT ck_absensi_siswa_keterangan
        CHECK (
            status = 'hadir'
            OR keterangan IS NULL
            OR BTRIM(keterangan) <> ''
        )
);

CREATE INDEX idx_absensi_siswa_siswa ON absensi_siswa (siswa_id);
CREATE INDEX idx_absensi_siswa_status ON absensi_siswa (status);

CREATE TRIGGER trg_absensi_siswa_updated_at
BEFORE UPDATE ON absensi_siswa
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- ABSENSI GURU DAN GURU PIKET
-- --------------------------------------------------------------------------

CREATE TABLE absensi_guru (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    guru_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    status status_absensi NOT NULL,
    waktu_masuk TIMESTAMPTZ,
    waktu_pulang TIMESTAMPTZ,
    latitude_masuk NUMERIC(10, 7),
    longitude_masuk NUMERIC(10, 7),
    latitude_pulang NUMERIC(10, 7),
    longitude_pulang NUMERIC(10, 7),
    keterangan TEXT,
    diverifikasi_oleh INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absensi_guru_guru
        FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE RESTRICT,
    CONSTRAINT fk_absensi_guru_verifikator
        FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_absensi_guru_tanggal
        UNIQUE (guru_id, tanggal),
    CONSTRAINT ck_absensi_guru_waktu
        CHECK (waktu_pulang IS NULL OR waktu_masuk IS NULL OR waktu_pulang >= waktu_masuk),
    CONSTRAINT ck_absensi_guru_lat_masuk
        CHECK (latitude_masuk IS NULL OR latitude_masuk BETWEEN -90 AND 90),
    CONSTRAINT ck_absensi_guru_lon_masuk
        CHECK (longitude_masuk IS NULL OR longitude_masuk BETWEEN -180 AND 180),
    CONSTRAINT ck_absensi_guru_lat_pulang
        CHECK (latitude_pulang IS NULL OR latitude_pulang BETWEEN -90 AND 90),
    CONSTRAINT ck_absensi_guru_lon_pulang
        CHECK (longitude_pulang IS NULL OR longitude_pulang BETWEEN -180 AND 180)
);

CREATE INDEX idx_absensi_guru_tanggal ON absensi_guru (tanggal);
CREATE INDEX idx_absensi_guru_status ON absensi_guru (status);

CREATE TRIGGER trg_absensi_guru_updated_at
BEFORE UPDATE ON absensi_guru
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE jadwal_piket (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    semester_id SMALLINT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    hari nama_hari NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    lokasi VARCHAR(100),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_jadwal_piket_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_piket_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_jadwal_piket_nama_not_blank
        CHECK (BTRIM(nama) <> ''),
    CONSTRAINT ck_jadwal_piket_waktu
        CHECK (jam_selesai > jam_mulai)
);

CREATE UNIQUE INDEX uq_jadwal_piket_identitas
    ON jadwal_piket (semester_id, LOWER(nama), hari, jam_mulai)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_jadwal_piket_semester ON jadwal_piket (semester_id);

CREATE TRIGGER trg_jadwal_piket_updated_at
BEFORE UPDATE ON jadwal_piket
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE jadwal_piket_guru (
    jadwal_piket_id INTEGER NOT NULL,
    guru_id INTEGER NOT NULL,
    assigned_by INTEGER,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (jadwal_piket_id, guru_id),
    CONSTRAINT fk_jadwal_piket_guru_jadwal
        FOREIGN KEY (jadwal_piket_id) REFERENCES jadwal_piket(id) ON DELETE CASCADE,
    CONSTRAINT fk_jadwal_piket_guru_guru
        FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_piket_guru_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_jadwal_piket_guru_guru ON jadwal_piket_guru (guru_id);

CREATE TABLE absensi_guru_piket (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jadwal_piket_id INTEGER NOT NULL,
    guru_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    status status_absensi NOT NULL,
    waktu_absen TIMESTAMPTZ,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absensi_piket_penugasan
        FOREIGN KEY (jadwal_piket_id, guru_id)
        REFERENCES jadwal_piket_guru(jadwal_piket_id, guru_id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_absensi_piket_guru_tanggal
        UNIQUE (jadwal_piket_id, guru_id, tanggal),
    CONSTRAINT ck_absensi_piket_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_absensi_piket_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX idx_absensi_piket_tanggal ON absensi_guru_piket (tanggal);
CREATE INDEX idx_absensi_piket_guru ON absensi_guru_piket (guru_id);

CREATE TRIGGER trg_absensi_guru_piket_updated_at
BEFORE UPDATE ON absensi_guru_piket
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- KONSELING SISWA
-- --------------------------------------------------------------------------

CREATE TABLE catatan_konseling (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    siswa_id INTEGER NOT NULL,
    guru_bk_id INTEGER NOT NULL,
    tanggal TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    topik VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    tindak_lanjut TEXT,
    visibilitas visibilitas_konseling NOT NULL DEFAULT 'rahasia',
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_konseling_siswa
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_konseling_guru_bk
        FOREIGN KEY (guru_bk_id) REFERENCES guru(id) ON DELETE RESTRICT,
    CONSTRAINT fk_konseling_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_konseling_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_konseling_topik_not_blank
        CHECK (BTRIM(topik) <> ''),
    CONSTRAINT ck_konseling_isi_not_blank
        CHECK (BTRIM(isi) <> '')
);

CREATE INDEX idx_konseling_siswa ON catatan_konseling (siswa_id);
CREATE INDEX idx_konseling_guru_bk ON catatan_konseling (guru_bk_id);
CREATE INDEX idx_konseling_tanggal ON catatan_konseling (tanggal);
CREATE INDEX idx_konseling_visibilitas ON catatan_konseling (visibilitas);

CREATE TRIGGER trg_catatan_konseling_updated_at
BEFORE UPDATE ON catatan_konseling
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- PERPUSTAKAAN
-- --------------------------------------------------------------------------

CREATE TABLE kategori_buku (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_kategori_buku_nama UNIQUE (nama),
    CONSTRAINT ck_kategori_buku_nama_not_blank CHECK (BTRIM(nama) <> '')
);

CREATE TRIGGER trg_kategori_buku_updated_at
BEFORE UPDATE ON kategori_buku
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE buku (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kategori_id SMALLINT,
    isbn VARCHAR(30),
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(255),
    penerbit VARCHAR(255),
    tahun_terbit SMALLINT,
    deskripsi TEXT,
    url_sampul TEXT,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_buku_kategori
        FOREIGN KEY (kategori_id) REFERENCES kategori_buku(id) ON DELETE SET NULL,
    CONSTRAINT fk_buku_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_buku_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_buku_judul_not_blank
        CHECK (BTRIM(judul) <> ''),
    CONSTRAINT ck_buku_tahun_terbit
        CHECK (tahun_terbit IS NULL OR tahun_terbit BETWEEN 1000 AND 9999)
);

CREATE UNIQUE INDEX uq_buku_isbn
    ON buku (isbn)
    WHERE isbn IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_buku_judul ON buku (judul);
CREATE INDEX idx_buku_kategori ON buku (kategori_id);

CREATE TRIGGER trg_buku_updated_at
BEFORE UPDATE ON buku
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE inventaris_buku (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    buku_id INTEGER NOT NULL,
    kode_inventaris VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    lokasi_rak VARCHAR(100),
    tanggal_perolehan DATE,
    sumber_perolehan VARCHAR(150),
    harga_perolehan NUMERIC(14, 2),
    kondisi kondisi_buku NOT NULL DEFAULT 'baik',
    status status_inventaris_buku NOT NULL DEFAULT 'tersedia',
    catatan TEXT,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_inventaris_buku_buku
        FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inventaris_buku_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_inventaris_buku_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_inventaris_kode_not_blank
        CHECK (BTRIM(kode_inventaris) <> ''),
    CONSTRAINT ck_inventaris_harga
        CHECK (harga_perolehan IS NULL OR harga_perolehan >= 0)
);

CREATE UNIQUE INDEX uq_inventaris_kode
    ON inventaris_buku (kode_inventaris)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_inventaris_barcode
    ON inventaris_buku (barcode)
    WHERE barcode IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_inventaris_buku ON inventaris_buku (buku_id);
CREATE INDEX idx_inventaris_status ON inventaris_buku (status);

CREATE TRIGGER trg_inventaris_buku_updated_at
BEFORE UPDATE ON inventaris_buku
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- EKSTRAKURIKULER DAN WORKFLOW PERSETUJUAN
-- --------------------------------------------------------------------------

CREATE TABLE ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kode VARCHAR(30) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_ekstrakurikuler_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ekstrakurikuler_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_ekstrakurikuler_kode_not_blank
        CHECK (BTRIM(kode) <> ''),
    CONSTRAINT ck_ekstrakurikuler_nama_not_blank
        CHECK (BTRIM(nama) <> '')
);

CREATE UNIQUE INDEX uq_ekstrakurikuler_kode_ci
    ON ekstrakurikuler (LOWER(kode))
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_ekstrakurikuler_nama_ci
    ON ekstrakurikuler (LOWER(nama))
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_ekstrakurikuler_updated_at
BEFORE UPDATE ON ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Pembina memakai pegawai_id agar staff ekstrakurikuler tidak harus tercatat
-- sebagai guru mata pelajaran.
CREATE TABLE pembina_ekstrakurikuler (
    ekstrakurikuler_id INTEGER NOT NULL,
    pegawai_id INTEGER NOT NULL,
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (ekstrakurikuler_id, pegawai_id, tanggal_mulai),
    CONSTRAINT fk_pembina_ekskul_ekskul
        FOREIGN KEY (ekstrakurikuler_id) REFERENCES ekstrakurikuler(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pembina_ekskul_pegawai
        FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pembina_ekskul_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_pembina_ekskul_tanggal
        CHECK (tanggal_selesai IS NULL OR tanggal_selesai >= tanggal_mulai),
    CONSTRAINT ck_pembina_ekskul_active
        CHECK (
            (is_active = TRUE AND tanggal_selesai IS NULL)
            OR
            (is_active = FALSE AND tanggal_selesai IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uq_pembina_ekskul_aktif
    ON pembina_ekstrakurikuler (ekstrakurikuler_id, pegawai_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_pembina_ekskul_pegawai
    ON pembina_ekstrakurikuler (pegawai_id);

CREATE TABLE anggota_ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ekstrakurikuler_id INTEGER NOT NULL,
    siswa_id INTEGER NOT NULL,
    tahun_ajaran_id SMALLINT NOT NULL,
    tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_keluar DATE,
    status status_keanggotaan NOT NULL DEFAULT 'aktif',
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_anggota_ekskul_ekskul
        FOREIGN KEY (ekstrakurikuler_id) REFERENCES ekstrakurikuler(id) ON DELETE RESTRICT,
    CONSTRAINT fk_anggota_ekskul_siswa
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_anggota_ekskul_tahun
        FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    CONSTRAINT fk_anggota_ekskul_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_anggota_ekskul_tahun
        UNIQUE (ekstrakurikuler_id, siswa_id, tahun_ajaran_id),
    CONSTRAINT ck_anggota_ekskul_tanggal
        CHECK (tanggal_keluar IS NULL OR tanggal_keluar >= tanggal_masuk),
    CONSTRAINT ck_anggota_ekskul_status_tanggal
        CHECK (
            (status = 'aktif' AND tanggal_keluar IS NULL)
            OR
            (status <> 'aktif' AND tanggal_keluar IS NOT NULL)
        )
);

CREATE INDEX idx_anggota_ekskul_siswa ON anggota_ekstrakurikuler (siswa_id);
CREATE INDEX idx_anggota_ekskul_tahun ON anggota_ekstrakurikuler (tahun_ajaran_id);

CREATE TRIGGER trg_anggota_ekskul_updated_at
BEFORE UPDATE ON anggota_ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE jadwal_ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ekstrakurikuler_id INTEGER NOT NULL,
    semester_id SMALLINT NOT NULL,
    hari nama_hari NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    lokasi VARCHAR(150),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_jadwal_ekskul_ekskul
        FOREIGN KEY (ekstrakurikuler_id) REFERENCES ekstrakurikuler(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_ekskul_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jadwal_ekskul_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_jadwal_ekskul_waktu
        CHECK (jam_selesai > jam_mulai)
);

CREATE UNIQUE INDEX uq_jadwal_ekskul_start
    ON jadwal_ekstrakurikuler (ekstrakurikuler_id, semester_id, hari, jam_mulai)
    WHERE status_aktif = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_jadwal_ekskul_semester ON jadwal_ekstrakurikuler (semester_id);

CREATE TRIGGER trg_jadwal_ekskul_updated_at
BEFORE UPDATE ON jadwal_ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE sesi_absensi_ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jadwal_ekstrakurikuler_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    pembina_pegawai_id INTEGER NOT NULL,
    dibuka_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ditutup_pada TIMESTAMPTZ,
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sesi_absensi_ekskul_jadwal
        FOREIGN KEY (jadwal_ekstrakurikuler_id)
        REFERENCES jadwal_ekstrakurikuler(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sesi_absensi_ekskul_pembina
        FOREIGN KEY (pembina_pegawai_id) REFERENCES pegawai(id) ON DELETE RESTRICT,
    CONSTRAINT uq_sesi_absensi_ekskul_tanggal
        UNIQUE (jadwal_ekstrakurikuler_id, tanggal),
    CONSTRAINT ck_sesi_absensi_ekskul_tutup
        CHECK (ditutup_pada IS NULL OR ditutup_pada >= dibuka_pada)
);

CREATE INDEX idx_sesi_absensi_ekskul_tanggal
    ON sesi_absensi_ekstrakurikuler (tanggal);

CREATE TRIGGER trg_sesi_absensi_ekskul_updated_at
BEFORE UPDATE ON sesi_absensi_ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE absensi_ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sesi_absensi_ekstrakurikuler_id INTEGER NOT NULL,
    siswa_id INTEGER NOT NULL,
    status status_absensi NOT NULL,
    keterangan TEXT,
    dicatat_oleh INTEGER,
    dicatat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absensi_ekskul_sesi
        FOREIGN KEY (sesi_absensi_ekstrakurikuler_id)
        REFERENCES sesi_absensi_ekstrakurikuler(id) ON DELETE CASCADE,
    CONSTRAINT fk_absensi_ekskul_siswa
        FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_absensi_ekskul_dicatat_oleh
        FOREIGN KEY (dicatat_oleh) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_absensi_ekskul_siswa_sesi
        UNIQUE (sesi_absensi_ekstrakurikuler_id, siswa_id)
);

CREATE INDEX idx_absensi_ekskul_siswa ON absensi_ekstrakurikuler (siswa_id);
CREATE INDEX idx_absensi_ekskul_status ON absensi_ekstrakurikuler (status);

CREATE TRIGGER trg_absensi_ekskul_updated_at
BEFORE UPDATE ON absensi_ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Perubahan master ekstrakurikuler yang diajukan staff disimpan sebagai JSONB.
-- Data aktif pada tabel ekstrakurikuler baru diubah setelah status approved.
CREATE TABLE permintaan_perubahan_ekstrakurikuler (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aksi aksi_persetujuan NOT NULL,
    target_ekstrakurikuler_id INTEGER,
    data_sebelum JSONB,
    data_sesudah JSONB,
    status status_persetujuan NOT NULL DEFAULT 'draft',
    diajukan_oleh INTEGER NOT NULL,
    diajukan_pada TIMESTAMPTZ,
    diperiksa_oleh INTEGER,
    diperiksa_pada TIMESTAMPTZ,
    catatan_pengajuan TEXT,
    catatan_pemeriksaan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permintaan_ekskul_target
        FOREIGN KEY (target_ekstrakurikuler_id)
        REFERENCES ekstrakurikuler(id) ON DELETE RESTRICT,
    CONSTRAINT fk_permintaan_ekskul_pengaju
        FOREIGN KEY (diajukan_oleh) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_permintaan_ekskul_pemeriksa
        FOREIGN KEY (diperiksa_oleh) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_permintaan_ekskul_payload
        CHECK (
            (aksi = 'create'
                AND target_ekstrakurikuler_id IS NULL
                AND data_sebelum IS NULL
                AND data_sesudah IS NOT NULL)
            OR
            (aksi = 'update'
                AND target_ekstrakurikuler_id IS NOT NULL
                AND data_sebelum IS NOT NULL
                AND data_sesudah IS NOT NULL)
            OR
            (aksi = 'delete'
                AND target_ekstrakurikuler_id IS NOT NULL
                AND data_sebelum IS NOT NULL
                AND data_sesudah IS NULL)
        ),
    CONSTRAINT ck_permintaan_ekskul_submission
        CHECK (
            status = 'draft'
            OR diajukan_pada IS NOT NULL
        ),
    CONSTRAINT ck_permintaan_ekskul_review
        CHECK (
            (status IN ('approved', 'rejected')
                AND diperiksa_oleh IS NOT NULL
                AND diperiksa_pada IS NOT NULL)
            OR
            (status NOT IN ('approved', 'rejected'))
        )
);

CREATE INDEX idx_permintaan_ekskul_status
    ON permintaan_perubahan_ekstrakurikuler (status);
CREATE INDEX idx_permintaan_ekskul_pengaju
    ON permintaan_perubahan_ekstrakurikuler (diajukan_oleh);
CREATE INDEX idx_permintaan_ekskul_target
    ON permintaan_perubahan_ekstrakurikuler (target_ekstrakurikuler_id);

CREATE TRIGGER trg_permintaan_ekskul_updated_at
BEFORE UPDATE ON permintaan_perubahan_ekstrakurikuler
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------------
-- AUDIT LOG
-- --------------------------------------------------------------------------

CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_log_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_audit_log_action_not_blank
        CHECK (BTRIM(action) <> ''),
    CONSTRAINT ck_audit_log_entity_not_blank
        CHECK (BTRIM(entity_type) <> '')
);

CREATE INDEX idx_audit_log_user ON audit_log (user_id);
CREATE INDEX idx_audit_log_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);

-- --------------------------------------------------------------------------
-- VIEW UNTUK AUTHORIZATION DAN REKAP
-- --------------------------------------------------------------------------

CREATE VIEW v_effective_user_permissions AS
WITH role_grants AS (
    SELECT DISTINCT
        ur.user_id,
        rp.permission_id
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP
),
direct_grants AS (
    SELECT
        up.user_id,
        up.permission_id
    FROM user_permissions up
    WHERE up.is_allowed = TRUE
      AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
),
direct_denies AS (
    SELECT
        up.user_id,
        up.permission_id
    FROM user_permissions up
    WHERE up.is_allowed = FALSE
      AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
),
all_grants AS (
    SELECT user_id, permission_id FROM role_grants
    UNION
    SELECT user_id, permission_id FROM direct_grants
)
SELECT
    ag.user_id,
    p.id AS permission_id,
    p.code AS permission_code,
    p.module,
    p.action
FROM all_grants ag
JOIN permissions p ON p.id = ag.permission_id
LEFT JOIN direct_denies dd
    ON dd.user_id = ag.user_id
   AND dd.permission_id = ag.permission_id
WHERE dd.permission_id IS NULL;

CREATE VIEW v_siswa_kelas_aktif AS
SELECT
    sk.id AS siswa_kelas_id,
    s.id AS siswa_id,
    s.nisn,
    s.nis,
    s.nama_lengkap,
    k.id AS kelas_id,
    k.nama AS kelas_nama,
    k.tingkat,
    ta.id AS tahun_ajaran_id,
    ta.nama AS tahun_ajaran
FROM siswa_kelas sk
JOIN siswa s ON s.id = sk.siswa_id
JOIN kelas k ON k.id = sk.kelas_id
JOIN tahun_ajaran ta ON ta.id = k.tahun_ajaran_id
WHERE sk.is_active = TRUE
  AND s.deleted_at IS NULL
  AND k.deleted_at IS NULL;

CREATE VIEW v_rekap_absensi_siswa AS
SELECT
    a.siswa_id,
    ss.jadwal_pelajaran_id,
    jp.kelas_id,
    jp.mata_pelajaran_id,
    jp.semester_id,
    COUNT(*) FILTER (WHERE a.status = 'hadir') AS total_hadir,
    COUNT(*) FILTER (WHERE a.status = 'sakit') AS total_sakit,
    COUNT(*) FILTER (WHERE a.status = 'izin') AS total_izin,
    COUNT(*) FILTER (WHERE a.status = 'alpa') AS total_alpa,
    COUNT(*) AS total_pertemuan
FROM absensi_siswa a
JOIN sesi_absensi_siswa ss ON ss.id = a.sesi_absensi_id
JOIN jadwal_pelajaran jp ON jp.id = ss.jadwal_pelajaran_id
GROUP BY
    a.siswa_id,
    ss.jadwal_pelajaran_id,
    jp.kelas_id,
    jp.mata_pelajaran_id,
    jp.semester_id;

-- --------------------------------------------------------------------------
-- SEED ROLE
-- --------------------------------------------------------------------------

INSERT INTO roles (code, name, description) VALUES
    ('admin', 'Admin', 'Memiliki seluruh hak akses sistem.'),
    ('guru', 'Guru', 'Guru mata pelajaran dan wali kelas.'),
    ('guru_bk', 'Guru BK', 'Guru bimbingan dan konseling.'),
    ('staff_perpustakaan', 'Staff Perpustakaan', 'Pengelola buku dan inventaris perpustakaan.'),
    ('staff_ekstrakurikuler', 'Staff Ekstrakurikuler', 'Pengelola kegiatan dan absensi ekstrakurikuler.'),
    ('kepala_sekolah', 'Kepala Sekolah', 'Akses baca seluruh modul dan persetujuan ekstrakurikuler.'),
    ('siswa', 'Siswa', 'Akses baca data milik sendiri.');

-- --------------------------------------------------------------------------
-- SEED PERMISSION
-- --------------------------------------------------------------------------

INSERT INTO permissions (code, module, action, description) VALUES
    ('dashboard.view', 'dashboard', 'view', 'Melihat dashboard sesuai hak akses.'),

    ('users.view', 'users', 'view', 'Melihat akun pengguna.'),
    ('users.create', 'users', 'create', 'Membuat akun pengguna.'),
    ('users.update', 'users', 'update', 'Mengubah akun pengguna.'),
    ('users.delete', 'users', 'delete', 'Menonaktifkan atau menghapus akun pengguna.'),
    ('roles.manage', 'roles', 'manage', 'Mengelola role dan permission.'),
    ('audit.view', 'audit', 'view', 'Melihat audit log.'),

    ('students.view', 'students', 'view', 'Melihat seluruh data siswa sesuai scope.'),
    ('students.view_own', 'students', 'view_own', 'Melihat data siswa milik akun sendiri.'),
    ('students.create', 'students', 'create', 'Membuat data siswa.'),
    ('students.update', 'students', 'update', 'Mengubah data siswa.'),
    ('students.delete', 'students', 'delete', 'Menghapus atau menonaktifkan data siswa.'),

    ('teachers.view', 'teachers', 'view', 'Melihat data guru dan pegawai.'),
    ('teachers.create', 'teachers', 'create', 'Membuat data guru dan pegawai.'),
    ('teachers.update', 'teachers', 'update', 'Mengubah data guru dan pegawai.'),
    ('teachers.delete', 'teachers', 'delete', 'Menghapus atau menonaktifkan data guru dan pegawai.'),

    ('classes.view', 'classes', 'view', 'Melihat data kelas dan wali kelas.'),
    ('classes.create', 'classes', 'create', 'Membuat kelas dan penempatan wali kelas.'),
    ('classes.update', 'classes', 'update', 'Mengubah kelas dan penempatan wali kelas.'),
    ('classes.delete', 'classes', 'delete', 'Menghapus atau menonaktifkan kelas.'),

    ('subjects.view', 'subjects', 'view', 'Melihat mata pelajaran.'),
    ('subjects.create', 'subjects', 'create', 'Membuat mata pelajaran.'),
    ('subjects.update', 'subjects', 'update', 'Mengubah mata pelajaran.'),
    ('subjects.delete', 'subjects', 'delete', 'Menghapus mata pelajaran.'),

    ('schedules.view', 'schedules', 'view', 'Melihat jadwal pelajaran.'),
    ('schedules.create', 'schedules', 'create', 'Membuat jadwal pelajaran.'),
    ('schedules.update', 'schedules', 'update', 'Mengubah jadwal pelajaran.'),
    ('schedules.delete', 'schedules', 'delete', 'Menghapus jadwal pelajaran.'),

    ('student_attendance.view', 'student_attendance', 'view', 'Melihat absensi siswa sesuai scope.'),
    ('student_attendance.view_own', 'student_attendance', 'view_own', 'Melihat absensi milik siswa sendiri.'),
    ('student_attendance.create', 'student_attendance', 'create', 'Mencatat absensi siswa.'),
    ('student_attendance.update', 'student_attendance', 'update', 'Mengubah absensi siswa.'),
    ('student_attendance.delete', 'student_attendance', 'delete', 'Menghapus absensi siswa.'),

    ('teacher_attendance.view', 'teacher_attendance', 'view', 'Melihat seluruh absensi guru.'),
    ('teacher_attendance.view_own', 'teacher_attendance', 'view_own', 'Melihat absensi guru milik sendiri.'),
    ('teacher_attendance.check_in_self', 'teacher_attendance', 'check_in_self', 'Melakukan absensi kehadiran sendiri.'),
    ('teacher_attendance.update', 'teacher_attendance', 'update', 'Mengoreksi atau memverifikasi absensi guru.'),

    ('duty_attendance.view', 'duty_attendance', 'view', 'Melihat absensi guru piket.'),
    ('duty_attendance.view_own', 'duty_attendance', 'view_own', 'Melihat jadwal dan absensi piket sendiri.'),
    ('duty_attendance.check_in_self', 'duty_attendance', 'check_in_self', 'Melakukan absensi piket sendiri.'),
    ('duty_attendance.manage', 'duty_attendance', 'manage', 'Mengelola jadwal dan koreksi absensi piket.'),

    ('counseling.view', 'counseling', 'view', 'Melihat catatan konseling sesuai scope.'),
    ('counseling.view_own', 'counseling', 'view_own', 'Melihat catatan konseling yang diizinkan untuk siswa.'),
    ('counseling.create', 'counseling', 'create', 'Membuat catatan konseling.'),
    ('counseling.update', 'counseling', 'update', 'Mengubah catatan konseling.'),
    ('counseling.delete', 'counseling', 'delete', 'Menghapus atau mengarsipkan catatan konseling.'),

    ('library.view', 'library', 'view', 'Melihat buku dan inventaris perpustakaan.'),
    ('library.create', 'library', 'create', 'Menambahkan buku dan inventaris.'),
    ('library.update', 'library', 'update', 'Mengubah buku dan inventaris.'),
    ('library.delete', 'library', 'delete', 'Menghapus buku dan inventaris.'),

    ('extracurricular.view', 'extracurricular', 'view', 'Melihat data ekstrakurikuler.'),
    ('extracurricular.create_request', 'extracurricular', 'create_request', 'Mengajukan pembuatan ekstrakurikuler.'),
    ('extracurricular.update_request', 'extracurricular', 'update_request', 'Mengajukan perubahan ekstrakurikuler.'),
    ('extracurricular.delete_request', 'extracurricular', 'delete_request', 'Mengajukan penghapusan ekstrakurikuler.'),
    ('extracurricular.approve', 'extracurricular', 'approve', 'Menyetujui perubahan ekstrakurikuler.'),
    ('extracurricular.reject', 'extracurricular', 'reject', 'Menolak perubahan ekstrakurikuler.'),

    ('extracurricular_attendance.view', 'extracurricular_attendance', 'view', 'Melihat absensi ekstrakurikuler sesuai scope.'),
    ('extracurricular_attendance.view_own', 'extracurricular_attendance', 'view_own', 'Melihat absensi ekstrakurikuler siswa sendiri.'),
    ('extracurricular_attendance.create', 'extracurricular_attendance', 'create', 'Mencatat absensi ekstrakurikuler.'),
    ('extracurricular_attendance.update', 'extracurricular_attendance', 'update', 'Mengubah absensi ekstrakurikuler.'),
    ('extracurricular_attendance.delete', 'extracurricular_attendance', 'delete', 'Menghapus absensi ekstrakurikuler.');

-- --------------------------------------------------------------------------
-- PEMETAAN PERMISSION PER ROLE
-- --------------------------------------------------------------------------

-- Admin mendapatkan semua permission.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin';

-- Guru.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'students.view',
    'classes.view',
    'classes.create',
    'classes.update',
    'classes.delete',
    'subjects.view',
    'schedules.view',
    'schedules.create',
    'schedules.update',
    'schedules.delete',
    'student_attendance.view',
    'student_attendance.create',
    'student_attendance.update',
    'student_attendance.delete',
    'teacher_attendance.view_own',
    'teacher_attendance.check_in_self',
    'duty_attendance.view_own',
    'duty_attendance.check_in_self'
)
WHERE r.code = 'guru';

-- Guru BK.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'students.view',
    'schedules.view',
    'counseling.view',
    'counseling.create',
    'counseling.update',
    'counseling.delete'
)
WHERE r.code = 'guru_bk';

-- Staff perpustakaan.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'library.view',
    'library.create',
    'library.update',
    'library.delete'
)
WHERE r.code = 'staff_perpustakaan';

-- Staff ekstrakurikuler.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'extracurricular.view',
    'extracurricular.create_request',
    'extracurricular.update_request',
    'extracurricular.delete_request',
    'extracurricular_attendance.view',
    'extracurricular_attendance.create',
    'extracurricular_attendance.update',
    'extracurricular_attendance.delete'
)
WHERE r.code = 'staff_ekstrakurikuler';

-- Kepala sekolah: view semua modul dan approve/reject ekstrakurikuler.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'users.view',
    'audit.view',
    'students.view',
    'teachers.view',
    'classes.view',
    'subjects.view',
    'schedules.view',
    'student_attendance.view',
    'teacher_attendance.view',
    'duty_attendance.view',
    'counseling.view',
    'library.view',
    'extracurricular.view',
    'extracurricular.approve',
    'extracurricular.reject',
    'extracurricular_attendance.view'
)
WHERE r.code = 'kepala_sekolah';

-- Siswa: hanya data milik sendiri ditambah jadwal kelasnya.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'dashboard.view',
    'students.view_own',
    'schedules.view',
    'student_attendance.view_own',
    'counseling.view_own',
    'extracurricular_attendance.view_own'
)
WHERE r.code = 'siswa';

COMMIT;
