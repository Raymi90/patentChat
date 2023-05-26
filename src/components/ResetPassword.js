import React, { useState } from "react";
import { client } from "../supabase/supabaseClient";
import { Modal, Typography, Input, message } from "antd";

const { Title, Text } = Typography;

export const ResetPassword = (props) => {
  const { open, setOpen } = props;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleOk = async () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    const { data, error } = await client.auth.updateUser({
      password: password,
    });
    if (error) {
      messageApi.error("No se pudo actualizar la contraseña");
    }
    if (data) {
      setConfirmLoading(false);
      messageApi.success("Se ha actualizado la contraseña");
      setOpen(false);
    }
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  return (
    <div>
      {contextHolder}
      <Modal
        title="Title"
        open={open}
        onOk={handleOk}
        okText="Restablecer contraseña"
        cancelText="Cancelar"
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Title level={3}>Restablecer contraseña</Title>
        <Text>La contraseña debe tener al menos 8 caracteres y un número.</Text>

        <Input.Password
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input.Password
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};
