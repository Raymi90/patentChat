import { Image, Modal, Tooltip, Upload, message } from "antd";
import React, { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { client } from "../supabase/supabaseClient";

export const UserProfileConfig = (props) => {
  const { user, open, setOpen } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

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
  }, [user]);

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

  return (
    <Modal
      title={"Configuración de perfil de " + user.displayname}
      open={open}
      onOk={() => setOpen(false)}
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
              const { error: errorUpdate } = await client
                .from("users")
                .update({ profilePic: publicObject.publicUrl })
                .eq("id", user.id);
              if (errorUpdate) {
                messageApi.error(errorUpdate.message);
                return;
              } else {
                messageApi.success("Foto de perfil actualizada");
                setImageUrl(publicObject.publicUrl);
                setLoading(false);
              }
            }
          }
        }}
      >
        {imageUrl ? (
          <Tooltip title="Cambiar foto de perfil" placement="left">
            <Image
              preview={false}
              src={imageUrl}
              alt="avatar"
              style={{
                width: "100%",
                borderRadius: "50%",
              }}
            />
          </Tooltip>
        ) : (
          uploadButton
        )}
      </Upload>
    </Modal>
  );
};
