DROP INDEX IF EXISTS public.uq_tahun_ajaran_active;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tahun_ajaran_active
  ON public.tahun_ajaran (is_active)
  WHERE is_active = true;

DROP INDEX IF EXISTS public.uq_semester_active;
CREATE UNIQUE INDEX IF NOT EXISTS uq_semester_active
  ON public.semester (is_active)
  WHERE is_active = true;
