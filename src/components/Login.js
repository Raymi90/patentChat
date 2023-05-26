import React, { useState, useEffect } from "react";

import { client } from "../supabase/supabaseClient";
import { ModalRestorePass } from "./ModalRestorePass";

import { Button, Checkbox, Form, Input, Layout } from "antd";

const { Header, Footer, Sider, Content } = Layout;
// TODO remove, this demo shouldn't need to reset the theme.

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openModalRecover, setOpenModalRecover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [type, setType] = React.useState("success");
  const [message, setMessage] = React.useState("");

  const onFinish = async (values) => {
    console.log("Success:", values);
    setLoading(true);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (data) {
      setLoading(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Layout>
      <Content>
        <Form
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Por favor introduzca su email!",
              },
            ]}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Checkbox>Recuerdame</Checkbox>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="link" onClick={() => setOpenModalRecover(true)}>
              Recuperar contraseña
            </Button>
            <ModalRestorePass
              open={openModalRecover}
              setOpen={setOpenModalRecover}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};
