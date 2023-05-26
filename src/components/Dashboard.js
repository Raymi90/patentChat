import React, { useState, useEffect } from "react";
import { client } from "../supabase/supabaseClient";
import {
  getChannels,
  getAdmins,
  getAllUsers,
  getAllChannelMembers,
  createMessage,
} from "../supabase/queries";
//import { ModalCreateChannel } from "./ModalCreateChannel";
//import { ChannelMenu } from "./ChannelMenu";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Space,
  Typography,
  Tooltip,
  Input,
  Divider,
  Badge,
  Avatar,
  Row,
  Col,
} from "antd";
import { ModalCreateChannel } from "./ModalCreateChannel";
import { CgHashtag } from "react-icons/cg";
import { SlOptionsVertical, SlHome } from "react-icons/sl";
import { Home } from "./Home";
import { ChatMessages } from "./ChatMessages";
import EmojiPicker from "emoji-picker-react";
import { SendOutlined, PlusOutlined } from "@ant-design/icons";
import { GrEmoji } from "react-icons/gr";
import { UserMenu } from "./UserMenu";
import { ChannelMembers } from "./ChannelMembers";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const Dashboard = ({ user, mode, setMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(true);
  const [channels, setChannels] = useState([]);
  const [channelToMenu, setChannelToMenu] = useState({
    id: 0,
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usersOnline, setUsersOnline] = useState([]);
  const [openModalCreateChannel, setOpenModalCreateChannel] = useState(false);
  const [actualUser, setActualUser] = useState({
    id: "",
    displayname: "",
    profilePic: "",
  });
  const [modalOptionsVisible, setModalOptionsVisible] = useState(false);
  const [component, setComponent] = useState(<Home />);

  const [emojiPicker, setEmojiPicker] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [channelSelected, setChannelSelected] = useState(null);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  const getUsers = async () => {
    console.log(mode);
    const users = await getAllUsers();
    if (users && !users.error) {
      return users.data;
    } else {
      alert(users.error.message);
      return [];
    }
  };

  const getCanales = async () => {
    let canalArray = [];
    const canales = await getChannels();

    if (canales && !canales.error) {
      canales.data.forEach((canal) => {
        if (canal.created_by === user.id) {
          canalArray.push(canal);
        }
      });

      const memberChannels = await getAllChannelMembers();

      if (memberChannels && !memberChannels.error) {
        memberChannels.data.forEach((member) => {
          if (member.member_id === user.id) {
            canales.data.forEach((canal) => {
              if (canal.id === member.channel_id) {
                canalArray.push(canal);
              }
            });
          }
        });
      } else {
        alert(memberChannels.error.message);
      }
      canalArray = removeDuplicates(canalArray);
      setChannels(canalArray);
    } else {
      alert(canales.error.message);
    }
  };

  useEffect(() => {
    const defineUser = async () => {
      const userAux = await getUsers();
      console.log(userAux.find((usuario) => usuario.id === user.id));
      setActualUser(userAux.find((usuario) => usuario.id === user.id));
    };

    const getAdministadores = async () => {
      const admins = await getAdmins();

      if (admins && !admins.error) {
        admins.data.forEach((admin) => {
          if (admin.user_id === user.id) {
            setIsAdmin(true);
          }
        });
      } else {
        alert(admins.error.message);
      }
    };

    defineUser();
    getCanales();
    getAdministadores();

    const channel = client.channel(`users-online`, {
      config: {
        presence: {
          enabled: true,
        },
      },
    });

    channel.on("presence", { event: "sync" }, async () => {
      const state = channel.presenceState();
      console.log(state);
      //get the user_id from the presence tracker in the state
      const users = Object.keys(state)
        .map((presenceId) => {
          const presences = state[presenceId] || [];
          return presences.map((presence) => presence.user_id);
        })
        .flat();

      const allUsers = await getUsers();
      console.log(allUsers);
      /** sort and set the users */
      // update user in allUsers with online status witho change the length of the array
      const usersOnline = allUsers.map((user) => {
        if (users.includes(user.id)) {
          return { ...user, online: true };
        }
        return { ...user, online: false };
      });

      const usersOnlineexceptMe = usersOnline.filter(
        (usuario) => usuario.id !== user.id,
      );

      console.log(usersOnline);
      //sort desc from online true to false

      setUsersOnline(
        usersOnlineexceptMe.sort(
          (a, b) =>
            b.online - a.online || a.displayname?.localeCompare(b.displayname),
        ),
      );
      //remove duplicates users from usersOnline
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const presenceTrackStatus = await channel.track({
          user_id: user.id,
        });
        console.log(presenceTrackStatus);
      }
    });

    const channelCanales = client
      .channel("canales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        (payload) => {
          console.log("Change received!", payload);
          //add channel to the channels array
          if (payload.eventType === "INSERT") {
            if (payload.new.created_by === user.id)
              setChannels((channels) => [...channels, payload.new]);
          }
          if (payload.eventType === "DELETE") {
            setChannels((channels) =>
              channels.filter((channel) => channel.id !== payload.old.id),
            );
          }
          if (payload.eventType === "UPDATE") {
            setChannels((channels) =>
              channels.map((channel) =>
                channel.id === payload.new.id ? payload.new : channel,
              ),
            );
          }
        },
      )
      .subscribe();

    const channelMembers = client
      .channel("channelMembers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channel_members" },
        async (payload) => {
          console.log("Change received!", payload);
          //add channel to the channels array
          if (payload.eventType === "INSERT") {
            if (payload.new.member_id === user.id) await getCanales();
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      channelCanales.unsubscribe();
      channelMembers.unsubscribe();
    };
  }, [user]);

  const handleOpenModalOptions = () => {
    setModalOptionsVisible(true);
  };

  const items = [
    {
      key: "0",
      label: "Inicio",
      icon: <SlHome />,
      onClick: () => {
        setChannelSelected(null);
        setComponent(<Home />);
      },
    },
    {
      type: "group",
      label:
        isAdmin &&
        (collapsed ? (
          <div
            style={{
              display: "flex",
              direction: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tooltip title="Crear Canal">
              <Button
                onClick={() => setOpenModalCreateChannel(true)}
                icon={<PlusOutlined />}
              />
            </Tooltip>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              direction: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => setOpenModalCreateChannel(true)}
              icon={<PlusOutlined />}
            >
              Crear Canal
            </Button>
          </div>
        )),
    },
    {
      type: "group",
      label: "Canales",
    },
    {
      type: "divider",
    },

    ...channels.map((canal) => {
      return {
        key: canal.id,
        label: (
          <Space
            style={{
              display: "flex",
              direction: "row",
              alignItems: "center",
              listStyleType: "none",
              padding: 0,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                marginRight: "auto",
              }}
            >
              {canal.slug}
            </span>
          </Space>
        ),
        title: canal.slug,
        icon: <CgHashtag />,
        onClick: () => {
          setChannelSelected(canal);
          setComponent(<ChatMessages canal={canal} mode={mode} user={user} />);
        },
      };
    }),
    {
      type: "group",
      label: "Usuarios",
    },
    {
      type: "divider",
    },
    ...usersOnline.map((usuario) => {
      return {
        key: usuario.id,
        label: (
          <Space
            style={{
              display: "flex",
              direction: "row",
              alignItems: "center",
              listStyleType: "none",
              padding: 0,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                marginRight: "auto",
              }}
            >
              {usuario.displayname}
            </span>
            {usuario.online ? <Badge color="green" /> : <Badge color="red" />}
          </Space>
        ),
        title: usuario.displayname,
        icon: (
          <Avatar
            size="small"
            src="https://aldecoaelias.com/images/thumbs/04.jpeg"
          >
            {usuario.displayname ? usuario.displayname[0] : null}
          </Avatar>
        ),
        onClick: () => {
          setChannelSelected(usuario);
          setComponent(
            <ChatMessages canal={usuario} mode={mode} user={user} />,
          );
        },
      };
    }),
  ];

  const sendMessage = async () => {
    //auto scroll

    if (mensaje.length > 0) {
      const { data, error } = await createMessage(
        mensaje,
        channelSelected.id,
        user.id,
      );
      if (data) {
        console.log(data);
      }
      if (error) {
        console.log(error.message);
      }
      setMensaje("");
    }
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        theme={mode ? "dark" : "light"}
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 2,
        }}
      >
        <div className="demo-logo-vertical">
          <CgHashtag
            style={{
              fontSize: 60,
            }}
          />
        </div>
        <Menu
          defaultSelectedKeys={["0"]}
          theme={mode ? "dark" : "light"}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            direction: "row",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
          }}
        >
          <Tooltip
            title={collapsed ? "Expandir" : "Colapsar"}
            placement="right"
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
                marginLeft: collapsed ? 80 : 250,
              }}
            />
          </Tooltip>
          <Space
            direction="horizontal"
            style={{
              display: channelSelected ? "flex" : "none",
              direction: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                marginRight: "auto",
                padding: 0,
              }}
            >
              <CgHashtag /> {channelSelected && channelSelected.slug}
            </span>
            {channelSelected && channelSelected.created_by === user.id && (
              <Tooltip title="Opciones" placement="right">
                <Button
                  type="text"
                  style={{
                    marginTop: 5,
                  }}
                  shape="circle"
                  icon={
                    <SlOptionsVertical
                      style={{
                        color: mode ? "white" : "black",
                      }}
                    />
                  }
                  onClick={() => {
                    handleOpenModalOptions();
                  }}
                />
              </Tooltip>
            )}
          </Space>
          <div
            style={{
              display: "flex",
              direction: "row",
              justifyContent: "flex-end",
              marginRight: 10,
            }}
          >
            <UserMenu
              style={{
                marginRight: "auto",
              }}
              user={user}
            />
          </div>
        </Header>
        <Content
          style={{
            marginTop: "24px",
            marginLeft: collapsed ? 96 : 266,
            marginRight: 16,
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 10,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col
              span={18}
              style={{
                display: channelSelected ? "block" : "none",
                overflow: "auto",
              }}
            >
              <div style={{ height: "calc(99vh - 160px)" }}>{component}</div>

              <div
                style={{
                  position: "fixed",
                  bottom: 60,
                  display: channelSelected ? "block" : "none",
                }}
              >
                {emojiPicker}
              </div>

              <Space.Compact
                direction="horizontal"
                style={{
                  display: channelSelected ? "block" : "none",
                  position: "fixed",
                  left: collapsed ? 96 : 290,
                  bottom: 10,
                  maxWidth: "calc(75% - 250px)",
                  width: "calc(75% - 250px)",
                }}
              >
                <Tooltip title="Insertar Emote">
                  <Button
                    type="default"
                    icon={<GrEmoji />}
                    size="small"
                    style={{
                      color: mode ? "white" : "black",
                      padding: 0,
                      width: "5%",
                    }}
                    onClick={() =>
                      setEmojiPicker(
                        <EmojiPicker
                          theme="auto"
                          onEmojiClick={(emoji) => {
                            console.log(emoji);
                            setMensaje(
                              (mensaje) => mensaje + " " + emoji.emoji + " ",
                            );
                            setEmojiPicker(null);
                          }}
                        />,
                      )
                    }
                  />
                </Tooltip>
                <Input
                  enterKeyHint="send"
                  onPressEnter={sendMessage}
                  onFocus={() => setEmojiPicker(null)}
                  placeholder="Escribe tu mensaje aquí"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  style={{
                    width: "90%",
                  }}
                />
                <Tooltip title="Enviar mensaje">
                  <Button
                    type="default"
                    icon={<SendOutlined />}
                    size="small"
                    style={{
                      color: mode ? "white" : "black",
                      padding: 0,
                      width: "5%",
                    }}
                    onClick={sendMessage}
                  />
                </Tooltip>
              </Space.Compact>
            </Col>
            <Col
              span={6}
              style={{
                display: channelSelected ? "block" : "none",
                borderLeft: "1px solid #f0f0f0",
                position: "sticky",
                right: 0,
              }}
            >
              <ChannelMembers
                channelSelected={channelSelected}
                user={user}
                mode={mode}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
      <ModalCreateChannel
        user={user}
        open={openModalCreateChannel}
        setOpen={setOpenModalCreateChannel}
      />
    </Layout>
  );
};
