import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Logout, Settings } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { client } from "../supabase/supabaseClient";
import {
  getChannels,
  getAdmins,
  getAllUsers,
  getAllChannelMembers,
} from "../supabase/queries";
import TagIcon from "@mui/icons-material/Tag";
import { ModalCreateChannel } from "./ModalCreateChannel";
import { ChannelMenu } from "./ChannelMenu";
import { deepOrange } from "@mui/material/colors";
import {
  Avatar,
  Backdrop,
  CircularProgress,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
} from "@mui/material";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://patransip.com/">
        Patrans ip
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const ConnectedBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const DisconnectBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#ff0000",
    color: "#ff0000",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export const Dashboard = ({ user }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElChannel, setAnchorElChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [presenceChannel, setPresenceChannel] = useState(null);
  const [usersOnline, setUsersOnline] = useState([]);
  const [openModalCreateChannel, setOpenModalCreateChannel] = useState(false);
  const [actualUser, setActualUser] = useState({
    id: "",
    displayname: "",
    profilePic: "",
  });

  const toggleDrawer = () => {
    setOpen(!open);
  };

  function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  const getUsers = async () => {
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
    setLoadingChannels(true);
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
      setLoadingChannels(false);
      setChannels(canalArray);
    } else {
      setLoadingChannels(false);
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
      setLoadingChannels(true);
      const admins = await getAdmins();

      if (admins && !admins.error) {
        admins.data.forEach((admin) => {
          if (admin.user_id === user.id) {
            setIsAdmin(true);
          }
        });
        setLoadingChannels(false);
      } else {
        setLoadingChannels(false);
        alert(admins.error.message);
      }
    };

    defineUser();
    getCanales();
    getAdministadores();
  }, [user]);

  useEffect(() => {
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
            b.online - a.online || a.displayname.localeCompare(b.displayname),
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

    setPresenceChannel(channel);

    return () => {
      channel.unsubscribe();
      setPresenceChannel(undefined);
    };
  }, [user]);

  useEffect(() => {
    const channels = client
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
      channels.unsubscribe();
      channelMembers.unsubscribe();
    };
  }, []);

  const openMenu = Boolean(anchorEl);
  const openChannelMenu = Boolean(anchorElChannel);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickChannelMenu = (event) => {
    setAnchorElChannel(event.currentTarget);
  };

  const logOut = async () => {
    try {
      setLoading(true);
      const { error } = await client.auth.signOut();

      if (error) {
        console.log(error.message);
        setLoading(false);
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Dashboard
          </Typography>

          <Tooltip title={actualUser?.displayname}>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={openMenu ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {actualUser?.displayname[0]}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={openMenu}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleClose}>
              <Avatar /> {actualUser?.displayname}
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={logOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        {isAdmin && (
          <>
            <Divider />

            <List component="nav">
              <ListItemButton onClick={() => setOpenModalCreateChannel(true)}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Agregar Canal" />
              </ListItemButton>
            </List>
          </>
        )}
        <Divider sx={{ my: 1 }}>
          <ListItemText primary="Mis Canales" />
        </Divider>
        <List component="nav">
          {loadingChannels ? (
            <div
              style={{
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
            </div>
          ) : channels.length === 0 ? (
            <ListItemText
              sx={{
                textAlign: "center",
                fontSize: "0.2rem",
              }}
              secondary="No perteneces a ningún canal"
            />
          ) : (
            channels.map((canal) => (
              <ListItem
                secondaryAction={
                  <>
                    <Tooltip title="Opciones del Canal" placement="right">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        sx={{
                          "&:hover": {
                            backgroundColor: "red",
                            color: "white",
                          },
                        }}
                        onClick={handleClickChannelMenu}
                        aria-controls={
                          openChannelMenu ? "channel-menu" : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={openChannelMenu ? "true" : undefined}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
                key={canal.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "#ff5722",

                    color: "white",
                  },
                  cursor: "pointer",
                }}
              >
                <ChannelMenu
                  channel={canal}
                  anchorEl={anchorElChannel}
                  setAnchorEl={setAnchorElChannel}
                  openMenu={openChannelMenu}
                />
                <ListItemIcon>
                  <TagIcon />
                </ListItemIcon>
                <ListItemText
                  secondary={canal.slug}
                  sx={{
                    padding: 0,
                    wordBreak: "break-all",
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
        <Divider sx={{ my: 1 }}>
          <ListItemText primary="Usuarios" />
        </Divider>
        <List component="nav">
          {usersOnline.map((user) => (
            <Tooltip title={user.displayname}>
              <ListItemButton key={user.id}>
                {user.online ? (
                  <ConnectedBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>
                      {user.displayname.charAt(0).toUpperCase()}
                    </Avatar>
                  </ConnectedBadge>
                ) : (
                  <DisconnectBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>
                      {user.displayname.charAt(0).toUpperCase()}
                    </Avatar>
                  </DisconnectBadge>
                )}

                <ListItemText
                  primary={user.displayname}
                  sx={{
                    marginLeft: "0.5rem",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ModalCreateChannel
        open={openModalCreateChannel}
        setOpen={setOpenModalCreateChannel}
        user={user}
      />
    </Box>
  );
};
