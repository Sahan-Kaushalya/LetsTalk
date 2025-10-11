import { useEffect, useState } from "react";
import { useWebSocket } from "../socket/WebSocketProvider";
import { SingleChat, UserDetails, UserDTo } from "../interface/LetsTalkChats";
import { WSResponse } from "../interface/ScokctConnection";

export function useSingleChat(friendId: number) {
    const { socket, sendMessage } = useWebSocket();
    const [messages, setMessages] = useState<SingleChat[]>([]);
    const [friend, setFriend] = useState<UserDTo | undefined>();

    useEffect(() => {
        if (!socket) return;

        sendMessage({ type: "get_single_chat", friendId });
        sendMessage({ type: "get_friend_data", friendId });

        const onMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                const response: WSResponse = data;
                
                if (response.type === "single_chat") {
                    setMessages(response.payload || []);
                }

                if (response.type === "friend_data") {
                    setFriend(response.payload);
                }

                if (response.type === "new_message") {
                    const newMsg: SingleChat = response.payload;

                    const isFromFriend = newMsg.sender?.id === friendId;
                    const isToFriend = newMsg.receiver?.id === friendId;
                    
                    if (isFromFriend || isToFriend) {
                        console.log("New message received:", newMsg);
                        setMessages((prev) => [...prev, newMsg]);
                    }
                }

                if (response.type === "message_status_update") {
                    const chatId = data.chatId;
                    const status = data.status;
                    
                    if (chatId && status) {
                        setMessages((prev) => 
                            prev.map((msg) => 
                                msg.id === chatId 
                                    ? { ...msg, messageStatus: status }
                                    : msg
                            )
                        );
                    }
                }

                if (response.type === "message_created") {
                    console.log("Message created on server:", data.chatId);
                }

            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        };

    }, [socket, friendId, sendMessage]);

    return { messages, friend };
}