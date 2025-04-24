CREATE OR REPLACE FUNCTION public.handle_new_user_audit_linking()
RETURNS TRIGGER AS $$
DECLARE
  latest_audit_id UUID;
BEGIN
  -- Find the most recent audit requested by this email within the last 15 minutes
  -- which hasn't been assigned to a user yet.
  SELECT id INTO latest_audit_id
  FROM public.audits
  WHERE requested_email = NEW.email
    AND user_id IS NULL
    AND created_at >= (NOW() - INTERVAL '24 hours')
  ORDER BY created_at DESC
  LIMIT 1;

  -- If a recent, unassigned audit is found, link it and update the profile's quota
  IF latest_audit_id IS NOT NULL THEN
    -- Link the audit to the new user
    UPDATE public.audits
    SET user_id = NEW.id
    WHERE id = latest_audit_id;

    -- Set the audits_remaining to 0 for the new user's profile
    -- Assumes the profile is created by the 'handle_new_user' trigger first
    UPDATE public.profiles
    SET audits_remaining = 0
    WHERE id = NEW.id;

    -- Optional: Log that linking occurred
    RAISE LOG 'Linked audit % to user % and set audits_remaining to 0', latest_audit_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to run AFTER the user profile is created
-- but still AFTER INSERT on auth.users
CREATE TRIGGER on_auth_user_created_link_audit
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_audit_linking(); 