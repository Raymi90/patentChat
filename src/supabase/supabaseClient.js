import { createClient } from "@supabase/supabase-js";

export const client = createClient(
  process.env.REACT_APP_PROJECT_URL,
  process.env.REACT_APP_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const adminAuthClient = client.auth.admin;
