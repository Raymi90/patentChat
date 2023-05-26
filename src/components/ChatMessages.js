import React, { useEffect, useState, useRef } from "react";
import { Avatar, Button, Popconfirm, Tooltip, Space } from "antd";
import { client } from "../supabase/supabaseClient";
import {
  getMessages,
  editMessage,
  deleteMessage,
  getAllUsers,
} from "../supabase/queries";
import { Col, Row } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

export const ChatMessages = ({ canal, user }) => {
  const messagesEndRef = useRef(null);

  const [mensajes, setMensajes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const getMensajes = async () => {
      const { data, error } = await getMessages(canal.id);
      if (data) {
        const messageChannel = data.filter(
          (message) => message.channel_id === canal.id,
        );
        setMensajes(messageChannel);
      } else {
        console.log(error.message);
      }
    };
    const getUsers = async () => {
      const { data, error } = await getAllUsers();
      if (data) {
        setAllUsers(data);
      } else {
        console.log(error.message);
      }
    };
    getUsers();
    getMensajes();

    const new_messages = client
      .channel("new-message")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log(payload.new);
          if (payload.new.channel_id === canal.id)
            setMensajes((mensajes) => [...mensajes, payload.new]);
        },
      )
      .subscribe();

    const delete_messages = client
      .channel("delete-message")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          console.log(payload.new);
          setMensajes((mensajes) =>
            mensajes.filter((m) => m.id !== payload.old.id),
          );
        },
      )
      .subscribe();

    return () => {
      new_messages.unsubscribe();
      delete_messages.unsubscribe();
    };
  }, [canal]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adaptInserted_time = (date) => {
    const dateObject = new Date(date);
    const dateNow = new Date();
    const dateNowDay = dateNow.getDate();
    const dateNowMonth = dateNow.getMonth();
    const dateNowYear = dateNow.getFullYear();
    const dateObjectDay = dateObject.getDate();
    const dateObjectMonth = dateObject.getMonth();
    const dateObjectYear = dateObject.getFullYear();
    const dateObjectHour = dateObject.getHours();
    const dateObjectMinutes = dateObject.getMinutes();
    const dateObjectSeconds = dateObject.getSeconds();
    const dateNowHour = dateNow.getHours();
    const dateNowMinutes = dateNow.getMinutes();
    const dateNowSeconds = dateNow.getSeconds();
    if (
      dateNowYear === dateObjectYear &&
      dateNowMonth === dateObjectMonth &&
      dateNowDay === dateObjectDay
    ) {
      if (
        dateNowHour === dateObjectHour &&
        dateNowMinutes === dateObjectMinutes &&
        dateNowSeconds === dateObjectSeconds
      ) {
        return "Ahora";
      } else if (
        dateNowHour === dateObjectHour &&
        dateNowMinutes === dateObjectMinutes
      ) {
        return `${dateNowSeconds - dateObjectSeconds} segundos atrás`;
      } else if (dateNowHour === dateObjectHour) {
        return `${dateNowMinutes - dateObjectMinutes} minutos atrás`;
      } else {
        return `${dateNowHour - dateObjectHour} horas atrás`;
      }
    }
    return `${dateObjectDay}/${dateObjectMonth}/${dateObjectYear}`;
  };

  return (
    <React.Fragment>
      <div style={{ height: "100vh" }}>
        {mensajes.map((mensaje) => {
          const userInfo = allUsers.find((user) => user.id === mensaje.user_id);
          if (userInfo) {
            return user.id !== mensaje.user_id ? (
              <Row
                ref={messagesEndRef}
                justify="start"
                key={mensaje.id}
                style={{
                  margin: "10px",
                }}
              >
                <Col span={9}>
                  <Space
                    direction="horizontal"
                    size="small"
                    style={{
                      margin: 10,
                    }}
                  >
                    <Avatar
                      src="https://aldecoaelias.com/images/thumbs/04.jpeg"
                      style={{
                        marginBottom: 20,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        margin: 0,
                      }}
                    >
                      <Space
                        direction="horizontal"
                        size="small"
                        style={{
                          marginBottom: 5,
                          marginLeft: 0,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: 10,
                          }}
                        >
                          {userInfo.displayname}
                        </span>
                        <span style={{ fontSize: 8 }}>
                          {adaptInserted_time(mensaje.inserted_at)}
                        </span>
                      </Space>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          padding: 9,
                          backgroundColor: "#4a517a",
                          wordBreak: "break-all",
                          borderRadius: 5,
                          width: "100%",
                          maxWidth: 500,
                          boxShadow: "0 3px 10px rgb(0 0 0 / 0.5)",
                          color: "white",
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{mensaje.message}</span>
                      </div>
                    </div>
                  </Space>
                </Col>
              </Row>
            ) : (
              <Row
                ref={messagesEndRef}
                justify="end"
                key={mensaje.id}
                style={{
                  margin: "10px",
                }}
              >
                <Col span={9}>
                  <Space
                    direction="horizontal"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      margin: 10,
                    }}
                  >
                    <Avatar
                      src="https://aldecoaelias.com/images/thumbs/04.jpeg"
                      style={{
                        marginBottom: 20,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        margin: 0,
                      }}
                    >
                      <Space
                        direction="horizontal"
                        size="small"
                        style={{
                          marginBottom: 5,
                          marginLeft: 5,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: 10,
                          }}
                        >
                          {userInfo.displayname}
                        </span>
                        <span style={{ fontSize: 8 }}>
                          {adaptInserted_time(mensaje.inserted_at)}
                        </span>
                      </Space>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          padding: 9,
                          backgroundColor: "#3b4161",
                          wordBreak: "break-all",
                          borderRadius: 5,
                          width: "100%",
                          maxWidth: 500,
                          boxShadow: "0 3px 10px rgb(0 0 0 / 0.5)",
                          color: "white",
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{mensaje.message}</span>
                      </div>
                    </div>
                  </Space>
                </Col>
              </Row>
            );
          } else {
            return null;
          }
        })}
      </div>
    </React.Fragment>
  );
};
