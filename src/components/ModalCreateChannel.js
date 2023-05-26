import React, { useEffect } from "react";

import {
  getAllUsers,
  getChannels,
  createChannel,
  createChannelMembers,
} from "../supabase/queries";
import { Input, Modal, Select, Typography } from "antd";

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
        const usersExceptMe = users.data.filter(
          (usuario) => usuario.id !== user.id,
        );
        const usersExceptMeOptions = usersExceptMe.map((usuario) => {
          return { value: usuario.id, label: usuario.displayname };
        });
        setAllUsers(usersExceptMeOptions);
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
      (channel) =>
        channel.slug.toUpperCase() === event.target.value.toUpperCase().trim(),
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
          (usuario) => usuario.value === member.value,
        );
        const resultMembers = await createChannelMembers(
          usuario.value,
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
        onOk={handleCreateChannel}
        onCancel={handleClose}
        okText="Crear canal"
        cancelText="Cerrar"
      >
        <Typography.Title level={3}>Crear canal</Typography.Title>

        <Input
          autoFocus
          placeholder="Nombre del canal"
          type="text"
          style={{ marginBottom: 2 }}
          value={channelName}
          onChange={handleChannelNameChange}
          status={errorChannelName.error ? "error" : "success"}
        />
        <span
          style={{
            color: "red",
            display: errorChannelName.error ? "block" : "none",
          }}
        >
          {errorChannelName.message}
        </span>

        <Select
          mode="tags"
          style={{
            width: "100%",
          }}
          placeholder="Selecciona los miembros del canal"
          value={channelMembers}
          id="combo-box-demo"
          options={allUsers}
          onChange={(event, value) => {
            console.log(value);
            setChannelMembers(value);
          }}
        />
      </Modal>
    </div>
  );
};
