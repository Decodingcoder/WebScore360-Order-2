CREATE OR REPLACE FUNCTION link_audits_to_user(user_id_input uuid, user_email_input text)
RETURNS void -- Doesn't need to return anything
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Run with the permissions of the function owner (usually postgres) to bypass RLS
AS $$
BEGIN
  UPDATE audits
  SET user_id = user_id_input
  WHERE 
    requested_email = user_email_input 
    AND user_id IS NULL; -- Only update audits that haven't been claimed by a user yet
END;
$$; 