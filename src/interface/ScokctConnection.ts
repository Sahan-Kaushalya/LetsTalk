export interface WSRequest {
    type: string;
    fromUserId?: number;
    toUserId?: number;
    message?: string;

}

export interface WSResponse {
    type: string;
    payload: any;

}