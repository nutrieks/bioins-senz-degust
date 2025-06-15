
-- Uklanjamo postojeće RLS politike kako bismo izbjegli konflikte.
DROP POLICY IF EXISTS "Allow full access for now" ON public.evaluations;
DROP POLICY IF EXISTS "Users can manage their own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Admins can manage all evaluations" ON public.evaluations;

-- Omogućavamo RLS na tablici 'evaluations' ako je isključen.
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Politika za ocjenjivače: Mogu kreirati, čitati, ažurirati i brisati VLASTITE ocjene.
-- auth.uid() dohvaća ID trenutno prijavljenog korisnika.
CREATE POLICY "Users can manage their own evaluations"
ON public.evaluations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politika za administratore: Mogu raditi sve sa svim ocjenama.
-- Koristi se postojeća funkcija is_admin().
CREATE POLICY "Admins can manage all evaluations"
ON public.evaluations
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
