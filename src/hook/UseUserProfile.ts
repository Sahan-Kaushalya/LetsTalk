import { useEffect, useState } from "react";
import { useWebSocket } from "../socket/WebSocketProvider";
import { UserDTo } from "../interface/LetsTalkChats";
import { WSResponse } from "../interface/ScokctConnection";


export function useUserProfile() {
  const { socket, sendMessage } = useWebSocket();
  const [userProfile, setUserProfile] = useState<UserDTo>();

  useEffect(() => {
    if (!socket) {
      return;
    }
    sendMessage({ type: "set_user_profile" });
    const onMessage = (event: MessageEvent) => {
      const response: WSResponse = JSON.parse(event.data);
      if (response.type === "user_profile") {
        console.log(response.payload);
        setUserProfile(response.payload);
      }
    };
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket]);

  return userProfile;
}
