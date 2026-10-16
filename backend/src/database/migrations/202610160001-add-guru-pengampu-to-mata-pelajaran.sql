ALTER TABLE public.mata_pelajaran
  ADD COLUMN IF NOT EXISTS guru_pengampu_id integer NULL;

ALTER TABLE public.mata_pelajaran
  DROP CONSTRAINT IF EXISTS fk_mata_pelajaran_guru_pengampu;

ALTER TABLE public.mata_pelajaran
  ADD CONSTRAINT fk_mata_pelajaran_guru_pengampu
  FOREIGN KEY (guru_pengampu_id)
  REFERENCES public.guru (id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mata_pelajaran_guru_pengampu
  ON public.mata_pelajaran (guru_pengampu_id);
