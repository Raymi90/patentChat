import React, { useState } from "react";
import { client } from "../supabase/supabaseClient";
import { Modal, Typography, Input, message, Space } from "antd";

const { Title, Text } = Typography;

export const ResetPassword = (props) => {
  const { open, setOpen, user } = props;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleOk = async () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    const { data, error } = await client.auth.admin.updateUserById(user.id, {
      password: password,
    });
    if (error) {
      messageApi.error("No se pudo actualizar la contraseña");
      console.log(error.message);
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
        <Space
          direction="vertical"
          style={{
            width: "100%",
          }}
        >
          <Title level={3}>Restablecer contraseña</Title>
          <Text>
            La contraseña debe tener al menos 8 caracteres y un número.
          </Text>

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
        </Space>
      </Modal>
    </div>
  );
};
