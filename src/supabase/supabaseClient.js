import { createClient } from "@supabase/supabase-js";

export const client = createClient(
  process.env.REACT_APP_PROJECT_URL,
  process.env.REACT_APP_SECRET_KEY,
);

export const channel = client.channel("online-users");

export const leaveUser = async () => {
  const subscription = channel
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log(key, leftPresences);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const joinUser = async () => {
  const channel = await client.channel("online-users");
  const subscription = channel
    .on("presence", { event: "join" }, ({ key, joinedPresences }) => {
      console.log(key, joinedPresences);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
