import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  getAllUsers,
  getChannels,
  createChannel,
  createChannelMembers,
} from "../supabase/queries";
import Autocomplete from "@mui/material/Autocomplete";
import Draggable from "react-draggable";
import { InputAdornment } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export const ModalCreateChannel = ({ user, open, setOpen }) => {
  const [allUsers, setAllUsers] = React.useState([]);
  const [allChannels, setAllChannels] = React.useState([]);
  const [channelName, setChannelName] = React.useState("");
  const [channelMembers, setChannelMembers] = React.useState([]);
  const [errorChannelName, setErrorChannelName] = React.useState({
    error: false,
    message: "",
  });

  useEffect(() => {
    const getUsers = async () => {
      const users = await getAllUsers();
      if (users && !users.error) {
        setAllUsers(users.data.filter((usuario) => usuario.id !== user.id));
      } else {
        alert(users.error.message);
        return [];
      }
    };

    const getAllChannels = async () => {
      const channels = await getChannels();
      if (channels && !channels.error) {
        setAllChannels(channels.data);
      } else {
        alert(channels.error.message);
        return [];
      }
    };

    getUsers();
    getAllChannels();
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChannelNameChange = (event) => {
    const exists = allChannels.find(
      (channel) => channel.slug === event.target.value.trim(),
    );
    if (exists) {
      setErrorChannelName({
        error: true,
        message: "Ya existe un canal con ese nombre",
      });
    } else {
      setErrorChannelName({
        error: false,
        message: "",
      });
    }
    setChannelName(event.target.value.trim());
  };

  const handleCreateChannel = async () => {
    if (channelName === "") {
      setErrorChannelName({
        error: true,
        message: "El nombre del canal no puede estar vacío",
      });
      return;
    }
    if (errorChannelName.error) {
      return;
    }

    const result = await createChannel(channelName, user.id);
    console.log(result);
    if (result && !result.error) {
      console.log("se creo el canal");
      const channel = result.data[0];
      channelMembers.forEach(async (member) => {
        const usuario = allUsers.find(
          (usuario) => usuario.displayname === member,
        );
        const resultMembers = await createChannelMembers(
          usuario.id,
          user.id,
          channel.id,
        );

        if (resultMembers && !resultMembers.error) {
          console.log("se creo el miembro");
          handleClose();
        } else {
          alert(resultMembers.error.message);
        }
      });
    } else {
      alert(result.error.message);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        aria-labelledby="draggable-dialog-title"
        PaperComponent={PaperComponent}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Crear Canal
        </DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre del canal"
            type="text"
            fullWidth
            sx={{ mb: 2 }}
            value={channelName}
            onChange={handleChannelNameChange}
            error={errorChannelName.error}
            helperText={errorChannelName.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {errorChannelName.error ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <CheckCircleIcon color="success" />
                  )}
                </InputAdornment>
              ),
            }}
          />

          <Autocomplete
            fullWidth
            multiple
            value={channelMembers}
            id="combo-box-demo"
            options={allUsers.map((option) => option.displayname)}
            renderInput={(params) => <TextField {...params} label="Miembros" />}
            onChange={(event, value) => {
              console.log(value);
              setChannelMembers(value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
          <Button onClick={handleCreateChannel}>Crear canal</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
