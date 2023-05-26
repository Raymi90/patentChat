import React from "react";
import { Modal, message, Button, Space, Input } from "antd";

import { client } from "../supabase/supabaseClient";

export const ModalRestorePass = (props) => {
  const { open, setOpen, email, setEmail } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const handleClose = () => {
    setOpen(false);
  };

  const restorePass = async () => {
    console.log("restore pass");

    const { data, error } = await client.auth.resetPasswordForEmail(email);
    if (error) {
      messageApi.error(
        "No se pudo enviar el correo de recuperación de contraseña",
      );
    }
    if (data) {
      messageApi.success(
        "Se ha enviado un correo para restaurar tu contraseña",
      );
      setOpen(false);
    }
  };

  return (
    <Modal
      title="Restaurar contraseña"
      open={open}
      onCancel={handleClose}
      onOk={restorePass}
      okText="Restaurar contraseña"
      cancelText="Cancelar"
    >
      {contextHolder}
      <p>
        Se enviará un correo electrónico a {email} para restaurar la contraseña.
      </p>
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </Modal>
  );
};
