import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import React, { useEffect, useState } from "react";
import { client, channel } from "../supabase/supabaseClient";
import { ThemeProvider, createTheme } from "@mui/material";
import { ResetPassword } from "./ResetPassword";
import { CustomAlert } from "./CustomAlert";
import { RealtimeChannel } from "@supabase/supabase-js";

export const Main = () => {
  const [session, setSession] = useState(null);
  const [openModalRecover, setOpenModalRecover] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const [mode, setMode] = useState("dark");

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      setMode(event.matches ? "dark" : "light");
    });

  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "PASSWORD_RECOVERY") {
        setOpenModalRecover(true);
        await client.auth.signOut();
      }
      if (_event === "SIGNED_IN") {
        setSession(session);
      }
      if (_event === "SIGNED_OUT") {
        setSession(null);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode,
        },
      })}
    >
      {session ? (
        <Dashboard user={session.user} mode={mode} setMode={setMode} />
      ) : (
        <Login />
      )}
      <ResetPassword
        open={openModalRecover}
        setOpen={setOpenModalRecover}
        setOpenAlert={setOpenAlert}
        setType={setType}
        setMessage={setMessage}
      />
      <CustomAlert
        open={openAlert}
        setOpen={setOpenAlert}
        type={type}
        message={message}
      />
    </ThemeProvider>
  );
};
