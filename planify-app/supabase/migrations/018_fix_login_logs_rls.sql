-- Fix login_logs RLS policy to allow inserts

-- Allow users to insert their own login logs
CREATE POLICY "Kullanıcılar kendi login loglarını ekleyebilir" 
    ON public.login_logs 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Optional: If the table was already created, just ensure this policy is added.
