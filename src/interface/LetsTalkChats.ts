export interface UserDetails {
    id: number;
    firstName: string,
    lastName: string,
    aboutMe: string,
    countryCode: string,
    contactNo: string,
    createdAt: string,
    updatedAt: string,
    status: string,
}
export interface SingleChat {
    id: number;
    friendId: string;
    friendName: string;
    message: string;
    timestamp: string;
    profileImage: string;
    isOnline: string;
    messageType: string;
    messageStatus: string;
    sender: UserDetails,
    receiver: UserDetails,
    createdAt: string,
    updatedAt: string,
    filePath: string,
}

export interface ChatItem {
    friendId: string;
    friendName: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    profileImage: string;
    isOnline: boolean;
    messageType: string;
    messageStatus: string;
}

export interface UserDTo {
    id: number;
    firstName: string,
    lastName: string,
    displayName: string,
    aboutMe: string,
    countryCode: string,
    contactNo: string,
    profileImage: string;
    isOnline: string;
    createdAt: string,
    updatedAt: string,
    status: string,
}