--
-- PostgreSQL database dump
--

\restrict Ezz18BX6l2DRC6tOKpRpadLLaVIDxWhldFr35uOfqnWQ96V0aagkDovbyRUiigw

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: aksi_persetujuan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.aksi_persetujuan AS ENUM (
    'create',
    'update',
    'delete'
);


ALTER TYPE public.aksi_persetujuan OWNER TO postgres;

--
-- Name: jenis_kelamin; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.jenis_kelamin AS ENUM (
    'L',
    'P'
);


ALTER TYPE public.jenis_kelamin OWNER TO postgres;

--
-- Name: jenis_semester; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.jenis_semester AS ENUM (
    'ganjil',
    'genap'
);


ALTER TYPE public.jenis_semester OWNER TO postgres;

--
-- Name: kondisi_buku; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.kondisi_buku AS ENUM (
    'baik',
    'rusak_ringan',
    'rusak_berat',
    'hilang'
);


ALTER TYPE public.kondisi_buku OWNER TO postgres;

--
-- Name: nama_hari; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nama_hari AS ENUM (
    'senin',
    'selasa',
    'rabu',
    'kamis',
    'jumat',
    'sabtu'
);


ALTER TYPE public.nama_hari OWNER TO postgres;

--
-- Name: status_absensi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_absensi AS ENUM (
    'hadir',
    'sakit',
    'izin',
    'alpa'
);


ALTER TYPE public.status_absensi OWNER TO postgres;

--
-- Name: status_inventaris_buku; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_inventaris_buku AS ENUM (
    'tersedia',
    'dipinjam',
    'perbaikan',
    'hilang',
    'nonaktif'
);


ALTER TYPE public.status_inventaris_buku OWNER TO postgres;

--
-- Name: status_keanggotaan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_keanggotaan AS ENUM (
    'aktif',
    'nonaktif',
    'lulus',
    'keluar'
);


ALTER TYPE public.status_keanggotaan OWNER TO postgres;

--
-- Name: status_persetujuan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_persetujuan AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


ALTER TYPE public.status_persetujuan OWNER TO postgres;

--
-- Name: status_user; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_user AS ENUM (
    'aktif',
    'nonaktif',
    'ditangguhkan'
);


ALTER TYPE public.status_user OWNER TO postgres;

--
-- Name: visibilitas_konseling; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.visibilitas_konseling AS ENUM (
    'rahasia',
    'internal_bk',
    'siswa'
);


ALTER TYPE public.visibilitas_konseling OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: validate_jadwal_pelajaran_overlap(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_jadwal_pelajaran_overlap() RETURNS trigger
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


ALTER FUNCTION public.validate_jadwal_pelajaran_overlap() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: absensi_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absensi_ekstrakurikuler (
    id integer NOT NULL,
    sesi_absensi_ekstrakurikuler_id integer NOT NULL,
    siswa_id integer NOT NULL,
    status public.status_absensi NOT NULL,
    keterangan text,
    dicatat_oleh integer,
    dicatat_pada timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.absensi_ekstrakurikuler OWNER TO postgres;

--
-- Name: absensi_ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.absensi_ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.absensi_ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: absensi_guru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absensi_guru (
    id integer NOT NULL,
    guru_id integer NOT NULL,
    tanggal date NOT NULL,
    status public.status_absensi NOT NULL,
    waktu_masuk timestamp with time zone,
    waktu_pulang timestamp with time zone,
    latitude_masuk numeric(10,7),
    longitude_masuk numeric(10,7),
    latitude_pulang numeric(10,7),
    longitude_pulang numeric(10,7),
    keterangan text,
    diverifikasi_oleh integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_absensi_guru_lat_masuk CHECK (((latitude_masuk IS NULL) OR ((latitude_masuk >= ('-90'::integer)::numeric) AND (latitude_masuk <= (90)::numeric)))),
    CONSTRAINT ck_absensi_guru_lat_pulang CHECK (((latitude_pulang IS NULL) OR ((latitude_pulang >= ('-90'::integer)::numeric) AND (latitude_pulang <= (90)::numeric)))),
    CONSTRAINT ck_absensi_guru_lon_masuk CHECK (((longitude_masuk IS NULL) OR ((longitude_masuk >= ('-180'::integer)::numeric) AND (longitude_masuk <= (180)::numeric)))),
    CONSTRAINT ck_absensi_guru_lon_pulang CHECK (((longitude_pulang IS NULL) OR ((longitude_pulang >= ('-180'::integer)::numeric) AND (longitude_pulang <= (180)::numeric)))),
    CONSTRAINT ck_absensi_guru_waktu CHECK (((waktu_pulang IS NULL) OR (waktu_masuk IS NULL) OR (waktu_pulang >= waktu_masuk)))
);


ALTER TABLE public.absensi_guru OWNER TO postgres;

--
-- Name: absensi_guru_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.absensi_guru ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.absensi_guru_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: absensi_guru_piket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absensi_guru_piket (
    id integer NOT NULL,
    jadwal_piket_id integer NOT NULL,
    guru_id integer NOT NULL,
    tanggal date NOT NULL,
    status public.status_absensi NOT NULL,
    waktu_absen timestamp with time zone,
    latitude numeric(10,7),
    longitude numeric(10,7),
    keterangan text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_absensi_piket_latitude CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))),
    CONSTRAINT ck_absensi_piket_longitude CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
);


ALTER TABLE public.absensi_guru_piket OWNER TO postgres;

--
-- Name: absensi_guru_piket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.absensi_guru_piket ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.absensi_guru_piket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: absensi_siswa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absensi_siswa (
    id integer NOT NULL,
    sesi_absensi_id integer NOT NULL,
    siswa_id integer NOT NULL,
    status public.status_absensi NOT NULL,
    keterangan text,
    dicatat_oleh integer,
    dicatat_pada timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_absensi_siswa_keterangan CHECK (((status = 'hadir'::public.status_absensi) OR (keterangan IS NULL) OR (btrim(keterangan) <> ''::text)))
);


ALTER TABLE public.absensi_siswa OWNER TO postgres;

--
-- Name: absensi_siswa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.absensi_siswa ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.absensi_siswa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: anggota_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anggota_ekstrakurikuler (
    id integer NOT NULL,
    ekstrakurikuler_id integer NOT NULL,
    siswa_id integer NOT NULL,
    tahun_ajaran_id smallint NOT NULL,
    tanggal_masuk date DEFAULT CURRENT_DATE NOT NULL,
    tanggal_keluar date,
    status public.status_keanggotaan DEFAULT 'aktif'::public.status_keanggotaan NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_anggota_ekskul_status_tanggal CHECK ((((status = 'aktif'::public.status_keanggotaan) AND (tanggal_keluar IS NULL)) OR ((status <> 'aktif'::public.status_keanggotaan) AND (tanggal_keluar IS NOT NULL)))),
    CONSTRAINT ck_anggota_ekskul_tanggal CHECK (((tanggal_keluar IS NULL) OR (tanggal_keluar >= tanggal_masuk)))
);


ALTER TABLE public.anggota_ekstrakurikuler OWNER TO postgres;

--
-- Name: anggota_ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.anggota_ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.anggota_ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id bigint NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100),
    old_data jsonb,
    new_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_audit_log_action_not_blank CHECK ((btrim((action)::text) <> ''::text)),
    CONSTRAINT ck_audit_log_entity_not_blank CHECK ((btrim((entity_type)::text) <> ''::text))
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buku; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buku (
    id integer NOT NULL,
    kategori_id smallint,
    isbn character varying(30),
    judul character varying(255) NOT NULL,
    penulis character varying(255),
    penerbit character varying(255),
    tahun_terbit smallint,
    deskripsi text,
    url_sampul text,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_buku_judul_not_blank CHECK ((btrim((judul)::text) <> ''::text)),
    CONSTRAINT ck_buku_tahun_terbit CHECK (((tahun_terbit IS NULL) OR ((tahun_terbit >= 1000) AND (tahun_terbit <= 9999))))
);


ALTER TABLE public.buku OWNER TO postgres;

--
-- Name: buku_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.buku ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.buku_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: catatan_konseling; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.catatan_konseling (
    id integer NOT NULL,
    siswa_id integer NOT NULL,
    guru_bk_id integer NOT NULL,
    tanggal timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    topik character varying(255) NOT NULL,
    isi text NOT NULL,
    tindak_lanjut text,
    visibilitas public.visibilitas_konseling DEFAULT 'rahasia'::public.visibilitas_konseling NOT NULL,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_konseling_isi_not_blank CHECK ((btrim(isi) <> ''::text)),
    CONSTRAINT ck_konseling_topik_not_blank CHECK ((btrim((topik)::text) <> ''::text))
);


ALTER TABLE public.catatan_konseling OWNER TO postgres;

--
-- Name: catatan_konseling_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.catatan_konseling ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.catatan_konseling_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ekstrakurikuler (
    id integer NOT NULL,
    kode character varying(30) NOT NULL,
    nama character varying(150) NOT NULL,
    deskripsi text,
    status_aktif boolean DEFAULT true NOT NULL,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_ekstrakurikuler_kode_not_blank CHECK ((btrim((kode)::text) <> ''::text)),
    CONSTRAINT ck_ekstrakurikuler_nama_not_blank CHECK ((btrim((nama)::text) <> ''::text))
);


ALTER TABLE public.ekstrakurikuler OWNER TO postgres;

--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: guru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guru (
    id integer NOT NULL,
    pegawai_id integer NOT NULL,
    kode_guru character varying(30),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.guru OWNER TO postgres;

--
-- Name: guru_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.guru ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.guru_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inventaris_buku; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventaris_buku (
    id integer NOT NULL,
    buku_id integer NOT NULL,
    kode_inventaris character varying(100) NOT NULL,
    barcode character varying(100),
    lokasi_rak character varying(100),
    tanggal_perolehan date,
    sumber_perolehan character varying(150),
    harga_perolehan numeric(14,2),
    kondisi public.kondisi_buku DEFAULT 'baik'::public.kondisi_buku NOT NULL,
    status public.status_inventaris_buku DEFAULT 'tersedia'::public.status_inventaris_buku NOT NULL,
    catatan text,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_inventaris_harga CHECK (((harga_perolehan IS NULL) OR (harga_perolehan >= (0)::numeric))),
    CONSTRAINT ck_inventaris_kode_not_blank CHECK ((btrim((kode_inventaris)::text) <> ''::text))
);


ALTER TABLE public.inventaris_buku OWNER TO postgres;

--
-- Name: inventaris_buku_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.inventaris_buku ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.inventaris_buku_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jadwal_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_ekstrakurikuler (
    id integer NOT NULL,
    ekstrakurikuler_id integer NOT NULL,
    semester_id smallint NOT NULL,
    hari public.nama_hari NOT NULL,
    jam_mulai time without time zone NOT NULL,
    jam_selesai time without time zone NOT NULL,
    lokasi character varying(150),
    status_aktif boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_jadwal_ekskul_waktu CHECK ((jam_selesai > jam_mulai))
);


ALTER TABLE public.jadwal_ekstrakurikuler OWNER TO postgres;

--
-- Name: jadwal_ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.jadwal_ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jadwal_ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jadwal_pelajaran; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_pelajaran (
    id integer NOT NULL,
    semester_id smallint NOT NULL,
    kelas_id integer NOT NULL,
    mata_pelajaran_id integer NOT NULL,
    guru_id integer NOT NULL,
    hari public.nama_hari NOT NULL,
    jam_mulai time without time zone NOT NULL,
    jam_selesai time without time zone NOT NULL,
    ruang character varying(100),
    status_aktif boolean DEFAULT true NOT NULL,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_jadwal_waktu CHECK ((jam_selesai > jam_mulai))
);


ALTER TABLE public.jadwal_pelajaran OWNER TO postgres;

--
-- Name: jadwal_pelajaran_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.jadwal_pelajaran ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jadwal_pelajaran_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jadwal_piket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_piket (
    id integer NOT NULL,
    semester_id smallint NOT NULL,
    nama character varying(100) NOT NULL,
    hari public.nama_hari NOT NULL,
    jam_mulai time without time zone NOT NULL,
    jam_selesai time without time zone NOT NULL,
    lokasi character varying(100),
    status_aktif boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_jadwal_piket_nama_not_blank CHECK ((btrim((nama)::text) <> ''::text)),
    CONSTRAINT ck_jadwal_piket_waktu CHECK ((jam_selesai > jam_mulai))
);


ALTER TABLE public.jadwal_piket OWNER TO postgres;

--
-- Name: jadwal_piket_guru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_piket_guru (
    jadwal_piket_id integer NOT NULL,
    guru_id integer NOT NULL,
    assigned_by integer,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.jadwal_piket_guru OWNER TO postgres;

--
-- Name: jadwal_piket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.jadwal_piket ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jadwal_piket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: kategori_buku; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategori_buku (
    id smallint NOT NULL,
    nama character varying(100) NOT NULL,
    deskripsi text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_kategori_buku_nama_not_blank CHECK ((btrim((nama)::text) <> ''::text))
);


ALTER TABLE public.kategori_buku OWNER TO postgres;

--
-- Name: kategori_buku_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.kategori_buku ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kategori_buku_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: kelas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kelas (
    id integer NOT NULL,
    tahun_ajaran_id smallint NOT NULL,
    nama character varying(50) NOT NULL,
    tingkat smallint NOT NULL,
    wali_kelas_id integer,
    kapasitas smallint,
    ruang character varying(100),
    status_aktif boolean DEFAULT true NOT NULL,
    created_by integer,
    updated_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_kelas_kapasitas CHECK (((kapasitas IS NULL) OR (kapasitas > 0))),
    CONSTRAINT ck_kelas_nama_not_blank CHECK ((btrim((nama)::text) <> ''::text)),
    CONSTRAINT ck_kelas_tingkat CHECK (((tingkat >= 7) AND (tingkat <= 9)))
);


ALTER TABLE public.kelas OWNER TO postgres;

--
-- Name: kelas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.kelas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kelas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mata_pelajaran; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mata_pelajaran (
    id integer NOT NULL,
    kode character varying(30) NOT NULL,
    nama character varying(150) NOT NULL,
    deskripsi text,
    status_aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_mata_pelajaran_kode_not_blank CHECK ((btrim((kode)::text) <> ''::text)),
    CONSTRAINT ck_mata_pelajaran_nama_not_blank CHECK ((btrim((nama)::text) <> ''::text))
);


ALTER TABLE public.mata_pelajaran OWNER TO postgres;

--
-- Name: mata_pelajaran_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mata_pelajaran ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mata_pelajaran_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pegawai; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pegawai (
    id integer NOT NULL,
    user_id integer,
    nama_lengkap character varying(255) NOT NULL,
    nip character varying(30),
    nuptk character varying(30),
    jenis_kelamin public.jenis_kelamin NOT NULL,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    email character varying(255),
    no_telepon character varying(30),
    alamat text,
    jabatan character varying(150),
    status_aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_pegawai_nama_not_blank CHECK ((btrim((nama_lengkap)::text) <> ''::text))
);


ALTER TABLE public.pegawai OWNER TO postgres;

--
-- Name: pegawai_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.pegawai ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pegawai_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pembina_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pembina_ekstrakurikuler (
    ekstrakurikuler_id integer NOT NULL,
    pegawai_id integer NOT NULL,
    tanggal_mulai date DEFAULT CURRENT_DATE NOT NULL,
    tanggal_selesai date,
    is_active boolean DEFAULT true NOT NULL,
    assigned_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_pembina_ekskul_active CHECK ((((is_active = true) AND (tanggal_selesai IS NULL)) OR ((is_active = false) AND (tanggal_selesai IS NOT NULL)))),
    CONSTRAINT ck_pembina_ekskul_tanggal CHECK (((tanggal_selesai IS NULL) OR (tanggal_selesai >= tanggal_mulai)))
);


ALTER TABLE public.pembina_ekstrakurikuler OWNER TO postgres;

--
-- Name: permintaan_perubahan_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permintaan_perubahan_ekstrakurikuler (
    id integer NOT NULL,
    aksi public.aksi_persetujuan NOT NULL,
    target_ekstrakurikuler_id integer,
    data_sebelum jsonb,
    data_sesudah jsonb,
    status public.status_persetujuan DEFAULT 'draft'::public.status_persetujuan NOT NULL,
    diajukan_oleh integer NOT NULL,
    diajukan_pada timestamp with time zone,
    diperiksa_oleh integer,
    diperiksa_pada timestamp with time zone,
    catatan_pengajuan text,
    catatan_pemeriksaan text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_permintaan_ekskul_payload CHECK ((((aksi = 'create'::public.aksi_persetujuan) AND (target_ekstrakurikuler_id IS NULL) AND (data_sebelum IS NULL) AND (data_sesudah IS NOT NULL)) OR ((aksi = 'update'::public.aksi_persetujuan) AND (target_ekstrakurikuler_id IS NOT NULL) AND (data_sebelum IS NOT NULL) AND (data_sesudah IS NOT NULL)) OR ((aksi = 'delete'::public.aksi_persetujuan) AND (target_ekstrakurikuler_id IS NOT NULL) AND (data_sebelum IS NOT NULL) AND (data_sesudah IS NULL)))),
    CONSTRAINT ck_permintaan_ekskul_review CHECK ((((status = ANY (ARRAY['approved'::public.status_persetujuan, 'rejected'::public.status_persetujuan])) AND (diperiksa_oleh IS NOT NULL) AND (diperiksa_pada IS NOT NULL)) OR (status <> ALL (ARRAY['approved'::public.status_persetujuan, 'rejected'::public.status_persetujuan])))),
    CONSTRAINT ck_permintaan_ekskul_submission CHECK (((status = 'draft'::public.status_persetujuan) OR (diajukan_pada IS NOT NULL)))
);


ALTER TABLE public.permintaan_perubahan_ekstrakurikuler OWNER TO postgres;

--
-- Name: permintaan_perubahan_ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.permintaan_perubahan_ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.permintaan_perubahan_ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    module character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_permissions_code_format CHECK (((code)::text ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'::text))
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.permissions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id smallint NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id smallint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_roles_code_format CHECK (((code)::text ~ '^[a-z][a-z0-9_]*$'::text)),
    CONSTRAINT ck_roles_name_not_blank CHECK ((btrim((name)::text) <> ''::text))
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: semester; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.semester (
    id smallint NOT NULL,
    tahun_ajaran_id smallint NOT NULL,
    jenis public.jenis_semester NOT NULL,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_semester_tanggal CHECK ((tanggal_selesai > tanggal_mulai))
);


ALTER TABLE public.semester OWNER TO postgres;

--
-- Name: semester_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.semester ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.semester_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesi_absensi_ekstrakurikuler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesi_absensi_ekstrakurikuler (
    id integer NOT NULL,
    jadwal_ekstrakurikuler_id integer NOT NULL,
    tanggal date NOT NULL,
    pembina_pegawai_id integer NOT NULL,
    dibuka_pada timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ditutup_pada timestamp with time zone,
    catatan text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_sesi_absensi_ekskul_tutup CHECK (((ditutup_pada IS NULL) OR (ditutup_pada >= dibuka_pada)))
);


ALTER TABLE public.sesi_absensi_ekstrakurikuler OWNER TO postgres;

--
-- Name: sesi_absensi_ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sesi_absensi_ekstrakurikuler ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sesi_absensi_ekstrakurikuler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesi_absensi_siswa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesi_absensi_siswa (
    id integer NOT NULL,
    jadwal_pelajaran_id integer NOT NULL,
    tanggal date NOT NULL,
    dibuka_oleh_guru_id integer NOT NULL,
    dibuka_pada timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ditutup_pada timestamp with time zone,
    catatan text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_sesi_absensi_waktu_tutup CHECK (((ditutup_pada IS NULL) OR (ditutup_pada >= dibuka_pada)))
);


ALTER TABLE public.sesi_absensi_siswa OWNER TO postgres;

--
-- Name: sesi_absensi_siswa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sesi_absensi_siswa ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sesi_absensi_siswa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: siswa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siswa (
    id integer NOT NULL,
    user_id integer,
    nisn character varying(20) NOT NULL,
    nis character varying(30),
    nama_lengkap character varying(255) NOT NULL,
    jenis_kelamin public.jenis_kelamin NOT NULL,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    email character varying(255),
    no_telepon character varying(30),
    alamat text,
    nama_wali character varying(255),
    no_telepon_wali character varying(30),
    status_aktif boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_siswa_nama_not_blank CHECK ((btrim((nama_lengkap)::text) <> ''::text)),
    CONSTRAINT ck_siswa_nisn_not_blank CHECK ((btrim((nisn)::text) <> ''::text))
);


ALTER TABLE public.siswa OWNER TO postgres;

--
-- Name: siswa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.siswa ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.siswa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: siswa_kelas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siswa_kelas (
    id integer NOT NULL,
    siswa_id integer NOT NULL,
    kelas_id integer NOT NULL,
    tanggal_masuk date NOT NULL,
    tanggal_keluar date,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_siswa_kelas_active_consistency CHECK ((((is_active = true) AND (tanggal_keluar IS NULL)) OR ((is_active = false) AND (tanggal_keluar IS NOT NULL)))),
    CONSTRAINT ck_siswa_kelas_tanggal CHECK (((tanggal_keluar IS NULL) OR (tanggal_keluar >= tanggal_masuk)))
);


ALTER TABLE public.siswa_kelas OWNER TO postgres;

--
-- Name: siswa_kelas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.siswa_kelas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.siswa_kelas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tahun_ajaran; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tahun_ajaran (
    id smallint NOT NULL,
    nama character varying(20) NOT NULL,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_tahun_ajaran_nama CHECK (((nama)::text ~ '^[0-9]{4}/[0-9]{4}$'::text)),
    CONSTRAINT ck_tahun_ajaran_tanggal CHECK ((tanggal_selesai > tanggal_mulai))
);


ALTER TABLE public.tahun_ajaran OWNER TO postgres;

--
-- Name: tahun_ajaran_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tahun_ajaran ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tahun_ajaran_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    user_id integer NOT NULL,
    permission_id integer NOT NULL,
    is_allowed boolean DEFAULT true NOT NULL,
    assigned_by integer,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone,
    reason text,
    CONSTRAINT ck_user_permissions_expiry CHECK (((expires_at IS NULL) OR (expires_at > assigned_at)))
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id smallint NOT NULL,
    assigned_by integer,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT ck_user_roles_expiry CHECK (((expires_at IS NULL) OR (expires_at > assigned_at)))
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255),
    password_hash character varying(255) NOT NULL,
    status public.status_user DEFAULT 'aktif'::public.status_user NOT NULL,
    last_login_at timestamp with time zone,
    password_changed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT ck_users_email_not_blank CHECK (((email IS NULL) OR (btrim((email)::text) <> ''::text))),
    CONSTRAINT ck_users_username_not_blank CHECK ((btrim((username)::text) <> ''::text))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: v_effective_user_permissions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_effective_user_permissions AS
 WITH role_grants AS (
         SELECT DISTINCT ur.user_id,
            rp.permission_id
           FROM (public.user_roles ur
             JOIN public.role_permissions rp ON ((rp.role_id = ur.role_id)))
          WHERE ((ur.expires_at IS NULL) OR (ur.expires_at > CURRENT_TIMESTAMP))
        ), direct_grants AS (
         SELECT up.user_id,
            up.permission_id
           FROM public.user_permissions up
          WHERE ((up.is_allowed = true) AND ((up.expires_at IS NULL) OR (up.expires_at > CURRENT_TIMESTAMP)))
        ), direct_denies AS (
         SELECT up.user_id,
            up.permission_id
           FROM public.user_permissions up
          WHERE ((up.is_allowed = false) AND ((up.expires_at IS NULL) OR (up.expires_at > CURRENT_TIMESTAMP)))
        ), all_grants AS (
         SELECT role_grants.user_id,
            role_grants.permission_id
           FROM role_grants
        UNION
         SELECT direct_grants.user_id,
            direct_grants.permission_id
           FROM direct_grants
        )
 SELECT ag.user_id,
    p.id AS permission_id,
    p.code AS permission_code,
    p.module,
    p.action
   FROM ((all_grants ag
     JOIN public.permissions p ON ((p.id = ag.permission_id)))
     LEFT JOIN direct_denies dd ON (((dd.user_id = ag.user_id) AND (dd.permission_id = ag.permission_id))))
  WHERE (dd.permission_id IS NULL);


ALTER VIEW public.v_effective_user_permissions OWNER TO postgres;

--
-- Name: v_rekap_absensi_siswa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_rekap_absensi_siswa AS
 SELECT a.siswa_id,
    ss.jadwal_pelajaran_id,
    jp.kelas_id,
    jp.mata_pelajaran_id,
    jp.semester_id,
    count(*) FILTER (WHERE (a.status = 'hadir'::public.status_absensi)) AS total_hadir,
    count(*) FILTER (WHERE (a.status = 'sakit'::public.status_absensi)) AS total_sakit,
    count(*) FILTER (WHERE (a.status = 'izin'::public.status_absensi)) AS total_izin,
    count(*) FILTER (WHERE (a.status = 'alpa'::public.status_absensi)) AS total_alpa,
    count(*) AS total_pertemuan
   FROM ((public.absensi_siswa a
     JOIN public.sesi_absensi_siswa ss ON ((ss.id = a.sesi_absensi_id)))
     JOIN public.jadwal_pelajaran jp ON ((jp.id = ss.jadwal_pelajaran_id)))
  GROUP BY a.siswa_id, ss.jadwal_pelajaran_id, jp.kelas_id, jp.mata_pelajaran_id, jp.semester_id;


ALTER VIEW public.v_rekap_absensi_siswa OWNER TO postgres;

--
-- Name: v_siswa_kelas_aktif; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_siswa_kelas_aktif AS
 SELECT sk.id AS siswa_kelas_id,
    s.id AS siswa_id,
    s.nisn,
    s.nis,
    s.nama_lengkap,
    k.id AS kelas_id,
    k.nama AS kelas_nama,
    k.tingkat,
    ta.id AS tahun_ajaran_id,
    ta.nama AS tahun_ajaran
   FROM (((public.siswa_kelas sk
     JOIN public.siswa s ON ((s.id = sk.siswa_id)))
     JOIN public.kelas k ON ((k.id = sk.kelas_id)))
     JOIN public.tahun_ajaran ta ON ((ta.id = k.tahun_ajaran_id)))
  WHERE ((sk.is_active = true) AND (s.deleted_at IS NULL) AND (k.deleted_at IS NULL));


ALTER VIEW public.v_siswa_kelas_aktif OWNER TO postgres;

--
-- Name: absensi_ekstrakurikuler absensi_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_ekstrakurikuler
    ADD CONSTRAINT absensi_ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: absensi_guru_piket absensi_guru_piket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru_piket
    ADD CONSTRAINT absensi_guru_piket_pkey PRIMARY KEY (id);


--
-- Name: absensi_guru absensi_guru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru
    ADD CONSTRAINT absensi_guru_pkey PRIMARY KEY (id);


--
-- Name: absensi_siswa absensi_siswa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_siswa
    ADD CONSTRAINT absensi_siswa_pkey PRIMARY KEY (id);


--
-- Name: anggota_ekstrakurikuler anggota_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT anggota_ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: buku buku_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buku
    ADD CONSTRAINT buku_pkey PRIMARY KEY (id);


--
-- Name: catatan_konseling catatan_konseling_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catatan_konseling
    ADD CONSTRAINT catatan_konseling_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ekstrakurikuler
    ADD CONSTRAINT ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: guru guru_pegawai_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru
    ADD CONSTRAINT guru_pegawai_id_key UNIQUE (pegawai_id);


--
-- Name: guru guru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru
    ADD CONSTRAINT guru_pkey PRIMARY KEY (id);


--
-- Name: inventaris_buku inventaris_buku_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaris_buku
    ADD CONSTRAINT inventaris_buku_pkey PRIMARY KEY (id);


--
-- Name: jadwal_ekstrakurikuler jadwal_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ekstrakurikuler
    ADD CONSTRAINT jadwal_ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: jadwal_pelajaran jadwal_pelajaran_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT jadwal_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: jadwal_piket_guru jadwal_piket_guru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket_guru
    ADD CONSTRAINT jadwal_piket_guru_pkey PRIMARY KEY (jadwal_piket_id, guru_id);


--
-- Name: jadwal_piket jadwal_piket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket
    ADD CONSTRAINT jadwal_piket_pkey PRIMARY KEY (id);


--
-- Name: kategori_buku kategori_buku_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_buku
    ADD CONSTRAINT kategori_buku_pkey PRIMARY KEY (id);


--
-- Name: kelas kelas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT kelas_pkey PRIMARY KEY (id);


--
-- Name: mata_pelajaran mata_pelajaran_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: pegawai pegawai_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pegawai
    ADD CONSTRAINT pegawai_pkey PRIMARY KEY (id);


--
-- Name: pegawai pegawai_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pegawai
    ADD CONSTRAINT pegawai_user_id_key UNIQUE (user_id);


--
-- Name: pembina_ekstrakurikuler pembina_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pembina_ekstrakurikuler
    ADD CONSTRAINT pembina_ekstrakurikuler_pkey PRIMARY KEY (ekstrakurikuler_id, pegawai_id, tanggal_mulai);


--
-- Name: permintaan_perubahan_ekstrakurikuler permintaan_perubahan_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_perubahan_ekstrakurikuler
    ADD CONSTRAINT permintaan_perubahan_ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: semester semester_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester
    ADD CONSTRAINT semester_pkey PRIMARY KEY (id);


--
-- Name: sesi_absensi_ekstrakurikuler sesi_absensi_ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_ekstrakurikuler
    ADD CONSTRAINT sesi_absensi_ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: sesi_absensi_siswa sesi_absensi_siswa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_siswa
    ADD CONSTRAINT sesi_absensi_siswa_pkey PRIMARY KEY (id);


--
-- Name: siswa_kelas siswa_kelas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa_kelas
    ADD CONSTRAINT siswa_kelas_pkey PRIMARY KEY (id);


--
-- Name: siswa siswa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa
    ADD CONSTRAINT siswa_pkey PRIMARY KEY (id);


--
-- Name: siswa siswa_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa
    ADD CONSTRAINT siswa_user_id_key UNIQUE (user_id);


--
-- Name: tahun_ajaran tahun_ajaran_nama_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_nama_key UNIQUE (nama);


--
-- Name: tahun_ajaran tahun_ajaran_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_pkey PRIMARY KEY (id);


--
-- Name: absensi_ekstrakurikuler uq_absensi_ekskul_siswa_sesi; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_ekstrakurikuler
    ADD CONSTRAINT uq_absensi_ekskul_siswa_sesi UNIQUE (sesi_absensi_ekstrakurikuler_id, siswa_id);


--
-- Name: absensi_guru uq_absensi_guru_tanggal; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru
    ADD CONSTRAINT uq_absensi_guru_tanggal UNIQUE (guru_id, tanggal);


--
-- Name: absensi_guru_piket uq_absensi_piket_guru_tanggal; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru_piket
    ADD CONSTRAINT uq_absensi_piket_guru_tanggal UNIQUE (jadwal_piket_id, guru_id, tanggal);


--
-- Name: absensi_siswa uq_absensi_siswa_per_sesi; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_siswa
    ADD CONSTRAINT uq_absensi_siswa_per_sesi UNIQUE (sesi_absensi_id, siswa_id);


--
-- Name: anggota_ekstrakurikuler uq_anggota_ekskul_tahun; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT uq_anggota_ekskul_tahun UNIQUE (ekstrakurikuler_id, siswa_id, tahun_ajaran_id);


--
-- Name: kategori_buku uq_kategori_buku_nama; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_buku
    ADD CONSTRAINT uq_kategori_buku_nama UNIQUE (nama);


--
-- Name: permissions uq_permissions_module_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uq_permissions_module_action UNIQUE (module, action);


--
-- Name: semester uq_semester_tahun_jenis; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester
    ADD CONSTRAINT uq_semester_tahun_jenis UNIQUE (tahun_ajaran_id, jenis);


--
-- Name: sesi_absensi_ekstrakurikuler uq_sesi_absensi_ekskul_tanggal; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_ekstrakurikuler
    ADD CONSTRAINT uq_sesi_absensi_ekskul_tanggal UNIQUE (jadwal_ekstrakurikuler_id, tanggal);


--
-- Name: sesi_absensi_siswa uq_sesi_absensi_jadwal_tanggal; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_siswa
    ADD CONSTRAINT uq_sesi_absensi_jadwal_tanggal UNIQUE (jadwal_pelajaran_id, tanggal);


--
-- Name: siswa_kelas uq_siswa_kelas_history; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa_kelas
    ADD CONSTRAINT uq_siswa_kelas_history UNIQUE (siswa_id, kelas_id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_absensi_ekskul_siswa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_ekskul_siswa ON public.absensi_ekstrakurikuler USING btree (siswa_id);


--
-- Name: idx_absensi_ekskul_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_ekskul_status ON public.absensi_ekstrakurikuler USING btree (status);


--
-- Name: idx_absensi_guru_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_guru_status ON public.absensi_guru USING btree (status);


--
-- Name: idx_absensi_guru_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_guru_tanggal ON public.absensi_guru USING btree (tanggal);


--
-- Name: idx_absensi_piket_guru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_piket_guru ON public.absensi_guru_piket USING btree (guru_id);


--
-- Name: idx_absensi_piket_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_piket_tanggal ON public.absensi_guru_piket USING btree (tanggal);


--
-- Name: idx_absensi_siswa_siswa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_siswa_siswa ON public.absensi_siswa USING btree (siswa_id);


--
-- Name: idx_absensi_siswa_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_absensi_siswa_status ON public.absensi_siswa USING btree (status);


--
-- Name: idx_anggota_ekskul_siswa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anggota_ekskul_siswa ON public.anggota_ekstrakurikuler USING btree (siswa_id);


--
-- Name: idx_anggota_ekskul_tahun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anggota_ekskul_tahun ON public.anggota_ekstrakurikuler USING btree (tahun_ajaran_id);


--
-- Name: idx_audit_log_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_created_at ON public.audit_log USING btree (created_at DESC);


--
-- Name: idx_audit_log_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_buku_judul; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buku_judul ON public.buku USING btree (judul);


--
-- Name: idx_buku_kategori; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buku_kategori ON public.buku USING btree (kategori_id);


--
-- Name: idx_inventaris_buku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventaris_buku ON public.inventaris_buku USING btree (buku_id);


--
-- Name: idx_inventaris_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventaris_status ON public.inventaris_buku USING btree (status);


--
-- Name: idx_jadwal_ekskul_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_ekskul_semester ON public.jadwal_ekstrakurikuler USING btree (semester_id);


--
-- Name: idx_jadwal_guru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_guru ON public.jadwal_pelajaran USING btree (guru_id);


--
-- Name: idx_jadwal_hari; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_hari ON public.jadwal_pelajaran USING btree (hari);


--
-- Name: idx_jadwal_kelas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_kelas ON public.jadwal_pelajaran USING btree (kelas_id);


--
-- Name: idx_jadwal_mapel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_mapel ON public.jadwal_pelajaran USING btree (mata_pelajaran_id);


--
-- Name: idx_jadwal_piket_guru_guru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_piket_guru_guru ON public.jadwal_piket_guru USING btree (guru_id);


--
-- Name: idx_jadwal_piket_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_piket_semester ON public.jadwal_piket USING btree (semester_id);


--
-- Name: idx_jadwal_semester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jadwal_semester ON public.jadwal_pelajaran USING btree (semester_id);


--
-- Name: idx_kelas_tahun_ajaran; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kelas_tahun_ajaran ON public.kelas USING btree (tahun_ajaran_id);


--
-- Name: idx_kelas_wali; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kelas_wali ON public.kelas USING btree (wali_kelas_id);


--
-- Name: idx_konseling_guru_bk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_konseling_guru_bk ON public.catatan_konseling USING btree (guru_bk_id);


--
-- Name: idx_konseling_siswa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_konseling_siswa ON public.catatan_konseling USING btree (siswa_id);


--
-- Name: idx_konseling_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_konseling_tanggal ON public.catatan_konseling USING btree (tanggal);


--
-- Name: idx_konseling_visibilitas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_konseling_visibilitas ON public.catatan_konseling USING btree (visibilitas);


--
-- Name: idx_pegawai_nama; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pegawai_nama ON public.pegawai USING btree (nama_lengkap);


--
-- Name: idx_pegawai_status_aktif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pegawai_status_aktif ON public.pegawai USING btree (status_aktif);


--
-- Name: idx_pembina_ekskul_pegawai; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pembina_ekskul_pegawai ON public.pembina_ekstrakurikuler USING btree (pegawai_id);


--
-- Name: idx_permintaan_ekskul_pengaju; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permintaan_ekskul_pengaju ON public.permintaan_perubahan_ekstrakurikuler USING btree (diajukan_oleh);


--
-- Name: idx_permintaan_ekskul_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permintaan_ekskul_status ON public.permintaan_perubahan_ekstrakurikuler USING btree (status);


--
-- Name: idx_permintaan_ekskul_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permintaan_ekskul_target ON public.permintaan_perubahan_ekstrakurikuler USING btree (target_ekstrakurikuler_id);


--
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- Name: idx_semester_tahun_ajaran; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_semester_tahun_ajaran ON public.semester USING btree (tahun_ajaran_id);


--
-- Name: idx_sesi_absensi_ekskul_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sesi_absensi_ekskul_tanggal ON public.sesi_absensi_ekstrakurikuler USING btree (tanggal);


--
-- Name: idx_sesi_absensi_guru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sesi_absensi_guru ON public.sesi_absensi_siswa USING btree (dibuka_oleh_guru_id);


--
-- Name: idx_sesi_absensi_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sesi_absensi_tanggal ON public.sesi_absensi_siswa USING btree (tanggal);


--
-- Name: idx_siswa_kelas_kelas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_siswa_kelas_kelas ON public.siswa_kelas USING btree (kelas_id);


--
-- Name: idx_siswa_nama; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_siswa_nama ON public.siswa USING btree (nama_lengkap);


--
-- Name: idx_siswa_status_aktif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_siswa_status_aktif ON public.siswa USING btree (status_aktif);


--
-- Name: idx_user_permissions_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_permissions_permission_id ON public.user_permissions USING btree (permission_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: uq_buku_isbn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_buku_isbn ON public.buku USING btree (isbn) WHERE ((isbn IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_ekstrakurikuler_kode_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_ekstrakurikuler_kode_ci ON public.ekstrakurikuler USING btree (lower((kode)::text)) WHERE (deleted_at IS NULL);


--
-- Name: uq_ekstrakurikuler_nama_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_ekstrakurikuler_nama_ci ON public.ekstrakurikuler USING btree (lower((nama)::text)) WHERE (deleted_at IS NULL);


--
-- Name: uq_guru_kode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_guru_kode ON public.guru USING btree (kode_guru) WHERE (kode_guru IS NOT NULL);


--
-- Name: uq_inventaris_barcode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_inventaris_barcode ON public.inventaris_buku USING btree (barcode) WHERE ((barcode IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_inventaris_kode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_inventaris_kode ON public.inventaris_buku USING btree (kode_inventaris) WHERE (deleted_at IS NULL);


--
-- Name: uq_jadwal_ekskul_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_jadwal_ekskul_start ON public.jadwal_ekstrakurikuler USING btree (ekstrakurikuler_id, semester_id, hari, jam_mulai) WHERE ((status_aktif = true) AND (deleted_at IS NULL));


--
-- Name: uq_jadwal_guru_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_jadwal_guru_start ON public.jadwal_pelajaran USING btree (semester_id, guru_id, hari, jam_mulai) WHERE ((status_aktif = true) AND (deleted_at IS NULL));


--
-- Name: uq_jadwal_kelas_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_jadwal_kelas_start ON public.jadwal_pelajaran USING btree (semester_id, kelas_id, hari, jam_mulai) WHERE ((status_aktif = true) AND (deleted_at IS NULL));


--
-- Name: uq_jadwal_piket_identitas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_jadwal_piket_identitas ON public.jadwal_piket USING btree (semester_id, lower((nama)::text), hari, jam_mulai) WHERE (deleted_at IS NULL);


--
-- Name: uq_kelas_tahun_nama; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_kelas_tahun_nama ON public.kelas USING btree (tahun_ajaran_id, lower((nama)::text)) WHERE (deleted_at IS NULL);


--
-- Name: uq_kelas_wali_per_tahun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_kelas_wali_per_tahun ON public.kelas USING btree (tahun_ajaran_id, wali_kelas_id) WHERE ((wali_kelas_id IS NOT NULL) AND (status_aktif = true) AND (deleted_at IS NULL));


--
-- Name: uq_mata_pelajaran_kode_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_mata_pelajaran_kode_ci ON public.mata_pelajaran USING btree (lower((kode)::text)) WHERE (deleted_at IS NULL);


--
-- Name: uq_mata_pelajaran_nama_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_mata_pelajaran_nama_ci ON public.mata_pelajaran USING btree (lower((nama)::text)) WHERE (deleted_at IS NULL);


--
-- Name: uq_pegawai_email_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_pegawai_email_ci ON public.pegawai USING btree (lower((email)::text)) WHERE ((email IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_pegawai_nip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_pegawai_nip ON public.pegawai USING btree (nip) WHERE ((nip IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_pegawai_nuptk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_pegawai_nuptk ON public.pegawai USING btree (nuptk) WHERE ((nuptk IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_pembina_ekskul_aktif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_pembina_ekskul_aktif ON public.pembina_ekstrakurikuler USING btree (ekstrakurikuler_id, pegawai_id) WHERE (is_active = true);


--
-- Name: uq_semester_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_semester_active ON public.semester USING btree (is_active) WHERE (is_active = true);


--
-- Name: uq_siswa_email_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_siswa_email_ci ON public.siswa USING btree (lower((email)::text)) WHERE ((email IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_siswa_nis; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_siswa_nis ON public.siswa USING btree (nis) WHERE ((nis IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_siswa_nisn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_siswa_nisn ON public.siswa USING btree (nisn) WHERE (deleted_at IS NULL);


--
-- Name: uq_siswa_satu_kelas_aktif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_siswa_satu_kelas_aktif ON public.siswa_kelas USING btree (siswa_id) WHERE (is_active = true);


--
-- Name: uq_tahun_ajaran_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_tahun_ajaran_active ON public.tahun_ajaran USING btree (is_active) WHERE (is_active = true);


--
-- Name: uq_users_email_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_users_email_ci ON public.users USING btree (lower((email)::text)) WHERE ((email IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: uq_users_username_ci; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_users_username_ci ON public.users USING btree (lower((username)::text)) WHERE (deleted_at IS NULL);


--
-- Name: absensi_ekstrakurikuler trg_absensi_ekskul_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_absensi_ekskul_updated_at BEFORE UPDATE ON public.absensi_ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: absensi_guru_piket trg_absensi_guru_piket_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_absensi_guru_piket_updated_at BEFORE UPDATE ON public.absensi_guru_piket FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: absensi_guru trg_absensi_guru_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_absensi_guru_updated_at BEFORE UPDATE ON public.absensi_guru FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: absensi_siswa trg_absensi_siswa_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_absensi_siswa_updated_at BEFORE UPDATE ON public.absensi_siswa FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: anggota_ekstrakurikuler trg_anggota_ekskul_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_anggota_ekskul_updated_at BEFORE UPDATE ON public.anggota_ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: buku trg_buku_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_buku_updated_at BEFORE UPDATE ON public.buku FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: catatan_konseling trg_catatan_konseling_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_catatan_konseling_updated_at BEFORE UPDATE ON public.catatan_konseling FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ekstrakurikuler trg_ekstrakurikuler_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ekstrakurikuler_updated_at BEFORE UPDATE ON public.ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: guru trg_guru_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_guru_updated_at BEFORE UPDATE ON public.guru FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: inventaris_buku trg_inventaris_buku_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_inventaris_buku_updated_at BEFORE UPDATE ON public.inventaris_buku FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jadwal_ekstrakurikuler trg_jadwal_ekskul_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_jadwal_ekskul_updated_at BEFORE UPDATE ON public.jadwal_ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jadwal_piket trg_jadwal_piket_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_jadwal_piket_updated_at BEFORE UPDATE ON public.jadwal_piket FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jadwal_pelajaran trg_jadwal_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_jadwal_updated_at BEFORE UPDATE ON public.jadwal_pelajaran FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jadwal_pelajaran trg_jadwal_validate_overlap; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_jadwal_validate_overlap BEFORE INSERT OR UPDATE OF semester_id, kelas_id, guru_id, hari, jam_mulai, jam_selesai, status_aktif, deleted_at ON public.jadwal_pelajaran FOR EACH ROW EXECUTE FUNCTION public.validate_jadwal_pelajaran_overlap();


--
-- Name: kategori_buku trg_kategori_buku_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_kategori_buku_updated_at BEFORE UPDATE ON public.kategori_buku FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: kelas trg_kelas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_kelas_updated_at BEFORE UPDATE ON public.kelas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: mata_pelajaran trg_mata_pelajaran_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_mata_pelajaran_updated_at BEFORE UPDATE ON public.mata_pelajaran FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pegawai trg_pegawai_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_pegawai_updated_at BEFORE UPDATE ON public.pegawai FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: permintaan_perubahan_ekstrakurikuler trg_permintaan_ekskul_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_permintaan_ekskul_updated_at BEFORE UPDATE ON public.permintaan_perubahan_ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: roles trg_roles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: semester trg_semester_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_semester_updated_at BEFORE UPDATE ON public.semester FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sesi_absensi_ekstrakurikuler trg_sesi_absensi_ekskul_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sesi_absensi_ekskul_updated_at BEFORE UPDATE ON public.sesi_absensi_ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sesi_absensi_siswa trg_sesi_absensi_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sesi_absensi_updated_at BEFORE UPDATE ON public.sesi_absensi_siswa FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: siswa_kelas trg_siswa_kelas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_siswa_kelas_updated_at BEFORE UPDATE ON public.siswa_kelas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: siswa trg_siswa_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_siswa_updated_at BEFORE UPDATE ON public.siswa FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: tahun_ajaran trg_tahun_ajaran_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tahun_ajaran_updated_at BEFORE UPDATE ON public.tahun_ajaran FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: absensi_ekstrakurikuler fk_absensi_ekskul_dicatat_oleh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_ekstrakurikuler
    ADD CONSTRAINT fk_absensi_ekskul_dicatat_oleh FOREIGN KEY (dicatat_oleh) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: absensi_ekstrakurikuler fk_absensi_ekskul_sesi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_ekstrakurikuler
    ADD CONSTRAINT fk_absensi_ekskul_sesi FOREIGN KEY (sesi_absensi_ekstrakurikuler_id) REFERENCES public.sesi_absensi_ekstrakurikuler(id) ON DELETE CASCADE;


--
-- Name: absensi_ekstrakurikuler fk_absensi_ekskul_siswa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_ekstrakurikuler
    ADD CONSTRAINT fk_absensi_ekskul_siswa FOREIGN KEY (siswa_id) REFERENCES public.siswa(id) ON DELETE RESTRICT;


--
-- Name: absensi_guru fk_absensi_guru_guru; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru
    ADD CONSTRAINT fk_absensi_guru_guru FOREIGN KEY (guru_id) REFERENCES public.guru(id) ON DELETE RESTRICT;


--
-- Name: absensi_guru fk_absensi_guru_verifikator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru
    ADD CONSTRAINT fk_absensi_guru_verifikator FOREIGN KEY (diverifikasi_oleh) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: absensi_guru_piket fk_absensi_piket_penugasan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_guru_piket
    ADD CONSTRAINT fk_absensi_piket_penugasan FOREIGN KEY (jadwal_piket_id, guru_id) REFERENCES public.jadwal_piket_guru(jadwal_piket_id, guru_id) ON DELETE RESTRICT;


--
-- Name: absensi_siswa fk_absensi_siswa_dicatat_oleh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_siswa
    ADD CONSTRAINT fk_absensi_siswa_dicatat_oleh FOREIGN KEY (dicatat_oleh) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: absensi_siswa fk_absensi_siswa_sesi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_siswa
    ADD CONSTRAINT fk_absensi_siswa_sesi FOREIGN KEY (sesi_absensi_id) REFERENCES public.sesi_absensi_siswa(id) ON DELETE CASCADE;


--
-- Name: absensi_siswa fk_absensi_siswa_siswa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absensi_siswa
    ADD CONSTRAINT fk_absensi_siswa_siswa FOREIGN KEY (siswa_id) REFERENCES public.siswa(id) ON DELETE RESTRICT;


--
-- Name: anggota_ekstrakurikuler fk_anggota_ekskul_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT fk_anggota_ekskul_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: anggota_ekstrakurikuler fk_anggota_ekskul_ekskul; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT fk_anggota_ekskul_ekskul FOREIGN KEY (ekstrakurikuler_id) REFERENCES public.ekstrakurikuler(id) ON DELETE RESTRICT;


--
-- Name: anggota_ekstrakurikuler fk_anggota_ekskul_siswa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT fk_anggota_ekskul_siswa FOREIGN KEY (siswa_id) REFERENCES public.siswa(id) ON DELETE RESTRICT;


--
-- Name: anggota_ekstrakurikuler fk_anggota_ekskul_tahun; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anggota_ekstrakurikuler
    ADD CONSTRAINT fk_anggota_ekskul_tahun FOREIGN KEY (tahun_ajaran_id) REFERENCES public.tahun_ajaran(id) ON DELETE RESTRICT;


--
-- Name: audit_log fk_audit_log_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: buku fk_buku_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buku
    ADD CONSTRAINT fk_buku_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: buku fk_buku_kategori; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buku
    ADD CONSTRAINT fk_buku_kategori FOREIGN KEY (kategori_id) REFERENCES public.kategori_buku(id) ON DELETE SET NULL;


--
-- Name: buku fk_buku_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buku
    ADD CONSTRAINT fk_buku_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ekstrakurikuler fk_ekstrakurikuler_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ekstrakurikuler
    ADD CONSTRAINT fk_ekstrakurikuler_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ekstrakurikuler fk_ekstrakurikuler_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ekstrakurikuler
    ADD CONSTRAINT fk_ekstrakurikuler_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: guru fk_guru_pegawai; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru
    ADD CONSTRAINT fk_guru_pegawai FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE RESTRICT;


--
-- Name: inventaris_buku fk_inventaris_buku_buku; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaris_buku
    ADD CONSTRAINT fk_inventaris_buku_buku FOREIGN KEY (buku_id) REFERENCES public.buku(id) ON DELETE RESTRICT;


--
-- Name: inventaris_buku fk_inventaris_buku_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaris_buku
    ADD CONSTRAINT fk_inventaris_buku_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventaris_buku fk_inventaris_buku_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaris_buku
    ADD CONSTRAINT fk_inventaris_buku_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jadwal_pelajaran fk_jadwal_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jadwal_ekstrakurikuler fk_jadwal_ekskul_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ekstrakurikuler
    ADD CONSTRAINT fk_jadwal_ekskul_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jadwal_ekstrakurikuler fk_jadwal_ekskul_ekskul; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ekstrakurikuler
    ADD CONSTRAINT fk_jadwal_ekskul_ekskul FOREIGN KEY (ekstrakurikuler_id) REFERENCES public.ekstrakurikuler(id) ON DELETE RESTRICT;


--
-- Name: jadwal_ekstrakurikuler fk_jadwal_ekskul_semester; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ekstrakurikuler
    ADD CONSTRAINT fk_jadwal_ekskul_semester FOREIGN KEY (semester_id) REFERENCES public.semester(id) ON DELETE RESTRICT;


--
-- Name: jadwal_pelajaran fk_jadwal_guru; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_guru FOREIGN KEY (guru_id) REFERENCES public.guru(id) ON DELETE RESTRICT;


--
-- Name: jadwal_pelajaran fk_jadwal_kelas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_kelas FOREIGN KEY (kelas_id) REFERENCES public.kelas(id) ON DELETE RESTRICT;


--
-- Name: jadwal_pelajaran fk_jadwal_mata_pelajaran; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_mata_pelajaran FOREIGN KEY (mata_pelajaran_id) REFERENCES public.mata_pelajaran(id) ON DELETE RESTRICT;


--
-- Name: jadwal_piket fk_jadwal_piket_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket
    ADD CONSTRAINT fk_jadwal_piket_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jadwal_piket_guru fk_jadwal_piket_guru_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket_guru
    ADD CONSTRAINT fk_jadwal_piket_guru_assigned_by FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jadwal_piket_guru fk_jadwal_piket_guru_guru; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket_guru
    ADD CONSTRAINT fk_jadwal_piket_guru_guru FOREIGN KEY (guru_id) REFERENCES public.guru(id) ON DELETE RESTRICT;


--
-- Name: jadwal_piket_guru fk_jadwal_piket_guru_jadwal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket_guru
    ADD CONSTRAINT fk_jadwal_piket_guru_jadwal FOREIGN KEY (jadwal_piket_id) REFERENCES public.jadwal_piket(id) ON DELETE CASCADE;


--
-- Name: jadwal_piket fk_jadwal_piket_semester; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_piket
    ADD CONSTRAINT fk_jadwal_piket_semester FOREIGN KEY (semester_id) REFERENCES public.semester(id) ON DELETE RESTRICT;


--
-- Name: jadwal_pelajaran fk_jadwal_semester; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_semester FOREIGN KEY (semester_id) REFERENCES public.semester(id) ON DELETE RESTRICT;


--
-- Name: jadwal_pelajaran fk_jadwal_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelajaran
    ADD CONSTRAINT fk_jadwal_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: kelas fk_kelas_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT fk_kelas_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: kelas fk_kelas_tahun_ajaran; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT fk_kelas_tahun_ajaran FOREIGN KEY (tahun_ajaran_id) REFERENCES public.tahun_ajaran(id) ON DELETE RESTRICT;


--
-- Name: kelas fk_kelas_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT fk_kelas_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: kelas fk_kelas_wali; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT fk_kelas_wali FOREIGN KEY (wali_kelas_id) REFERENCES public.guru(id) ON DELETE SET NULL;


--
-- Name: catatan_konseling fk_konseling_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catatan_konseling
    ADD CONSTRAINT fk_konseling_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: catatan_konseling fk_konseling_guru_bk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catatan_konseling
    ADD CONSTRAINT fk_konseling_guru_bk FOREIGN KEY (guru_bk_id) REFERENCES public.guru(id) ON DELETE RESTRICT;


--
-- Name: catatan_konseling fk_konseling_siswa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catatan_konseling
    ADD CONSTRAINT fk_konseling_siswa FOREIGN KEY (siswa_id) REFERENCES public.siswa(id) ON DELETE RESTRICT;


--
-- Name: catatan_konseling fk_konseling_updated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catatan_konseling
    ADD CONSTRAINT fk_konseling_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pegawai fk_pegawai_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pegawai
    ADD CONSTRAINT fk_pegawai_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pembina_ekstrakurikuler fk_pembina_ekskul_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pembina_ekstrakurikuler
    ADD CONSTRAINT fk_pembina_ekskul_assigned_by FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pembina_ekstrakurikuler fk_pembina_ekskul_ekskul; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pembina_ekstrakurikuler
    ADD CONSTRAINT fk_pembina_ekskul_ekskul FOREIGN KEY (ekstrakurikuler_id) REFERENCES public.ekstrakurikuler(id) ON DELETE RESTRICT;


--
-- Name: pembina_ekstrakurikuler fk_pembina_ekskul_pegawai; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pembina_ekstrakurikuler
    ADD CONSTRAINT fk_pembina_ekskul_pegawai FOREIGN KEY (pegawai_id) REFERENCES public.pegawai(id) ON DELETE RESTRICT;


--
-- Name: permintaan_perubahan_ekstrakurikuler fk_permintaan_ekskul_pemeriksa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_perubahan_ekstrakurikuler
    ADD CONSTRAINT fk_permintaan_ekskul_pemeriksa FOREIGN KEY (diperiksa_oleh) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: permintaan_perubahan_ekstrakurikuler fk_permintaan_ekskul_pengaju; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_perubahan_ekstrakurikuler
    ADD CONSTRAINT fk_permintaan_ekskul_pengaju FOREIGN KEY (diajukan_oleh) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: permintaan_perubahan_ekstrakurikuler fk_permintaan_ekskul_target; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permintaan_perubahan_ekstrakurikuler
    ADD CONSTRAINT fk_permintaan_ekskul_target FOREIGN KEY (target_ekstrakurikuler_id) REFERENCES public.ekstrakurikuler(id) ON DELETE RESTRICT;


--
-- Name: role_permissions fk_role_permissions_permission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions fk_role_permissions_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: semester fk_semester_tahun_ajaran; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semester
    ADD CONSTRAINT fk_semester_tahun_ajaran FOREIGN KEY (tahun_ajaran_id) REFERENCES public.tahun_ajaran(id) ON DELETE RESTRICT;


--
-- Name: sesi_absensi_ekstrakurikuler fk_sesi_absensi_ekskul_jadwal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_ekstrakurikuler
    ADD CONSTRAINT fk_sesi_absensi_ekskul_jadwal FOREIGN KEY (jadwal_ekstrakurikuler_id) REFERENCES public.jadwal_ekstrakurikuler(id) ON DELETE RESTRICT;


--
-- Name: sesi_absensi_ekstrakurikuler fk_sesi_absensi_ekskul_pembina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_ekstrakurikuler
    ADD CONSTRAINT fk_sesi_absensi_ekskul_pembina FOREIGN KEY (pembina_pegawai_id) REFERENCES public.pegawai(id) ON DELETE RESTRICT;


--
-- Name: sesi_absensi_siswa fk_sesi_absensi_guru; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_siswa
    ADD CONSTRAINT fk_sesi_absensi_guru FOREIGN KEY (dibuka_oleh_guru_id) REFERENCES public.guru(id) ON DELETE RESTRICT;


--
-- Name: sesi_absensi_siswa fk_sesi_absensi_jadwal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesi_absensi_siswa
    ADD CONSTRAINT fk_sesi_absensi_jadwal FOREIGN KEY (jadwal_pelajaran_id) REFERENCES public.jadwal_pelajaran(id) ON DELETE RESTRICT;


--
-- Name: siswa_kelas fk_siswa_kelas_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa_kelas
    ADD CONSTRAINT fk_siswa_kelas_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: siswa_kelas fk_siswa_kelas_kelas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa_kelas
    ADD CONSTRAINT fk_siswa_kelas_kelas FOREIGN KEY (kelas_id) REFERENCES public.kelas(id) ON DELETE RESTRICT;


--
-- Name: siswa_kelas fk_siswa_kelas_siswa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa_kelas
    ADD CONSTRAINT fk_siswa_kelas_siswa FOREIGN KEY (siswa_id) REFERENCES public.siswa(id) ON DELETE RESTRICT;


--
-- Name: siswa fk_siswa_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa
    ADD CONSTRAINT fk_siswa_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_permissions fk_user_permissions_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT fk_user_permissions_assigned_by FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_permissions fk_user_permissions_permission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT fk_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions fk_user_permissions_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles fk_user_roles_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles fk_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles fk_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Ezz18BX6l2DRC6tOKpRpadLLaVIDxWhldFr35uOfqnWQ96V0aagkDovbyRUiigw

