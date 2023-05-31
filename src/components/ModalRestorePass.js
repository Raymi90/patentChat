import React from "react";
import { Modal, message, Button, Space, Input } from "antd";

import { client } from "../supabase/supabaseClient";

export const ModalRestorePass = (props) => {
  const { open, setOpen } = props;

  const [messageApi, contextHolder] = message.useMessage();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const restorePass = async () => {
    console.log("restore pass");
    setLoading(true);
    const { data, error } = await client.auth.resetPasswordForEmail(email);
    if (error) {
      messageApi.error(
        "No se pudo enviar el correo de recuperación de contraseña"
      );
      setLoading(false);
    }
    if (data) {
      messageApi.success(
        "Se ha enviado un correo para restaurar tu contraseña"
      );
      setLoading(false);
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
      confirmLoading={loading}
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
