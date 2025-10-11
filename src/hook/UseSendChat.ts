import { useWebSocket } from "../socket/WebSocketProvider";

export interface SendMessageOptions {
    toUserId: number;
    message?: string;
    messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE';
    file?: {
        uri: string;
        name?: string;
        type?: string;
    };
}

export function useSendChat() {
    const { sendMessage, socket } = useWebSocket();

    const sendChat = async (options: SendMessageOptions): Promise<void> => {
        const { toUserId, message = '', messageType = 'TEXT', file } = options;

        if (messageType === 'TEXT' && !file) {
            sendMessage({
                type: "send_message",
                toUserId,
                message: message,
                messageType: 'TEXT',
            });
            return;
        }

        if (file && messageType !== 'TEXT') {
            return new Promise((resolve, reject) => {
                let messageHandlerAdded = false;

                sendMessage({
                    type: "send_message",
                    toUserId,
                    message: message,
                    messageType: messageType,
                });

                const messageHandler = async (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data);

                        if (response.type === 'message_created' && response.chatId) {
                            const chatId = response.chatId;

                            socket?.removeEventListener('message', messageHandler);

                            try {
                                await uploadFile(file, chatId, messageType);
                                resolve();
                            } catch (uploadError) {
                                reject(uploadError);
                            }
                        }
                    } catch (error) {
                        console.error('Error handling message:', error);
                    }
                };

                if (socket) {
                    socket.addEventListener('message', messageHandler);
                    messageHandlerAdded = true;
                }

                setTimeout(() => {
                    if (messageHandlerAdded && socket) {
                        socket.removeEventListener('message', messageHandler);
                    }
                    reject(new Error('Upload timeout - server did not respond'));
                }, 10000);
            });
        }
    };

    const uploadFile = async (
        file: { uri: string; name?: string; type?: string },
        chatId: number,
        messageType: string
    ): Promise<any> => {
        const API = process.env.EXPO_PUBLIC_APP_URL;

        const formData = new FormData();

        formData.append('file', {
            uri: file.uri,
            name: file.name || 'file',
            type: file.type || 'application/octet-stream',
        } as any);

        formData.append('chatId', chatId.toString());
        formData.append('messageType', messageType);

        try {
            const response = await fetch(`${API}/LetsTalk/FileUploader`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`File upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'File upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    return sendChat;
}

export function useSendChatSimple() {
    const { sendMessage } = useWebSocket();

    return (toUserId: number, message: string) => {
        sendMessage({
            type: "send_message",
            toUserId,
            message,
            messageType: 'TEXT',
        });
    };
}