import { useEffect, useState } from "react";
import { useWebSocket } from "../socket/WebSocketProvider";
import { WSResponse } from "../interface/ScokctConnection";
import { UserDTo } from "../interface/LetsTalkChats";


export function useUserFriendList() {
  const { socket, sendMessage } = useWebSocket();
  const [users, setUsers] = useState<UserDTo[]>([]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    sendMessage({ type: "get_all_users" });
    const onMessage = (event: MessageEvent) => {
      const response: WSResponse = JSON.parse(event.data);
      if (response.type === "all_users") {
        console.log(response);
        setUsers(response.payload);
      }
    };

    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket]);

  return users;
}
