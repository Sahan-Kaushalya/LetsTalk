import { useWebSocket } from "../socket/WebSocketProvider";

export interface SendStatusOptions {
    message?: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
    bgColor?: string;
    file?: {
        uri: string;
        name?: string;
        type?: string;
    };
}

export function useSendStatus() {
    const { sendMessage, socket } = useWebSocket();

    const sendStatus = async (options: SendStatusOptions): Promise<void> => {
        const { message = '', messageType, bgColor, file } = options;

        if (messageType === 'TEXT' && !file) {
            sendMessage({
                type: "send_status",
                message: message,
                messageType: 'TEXT',
                bgColor: bgColor || '#3b82f6',
            });
            return;
        }

        if (file && (messageType === 'IMAGE' || messageType === 'VIDEO')) {
            return new Promise((resolve, reject) => {
                let messageHandlerAdded = false;

                sendMessage({
                    type: "send_status",
                    message: message,
                    messageType: messageType,
                    bgColor: bgColor,
                });

                const messageHandler = async (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data);

                        if (response.type === 'status_created' && response.statusId) {
                            const statusId = response.statusId;

                            socket?.removeEventListener('message', messageHandler);

                            try {
                                await uploadStatusFile(file, statusId, messageType);
                                resolve();
                            } catch (uploadError) {
                                reject(uploadError);
                            }
                        }
                    } catch (error) {
                        console.error('Error handling status response:', error);
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
                    reject(new Error('Status upload timeout - server did not respond'));
                }, 10000);
            });
        }
    };

    const uploadStatusFile = async (
        file: { uri: string; name?: string; type?: string },
        statusId: number,
        messageType: string
    ): Promise<any> => {
        const API = process.env.EXPO_PUBLIC_APP_URL;

        const formData = new FormData();

        formData.append('file', {
            uri: file.uri,
            name: file.name || 'status_file',
            type: file.type || 'application/octet-stream',
        } as any);

        formData.append('statusId', statusId.toString());
        formData.append('messageType', messageType);

        try {
            const response = await fetch(`${API}/LetsTalk/StatusFileUploader`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status file upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Status file upload failed');
            }

            return data;
        } catch (error) {
            console.error('Status upload error:', error);
            throw error;
        }
    };

    const getMyStatuses = () => {
        sendMessage({
            type: "get_my_statuses"
        });
    };

    const getContactStatuses = () => {
        sendMessage({
            type: "get_contact_statuses"
        });
    };

    const toggleStatusLike = (statusId: number) => {
        sendMessage({
            type: "toggle_status_like",
            statusId: statusId
        });
    };

    const addStatusComment = (statusId: number, comment: string) => {
        if (!comment.trim()) {
            console.warn('Cannot send empty comment');
            return;
        }

        sendMessage({
            type: "add_status_comment",
            statusId: statusId,
            comment: comment.trim()
        });
    };

    const markStatusViewed = (statusId: number) => {
        sendMessage({
            type: "mark_status_viewed",
            statusId: statusId
        });
    };

    return { 
        sendStatus, 
        getMyStatuses, 
        getContactStatuses,
        toggleStatusLike,
        addStatusComment,
        markStatusViewed
    };
}