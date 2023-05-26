import React, { useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Settings, Delete } from "@mui/icons-material";
import { Popper, Paper, Typography } from "@mui/material";

export const ChannelMenu = ({ anchorEl, setAnchorEl, channel, openMenu }) => {
  const [arrowRef, setArrowRef] = useState(null);
  const [anchorElPopper, setAnchorElPopper] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const OnClickDelete = (e) => {
    e.preventDefault();
    setAnchorElPopper(anchorElPopper ? null : e.currentTarget);
  };

  const openPopper = Boolean(anchorElPopper);
  const id = openPopper ? "simple-popper" : undefined;

  console.log(channel);

  const handleArrowRef = (node) => {
    setArrowRef(node);
  };

  const classes = {
    arrow: {
      position: "absolute",
      fontSize: 7,
      width: "3em",
      height: "3em",
      "&::before": {
        content: '""',
        margin: "auto",
        display: "block",
        width: 0,
        height: 0,
        borderStyle: "solid",
      },
    },
  };

  const handleClosePopper = () => {
    setAnchorElPopper(null);
  };

  return (
    <React.Fragment>
      <Menu
        anchorEl={anchorEl}
        id="channel-menu"
        open={openMenu}
        onClose={!anchorElPopper && handleClose}
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
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText secondary="Opciones" />
        </MenuItem>
        <MenuItem aria-describedby={id} onClick={OnClickDelete}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText secondary="Eliminar" />
        </MenuItem>
      </Menu>
      <Popper
        sx={{
          zIndex: 1000000,
        }}
        open={openPopper}
        id={id}
        anchorEl={anchorElPopper}
        placement="bottom-start"
        disablePortal={false}
        modifiers={[
          {
            name: "flip",
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "arrow",
            enabled: true,
            options: {
              element: arrowRef,
            },
          },
        ]}
      >
        <Paper sx={{ p: 1 }}>
          <span className={classes.arrow} ref={handleArrowRef} />
          <Typography sx={{ p: 1 }}>
            ¿Estás seguro que deseas eliminar el canal{" "}
            <strong>{channel.name}</strong>?
          </Typography>
          <Button
            size="small"
            variant="filled"
            onClick={handleClosePopper}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <Button size="small" variant="filled">
            Eliminar
          </Button>
        </Paper>
      </Popper>
    </React.Fragment>
  );
};
