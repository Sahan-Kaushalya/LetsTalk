export interface StatusStory {
  id: number;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  message?: string;        
  url?: string;          
  bgColor?: string;      
  timestamp: Date;
  views: number;
  likes: number;
  isLiked: boolean;
  isViewed: boolean;
  comments: StatusComment[];
}

export interface StatusComment {
  id: number;
  userId: number;
  userName: string;
  avatar: string;
  comment: string;
  timestamp: Date;
}

export interface CommentDTO {
  id: number;
  comment: string;
  createdAt: string;
  userId: number;
  userName: string;
  userProfileImage: string;
}

export interface StatusItem {
  userId: number;
  userName: string;
  avatar: string;
  stories: StatusStory[];
  isViewed: boolean;
  timestamp: Date;
  comments: StatusComment[];
}

export interface StatusViewDTO {
  viewerId: number;
  viewerName: string;
  viewerProfileImage: string;
  viewedAt: string;
  isLike: boolean;
  comments: CommentDTO[];  
}

export interface StatusDTO {
  id: number;
  userId: number;
  userName: string;
  profileImage: string;
  message?: string;         
  url?: string;             
  bgColor?: string;         
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  createdAt: string;
  viewCount: number;
  isViewed: boolean;
  views: StatusViewDTO[];
}

export interface ContactStatusPayload {
  userId: number;
  statuses: StatusDTO[];
}