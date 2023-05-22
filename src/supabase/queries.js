import { client } from "./supabaseClient";

const getChannels = async () => {
  const { data, error } = await client.from("channels").select();

  if (error) {
    return { error: true, message: error.message, data: null };
  }
  if (data) {
    return { error: false, data: data, message: "Channels found" };
  }
};

const createChannel = async (slug, created_by) => {
  const dataInsert = {
    slug: slug,
    created_by: created_by,
  };

  const { data, error } = await client
    .from("channels")
    .insert([dataInsert])
    .select();

  if (error) {
    console.log(error.message);
    return { error: true, data: null, message: error.message };
  }
  if (data) {
    return { error: false, data: data, message: "Channel created" };
  }

  return { error: true, data: null, message: "Error" };
};

const updateChannel = async (id, slug) => {
  const dataUpdate = {
    slug,
  };
  const { data, error } = await client
    .from("channels")
    .update(dataUpdate)
    .match({ id });

  if (error) {
    return { error: true, message: error.message };
  }
  if (data) {
    return { error: false, message: "Channel updated" };
  }
};

const deleteChannel = async (id) => {
  const { data, error } = await client.from("channels").delete().match({ id });

  if (error) {
    return { error: true, message: error.message };
  }
  if (data) {
    return { error: false, message: "Channel deleted" };
  }
};

const getAdmins = async () => {
  const { data, error } = await client.from("user_roles").select();

  if (error) {
    return { error: true, message: error.message, data: null };
  }
  if (data) {
    return { error: false, data: data, message: "Admins found" };
  }
};

const getAllUsers = async () => {
  const { data, error } = await client.from("users").select();

  if (error) {
    return { error: true, message: error.message, data: null };
  }
  if (data) {
    return { error: false, data: data, message: "Users found" };
  }
};

const updateUser = async (id, email, displayname, profilepic) => {
  const dataUpdate = {
    email,
    displayname,
    profilepic,
  };
  const { data, error } = await client
    .from("users")
    .update(dataUpdate)
    .match({ id });

  if (error) {
    return { error: true, message: error.message };
  }
  if (data) {
    return { error: false, message: "User updated" };
  }
};

const deleteUser = async (id) => {
  const { data, error } = await client.from("users").delete().match({ id });

  if (error) {
    return { error: true, message: error.message };
  }
  if (data) {
    //search id in user_roles
    const { data: dataRoles, error: errorRoles } = await client
      .from("user_roles")
      .select()
      .match({ user_id: id });

    if (errorRoles) {
      return { error: true, message: errorRoles.message };
    }
    if (dataRoles) {
      //delete user_roles
      const { data: dataDeleteRoles, error: errorDeleteRoles } = await client
        .from("user_roles")
        .delete()
        .match({ user_id: id });

      if (errorDeleteRoles) {
        return { error: true, message: errorDeleteRoles.message };
      }
      if (dataDeleteRoles) {
        return { error: false, message: "User deleted" };
      }
    }
  }
};

const createChannelMembers = async (member_id, invited_by, channel_id) => {
  const dataInsert = {
    member_id: member_id,
    invited_by: invited_by,
    channel_id: channel_id,
  };
  console.log(dataInsert);
  const { data, error } = await client
    .from("channel_members")
    .insert([dataInsert])
    .select();

  if (error) {
    console.log(error.message);
    return { error: true, data: null, message: error.message };
  }
  if (data) {
    return { error: false, data: data, message: "Channel member created" };
  }
};

const getAllChannelMembers = async () => {
  const { data, error } = await client.from("channel_members").select();

  if (error) {
    return { error: true, message: error.message, data: null };
  }

  if (data) {
    return { error: false, data: data, message: "Channel members found" };
  }
};

export {
  createChannel,
  getChannels,
  updateChannel,
  deleteChannel,
  getAdmins,
  getAllUsers,
  updateUser,
  deleteUser,
  createChannelMembers,
  getAllChannelMembers,
};
