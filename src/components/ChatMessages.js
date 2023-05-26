import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Divider, Input, Popconfirm, Space, Tooltip } from "antd";
import { client } from "../supabase/supabaseClient";
import {
  getMessages,
  createMessage,
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
  const [userData, setUserData] = useState(null);
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
        data.forEach((element) => {
          if (element.id === user.id) setUserData(element);
        });
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
      {mensajes.map((mensaje) => {
        const userInfo = allUsers.find((user) => user.id === mensaje.user_id);
        if (userInfo) {
          return user.id !== mensaje.user_id ? (
            <Row
              ref={messagesEndRef}
              justify="start"
              key={mensaje.id}
              style={{
                margin: "0px 5px 30px 0px",
              }}
            >
              <Col
                span={9}
                style={{
                  backgroundColor: "#f0f0f0",
                  wordBreak: "break-all",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <img
                      alt="avatar"
                      src="https://aldecoaelias.com/images/thumbs/04.jpeg"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        marginRight: 5,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: "bold",
                        marginRight: 5,
                      }}
                    >
                      {userInfo.displayname ? userInfo.displayname : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "gray",
                      }}
                    >
                      {adaptInserted_time(mensaje.inserted_at)}
                    </span>
                  </div>
                  <span>{mensaje.message}</span>
                </div>
              </Col>
            </Row>
          ) : (
            <Row
              ref={messagesEndRef}
              justify="end"
              key={mensaje.id}
              style={{
                margin: "0px 5px 30px 0px",
              }}
            >
              <Col
                span={9}
                style={{
                  backgroundColor: "#9aabff",
                  wordBreak: "break-all",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      margin: 0,
                      padding: 0,

                      width: "100%",
                    }}
                  >
                    <img
                      alt="avatar"
                      src="https://aldecoaelias.com/images/thumbs/04.jpeg"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        marginRight: 5,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: "bold",
                        marginRight: 5,
                      }}
                    >
                      {userInfo.displayname ? userInfo.displayname : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#1f292d",
                      }}
                    >
                      {adaptInserted_time(mensaje.inserted_at)}
                    </span>
                    <Popconfirm
                      title="¿Estás seguro de eliminar este mensaje?"
                      onConfirm={async () => await deleteMessage(mensaje.id)}
                      okText="Si"
                      cancelText="No"
                      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    >
                      <Tooltip title="Eliminar mensaje">
                        <Button
                          style={{
                            marginLeft: "auto",
                            textDecoration: "none",
                          }}
                          type="link"
                          icon={
                            <DeleteOutlined
                              style={{
                                color: "red",
                              }}
                            />
                          }
                        />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                  <span>{mensaje.message}</span>
                </div>
              </Col>
            </Row>
          );
        } else {
          return null;
        }
      })}
    </React.Fragment>
  );
};
