import React from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space, Tooltip, message } from "antd";
import { client } from "../supabase/supabaseClient";
export const UserMenu = ({ user, style }) => {
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
    <Dropdown.Button
      style={style}
      menu={menuProps}
      placement="bottom"
      icon={<UserOutlined />}
    >
      {user.displayname}
    </Dropdown.Button>
  );
};
