CREATE TABLE public.booking_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL CHECK (char_length(trim(client_name)) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 255),
  project_type text NOT NULL CHECK (project_type IN ('Photography', 'Video', 'Photography & Video')),
  preferred_date date,
  location text NOT NULL CHECK (char_length(trim(location)) BETWEEN 1 AND 160),
  project_description text NOT NULL CHECK (char_length(trim(project_description)) BETWEEN 10 AND 2000),
  inquiry_draft text NOT NULL CHECK (char_length(trim(inquiry_draft)) BETWEEN 10 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.booking_inquiries TO service_role;
ALTER TABLE public.booking_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages booking inquiries" ON public.booking_inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.booking_inquiry_rate_limits (
  rate_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  CONSTRAINT booking_inquiry_rate_limits_count_positive CHECK (request_count >= 0)
);
GRANT ALL ON public.booking_inquiry_rate_limits TO service_role;
ALTER TABLE public.booking_inquiry_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages booking inquiry rate limits" ON public.booking_inquiry_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_booking_inquiry_rate_limit(p_rate_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  INSERT INTO public.booking_inquiry_rate_limits (rate_key, window_started_at, request_count)
  VALUES (p_rate_key, now(), 1)
  ON CONFLICT (rate_key) DO UPDATE
    SET window_started_at = CASE
          WHEN public.booking_inquiry_rate_limits.window_started_at < now() - interval '15 minutes' THEN now()
          ELSE public.booking_inquiry_rate_limits.window_started_at
        END,
        request_count = CASE
          WHEN public.booking_inquiry_rate_limits.window_started_at < now() - interval '15 minutes' THEN 1
          ELSE public.booking_inquiry_rate_limits.request_count + 1
        END
  RETURNING request_count INTO current_count;
  RETURN current_count <= 3;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_booking_inquiry_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_booking_inquiry_rate_limit(text) TO service_role;