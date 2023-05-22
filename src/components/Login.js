import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { client } from "../supabase/supabaseClient";
import ModalRestorePass from "./ModalRestorePass";
import { Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";
import { CustomAlert } from "./CustomAlert";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://poatransip.com/">
        Patrans Ip
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openModalRecover, setOpenModalRecover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [type, setType] = React.useState("success");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setType("error");
        setMessage("Las credenciales son incorrectas");
        setOpenAlert(true);
        setLoading(false);
      }
      if (data) {
        setLoading(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <MarkUnreadChatAltIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Patent-Chat
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar sesión
          </Button>
          <Grid container>
            <Grid item xs>
              <Link
                sx={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  setOpenModalRecover(true);
                  setPassword("");
                }}
                variant="body2"
              >
                Olvidaste tu contraseña?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
      <ModalRestorePass
        email={email}
        setEmail={setEmail}
        open={openModalRecover}
        setOpen={setOpenModalRecover}
        setMessage={setMessage}
        setType={setType}
        setOpenAlert={setOpenAlert}
      />
      <CustomAlert
        open={openAlert}
        setOpen={setOpenAlert}
        type={type}
        message={message}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};
