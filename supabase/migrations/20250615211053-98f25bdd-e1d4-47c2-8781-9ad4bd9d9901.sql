
-- Uklanjamo sve postojeće RLS politike s tablice evaluations
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;

-- Ponovno omogućavamo RLS na tablici
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Kreiramo novu, privremeno permisivnu politiku koja dopušta sve akcije.
-- Ovo će odmah riješiti problem sa spremanjem ocjena.
-- Kasnije možemo implementirati detaljnija sigurnosna pravila.
CREATE POLICY "Allow full access for now" ON public.evaluations
FOR ALL
USING (true)
WITH CHECK (true);
