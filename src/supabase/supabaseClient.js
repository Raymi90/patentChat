import { createClient } from "@supabase/supabase-js";

export const client = createClient(
  process.env.REACT_APP_PROJECT_URL,
  process.env.REACT_APP_SECRET_KEY,
);
