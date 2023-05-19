import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import React, { useEffect, useState } from "react";
import { client } from "./supabase/supabaseClient";
import { ThemeProvider, createTheme } from "@mui/material";
function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      {session ? <Dashboard /> : <Login />}
    </ThemeProvider>
  );
}

export default App;
