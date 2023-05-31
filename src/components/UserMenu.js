import React, { useEffect, useState } from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Tooltip, message } from "antd";
import { client } from "../supabase/supabaseClient";
import { UserProfileConfig } from "./UserProfileConfig";

export const UserMenu = ({ user, style }) => {
  const [usuario, setUsuario] = useState({
    displayname: "",
    profilePic: "",
  });
  const [openModalConfig, setOpenModalConfig] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const getAllUsers = async () => {
      const { data, error } = await client
        .from("users")
        .select("*")
        .order("id", { ascending: true });
      if (data) {
        setUsuario(data.find((data) => data.id === user.id));
      } else {
        console.log(error.message);
      }
    };
    getAllUsers();
  }, [user]);

  useEffect(() => {
    const users = client
      .channel("update-user")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload) => {
          console.log("Change received!", payload);
          setUsuario({
            ...usuario,
            profilePic: payload.new.profilePic,
            displayname: payload.new.displayname,
          });
        }
      )
      .subscribe();

    return () => {
      users.unsubscribe();
    };
  }, [usuario.profilePic]);

  const logOut = async () => {
    try {
      const { error } = await client.auth.signOut();

      if (error) {
        console.log(error.message);
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === "1") {
      logOut();
    }
  };

  const handleConfigProfile = () => {
    messageApi.loading("Cargando...", 1);
    setTimeout(() => {
      setOpenModalConfig(true);
    }, 1000);
  };

  const items = [
    {
      label: "Cerrar sesión",
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: "2nd menu item",
      key: "2",
      icon: <UserOutlined />,
    },
    {
      label: "3rd menu item",
      key: "3",
      icon: <UserOutlined />,
      danger: true,
    },
  ];
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <React.Fragment>
      {contextHolder}
      <Dropdown.Button
        size="large"
        style={style}
        menu={menuProps}
        placement="bottom"
        icon={
          <Avatar
            src={usuario && usuario.profilePic}
            size={38}
            style={{
              marginTop: "-5px",
            }}
          >
            {usuario.displayname !== "" &&
              usuario.displayname !== null &&
              usuario.displayname[0]}
          </Avatar>
        }
        onClick={handleConfigProfile}
      >
        {usuario.displayname !== "" && usuario.displayname}
      </Dropdown.Button>
      <UserProfileConfig
        user={usuario}
        open={openModalConfig}
        setOpen={setOpenModalConfig}
      />
    </React.Fragment>
  );
};
