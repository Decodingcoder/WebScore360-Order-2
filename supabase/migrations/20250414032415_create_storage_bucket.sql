-- Create a storage bucket for PDF reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for the reports bucket
CREATE POLICY "Public can read reports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports');

CREATE POLICY "Authenticated users can upload reports" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage all reports"
  ON storage.objects FOR ALL
  USING (bucket_id = 'reports' AND auth.role() = 'service_role'); 