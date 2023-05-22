import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { client } from "../supabase/supabaseClient";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ModalRestorePass({
  open,
  setOpen,
  email,
  setOpenAlert,
  setMessage,
  setType,
  setEmail,
}) {
  const handleClose = () => {
    setOpen(false);
  };

  const restorePass = async () => {
    console.log("restore pass");

    const { data, error } = await client.auth.resetPasswordForEmail(email);
    if (error) {
      setType("error");
      setMessage("No se pudo enviar el correo de recuperación de contraseña");
      setOpenAlert(true);
    }
    if (data) {
      setType("success");
      setMessage("Se ha enviado un correo para restaurar tu contraseña");
      setOpenAlert(true);
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para recuperar tu contraseña, ingresa tu correo electrónico( o
            verificalo en caso de que sea correcto).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={restorePass}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
