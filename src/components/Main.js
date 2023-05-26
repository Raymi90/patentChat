import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import React, { useEffect, useState } from "react";
import { client } from "../supabase/supabaseClient";
import { ConfigProvider, theme } from "antd";
import { ResetPassword } from "./ResetPassword";

export const Main = () => {
  const [session, setSession] = useState(null);
  const [openModalRecover, setOpenModalRecover] = useState(false);
  const [mode, setMode] = useState(false);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      setMode(event.matches ? true : false);
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
    <ConfigProvider
      theme={{
        algorithm: mode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      {session ? (
        <Dashboard user={session.user} mode={mode} setMode={setMode} />
      ) : (
        <Login />
      )}
      <ResetPassword open={openModalRecover} setOpen={setOpenModalRecover} />
    </ConfigProvider>
  );
};
