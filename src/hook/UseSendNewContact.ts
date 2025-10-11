import { useEffect, useState } from "react";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useWebSocket } from "../socket/WebSocketProvider";
import { UserDTo } from "../interface/LetsTalkChats";
import { WSResponse } from "../interface/ScokctConnection";

interface ContactResponse {
    responseStatus: boolean;
    message: string;
}

export function useSendNewContact() {
    const { socket, sendMessage } = useWebSocket();
    const [responseText, setResponseText] = useState<ContactResponse | null>(null);

    const sendNewContact = (user: Partial<UserDTo>) => {
        sendMessage({
            type: "save_new_contact",
            user
        });
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        const onMessage = (event: MessageEvent) => {
            const response: WSResponse = JSON.parse(event.data);
            if (response.type === "new_contact_response_text") {
                const payload = response.payload as ContactResponse;
                setResponseText(payload);

                if (payload.responseStatus) {
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: "Success",
                        textBody: payload.message,
                        autoClose: 2000,
                        textBodyStyle: { fontSize: 15 }
                    });
                } else {
                    Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: "Warning",
                        textBody: payload.message,
                        autoClose: 3000,
                        textBodyStyle: { fontSize: 15 }
                    });
                }
            }
        };

        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        };
    }, [socket]);

    const sendNewContactWithReset = (user: Partial<UserDTo>) => {
        setResponseText(null);
        sendNewContact(user);
    };

    return { 
        sendNewContact: sendNewContactWithReset, 
        responseText: responseText,
        isSuccess: responseText?.responseStatus ?? null
    };
}