import {
  Avatar,
  Button,
  Image,
  Input,
  Modal,
  Tooltip,
  Upload,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { client } from "../supabase/supabaseClient";

export const UserProfileConfig = (props) => {
  const { user, open, setOpen } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [changePassword, setChangePassword] = useState(false);

  const [usuario, setUsuario] = useState({
    displayname: "",
    profilePic: "",
  });

  useEffect(() => {
    console.log(user);
    const getUser = async () => {
      const { data, error } = await client.auth.admin.getUserById(user.id);
      if (data) {
        console.log(data);
      }
      if (error) {
        console.log(error.message);
      }
    };

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
    getUser();
    getAllUsers();
  }, [open]);

  useEffect(() => {
    if (user) {
      setImageUrl(user.profilePic);
    }

    const users = client
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload) => {
          console.log("Change received!", payload);
          setImageUrl(payload.new.profilePic);
        }
      )
      .subscribe();

    return () => {
      users.unsubscribe();
    };
  }, []);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = async (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      setImageUrl(null);
      return;
    }
    if (info.file.status === "done") {
      console.log(info.file);

      // Get this url from response in real world.
    }
  };
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        {loading ? "Actualizando foto" : "Subir foto"}
      </div>
    </div>
  );

  const handleUpdateProfile = async () => {
    const { error } = await client
      .from("users")
      .update({ displayname: usuario.displayname, profilePic: imageUrl })
      .eq("id", user.id);
    if (error) {
      messageApi.error(error.message);
    } else {
      messageApi.success("Perfil actualizado");
      setOpen(false);
    }

    if (changePassword) {
      if (contraseña === confirmarContraseña) {
        const { data, error } = await client.auth.admin.updateUserById(
          user.id,
          {
            password: contraseña,
          }
        );
        if (error) {
          messageApi.error(error.message);
        }
        if (data) {
          messageApi.success("Contraseña actualizada");
          setContraseña("");
          setConfirmarContraseña("");
          setChangePassword(false);
          setOpen(false);
        }
      } else {
        messageApi.error("Las contraseñas no coinciden");
      }
    }
  };

  return (
    <Modal
      title={"Configuración de perfil de " + user.displayname}
      open={open}
      onOk={handleUpdateProfile}
      okText="Guardar"
      cancelText="Cerrrar"
      onCancel={() => setOpen(false)}
    >
      {contextHolder}

      <Upload
        accept="image/*"
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={async ({ file }) => {
          const { data: dataList, error: errorList } = await client.storage
            .from("Profile-Pictures")
            .list(user.id, {
              limit: 100,
              offset: 0,
              sortBy: { column: "name", order: "asc" },
            });

          if (errorList) {
            messageApi.error(errorList.message);
            return;
          } else {
            console.log(dataList);
            if (dataList.length > 0) {
              const { error: errorDelete } = await client.storage
                .from("Profile-Pictures")
                .remove([`${user.id}/${dataList[0].name}`]);
              if (errorDelete) {
                messageApi.error(errorDelete.message);
                return;
              } else {
                console.log("Deleted");
              }
            }
          }

          const { data, error } = await client.storage
            .from("Profile-Pictures")
            .upload(`${user.id}/${file.name}`, file, {
              cacheControl: "1",
              upsert: false,
            });
          if (error) {
            messageApi.error(error.message);
            return;
          } else {
            console.log(data);
            const { data: publicObject, error: publicUrlError } =
              await client.storage
                .from("Profile-Pictures")
                .getPublicUrl(`${user.id}/${file.name}`);

            if (publicUrlError) {
              messageApi.error(publicUrlError.message);
              return;
            }
            if (publicObject) {
              setImageUrl(publicObject.publicUrl);
              setLoading(false);
            }
          }
        }}
      >
        {imageUrl ? (
          <Tooltip title="Cambiar foto de perfil" placement="left">
            <Avatar
              src={imageUrl}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Tooltip>
        ) : (
          uploadButton
        )}
      </Upload>

      <Input
        placeholder="Nombre"
        value={usuario?.displayname}
        onChange={(e) => {
          const { value } = e.target;
          setUsuario({ ...usuario, displayname: value });
        }}
      />

      <Input
        placeholder="Correo electrónico"
        value={usuario?.username}
        disabled
        style={{ marginTop: 10 }}
      />

      <Button
        type="link"
        onClick={() => {
          setChangePassword(!changePassword);
        }}
      >
        Cambiar contraseña
      </Button>
      <Input.Password
        placeholder="Contraseña"
        type="password"
        disabled={!changePassword}
        value={user?.password}
        style={{ marginTop: 10 }}
        onChange={(e) => setContraseña(e.target.value)}
      />
      {changePassword ? (
        <Input.Password
          placeholder="Confirmar contraseña"
          type="password"
          value={confirmarContraseña}
          style={{ marginTop: 10 }}
          onChange={(e) => setConfirmarContraseña(e.target.value)}
        />
      ) : null}
    </Modal>
  );
};
