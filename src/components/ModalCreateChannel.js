import React, { useEffect, useState, useRef } from "react";

import {
  getAllUsers,
  getChannels,
  createChannel,
  createChannelMembers,
} from "../supabase/queries";
import { client } from "../supabase/supabaseClient";
import { Input, Modal, Select, Typography, Tag, theme, message } from "antd";
import { blue } from "@ant-design/colors";

export const ModalCreateChannel = ({ user, open, setOpen }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [allUsers, setAllUsers] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [channelMembers, setChannelMembers] = useState([]);
  const [errorChannelName, setErrorChannelName] = useState({
    error: false,
    message: "",
  });
  const [tags, setTags] = useState([]);
  const [emailToInvite, setEmailToInvite] = useState("");

  useEffect(() => {
    const getUsers = async () => {
      const users = await getAllUsers();
      if (users && !users.error) {
        const usersExceptMe = users.data.filter(
          (usuario) => usuario.id !== user.id
        );
        const usersExceptMeOptions = usersExceptMe.map((usuario) => {
          return { value: usuario.id, label: usuario.displayname };
        });
        setAllUsers(usersExceptMeOptions);
      } else {
        messageApi.error(users.error.message);
        return [];
      }
    };

    const getAllChannels = async () => {
      const channels = await getChannels();
      if (channels && !channels.error) {
        setAllChannels(channels.data);
      } else {
        messageApi.error(channels.error.message);
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
        channel.slug.toUpperCase() === event.target.value.toUpperCase().trim()
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
      if (channelMembers.length !== 0) {
        channelMembers.forEach(async (member) => {
          const usuario = allUsers.find(
            (usuario) => usuario.value === member.value
          );
          const resultMembers = await createChannelMembers(
            usuario.value,
            user.id,
            channel.id
          );

          if (resultMembers && !resultMembers.error) {
            console.log("se creo el miembro");
            handleClose();
          } else {
            messageApi.error(resultMembers.error.message);
          }
        });
      } else {
        if (tags.length !== 0) {
          tags.map(async (email) => {
            const { data, error } = await client.auth.admin.inviteUserByEmail(
              email
            );

            if (error) {
              messageApi.error(error.message);
              return;
            } else {
              messageApi.success("Se ha enviado una invitación a " + email);
            }
          });
        }
      }
      setOpen(false);
      setChannelMembers([]);
      setChannelName("");
      setTags([]);
    } else {
      messageApi.error(result.error.message);
    }
  };

  return (
    <div>
      {contextHolder}
      <Modal
        open={open}
        onClose={handleClose}
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
          style={{ marginBottom: 10 }}
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
        <Input
          autoFocus
          placeholder="Invitar a traductores por email"
          type="email"
          style={{ marginBottom: 10, marginTop: 10 }}
          value={emailToInvite}
          onChange={(e) => setEmailToInvite(e.target.value)}
          onPressEnter={(e) => {
            if (e.target.value) {
              setTags([...tags, e.target.value]);
              setEmailToInvite("");
            }
          }}
          suffix={
            <Typography.Text
              style={{
                color: blue.primary,
                cursor: "pointer",
              }}
              onClick={() => {
                if (emailToInvite) {
                  setTags([...tags, emailToInvite]);
                  setEmailToInvite("");
                }
              }}
            >
              Agregar
            </Typography.Text>
          }
        />

        {tags.map((tag, i) => {
          return (
            <Tag
              key={i}
              style={{
                marginBottom: 5,
              }}
              closable
              onClose={(e) => {
                e.preventDefault();
                const newTags = tags.filter((t) => t !== tag);
                setTags(newTags);
              }}
            >
              {tag}
            </Tag>
          );
        })}
      </Modal>
    </div>
  );
};
