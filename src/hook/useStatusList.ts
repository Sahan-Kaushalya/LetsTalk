import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../socket/WebSocketProvider';
import { ContactStatusPayload, StatusDTO, StatusItem, StatusStory, StatusComment } from '../interface/ChatStatus';

export function useStatusList() {
  const { socket, isConnected, sendMessage } = useWebSocket();
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);
  const [contactStatuses, setContactStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 
  const transformStatusDTO = (dto: StatusDTO): StatusStory => {
    
    const storyComments: StatusComment[] = [];
    dto.views.forEach(view => {
      if (view.comments && view.comments.length > 0) {
        view.comments.forEach(comment => {
          storyComments.push({
            id: comment.id,
            userId: view.viewerId,
            userName: view.viewerName,
            avatar: view.viewerProfileImage,
            comment: comment.comment,
            timestamp: new Date(comment.createdAt)
          });
        });
      }
    });

    return {
      id: dto.id,
      type: dto.messageType,
      url: dto.url || undefined,       
      message: dto.message || undefined,
      bgColor: dto.bgColor || undefined, 
      timestamp: new Date(dto.createdAt),
      views: dto.viewCount,
      likes: dto.views.filter(v => v.isLike).length,
      isLiked: false,
      isViewed: dto.isViewed || false,
      comments: storyComments,
    };
  };

  const getCommentsFromDTO = (dto: StatusDTO): StatusComment[] => {
    const allComments: StatusComment[] = [];
    dto.views.forEach(view => {
      if (view.comments && view.comments.length > 0) {
        view.comments.forEach(comment => {
          allComments.push({
            id: comment.id,
            userId: view.viewerId,
            userName: view.viewerName,
            avatar: view.viewerProfileImage,
            comment: comment.comment,
            timestamp: new Date(comment.createdAt)
          });
        });
      }
    });

    return allComments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const transformContactStatus = (payload: ContactStatusPayload): StatusItem => {
    const stories = payload.statuses.map(transformStatusDTO);
    const latestStatus = payload.statuses[payload.statuses.length - 1];
    
    const allComments: StatusComment[] = [];
    payload.statuses.forEach(status => {
      const comments = getCommentsFromDTO(status);
      allComments.push(...comments);
    });
    
    return {
      userId: payload.userId,
      userName: latestStatus.userName,
      avatar: latestStatus.profileImage,
      stories,
      isViewed: payload.statuses.every(s => s.isViewed),
      timestamp: new Date(latestStatus.createdAt),
      comments: allComments,
    };
  };


  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'my_statuses':
            if (data.payload && Array.isArray(data.payload)) {
              const statusMap = new Map<number, StatusDTO[]>();
              
              data.payload.forEach((dto: StatusDTO) => {
                if (!statusMap.has(dto.userId)) {
                  statusMap.set(dto.userId, []);
                }
                statusMap.get(dto.userId)!.push(dto);
              });

              const myStatusItems: StatusItem[] = Array.from(statusMap.entries()).map(([userId, dtos]) => {
                const firstDto = dtos[0];
                
                const allComments: StatusComment[] = [];
                dtos.forEach(dto => {
                  const comments = getCommentsFromDTO(dto);
                  allComments.push(...comments);
                });
                
                return {
                  userId: userId,
                  userName: firstDto.userName,
                  avatar: firstDto.profileImage,
                  stories: dtos.map(transformStatusDTO),
                  isViewed: true,
                  timestamp: new Date(dtos[dtos.length - 1].createdAt),
                  comments: allComments,
                };
              });
              
              setMyStatuses(myStatusItems);
            }
            setLoading(false);
            break;

          case 'contact_statuses':
            if (data.payload && Array.isArray(data.payload)) {
              const contactStatusItems = data.payload.map(transformContactStatus);
              setContactStatuses(contactStatusItems);
            }
            setLoading(false);
            break;

          case 'status_created':
            fetchMyStatuses();
            fetchContactStatuses();
            break;

          case 'comment_added':
           
            if (data.statusId && data.comment) {
              const newComment: StatusComment = {
                id: data.commentId,
                userId: data.userId,
                userName: data.userName,
                avatar: data.userProfileImage,
                comment: data.comment,
                timestamp: new Date()
              };

             
              const updateStoriesWithComment = (statuses: StatusItem[]) => 
                statuses.map(status => ({
                  ...status,
                  stories: status.stories.map(story => 
                    story.id === data.statusId
                      ? { 
                          ...story, 
                          comments: [...story.comments, newComment]
                        }
                      : story
                  ),
                  comments: status.stories.some(s => s.id === data.statusId)
                    ? [...status.comments, newComment]
                    : status.comments
                }));

              setMyStatuses(prev => updateStoriesWithComment(prev));
              setContactStatuses(prev => updateStoriesWithComment(prev));
            }
            break;

          case 'status_like_toggled':
           
            if (data.statusId !== undefined) {
              const updateLikeState = (statuses: StatusItem[]) => 
                statuses.map(status => ({
                  ...status,
                  stories: status.stories.map(story => 
                    story.id === data.statusId
                      ? { 
                          ...story, 
                          isLiked: data.isLiked,
                          likes: data.isLiked ? story.likes + 1 : story.likes - 1
                        }
                      : story
                  )
                }));

              setMyStatuses(prev => updateLikeState(prev));
              setContactStatuses(prev => updateLikeState(prev));
            }
            break;

          case 'error':
            setError(data.message || 'An error occurred');
            setLoading(false);
            break;
        }
      } catch (err) {
        console.error('Error parsing status message:', err);
        setError('Failed to parse status data');
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const fetchMyStatuses = useCallback(() => {
    if (isConnected) {
      setLoading(true);
      sendMessage({ type: 'get_my_statuses' });
    }
  }, [isConnected, sendMessage]);

  const fetchContactStatuses = useCallback(() => {
    if (isConnected) {
      setLoading(true);
      sendMessage({ type: 'get_contact_statuses' });
    }
  }, [isConnected, sendMessage]);

  const markStatusAsViewed = useCallback((statusId: number) => {
    if (isConnected) {
      sendMessage({
        type: 'mark_status_viewed',
        statusId
      });

      setContactStatuses(prev => prev.map(status => {
        const updatedStories = status.stories.map(story => 
          story.id === statusId 
            ? { ...story, views: story.views + 1, isViewed: true }
            : story
        );
        return { 
          ...status, 
          stories: updatedStories,
          isViewed: updatedStories.every(s => s.isViewed)
        };
      }));
    }
  }, [isConnected, sendMessage]);

  const refreshStatuses = useCallback(() => {
    fetchMyStatuses();
    fetchContactStatuses();
  }, [fetchMyStatuses, fetchContactStatuses]);

  useEffect(() => {
    if (isConnected) {
      refreshStatuses();
    }
  }, [isConnected]);

  const allStatuses = [...contactStatuses].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return {
    myStatuses,
    contactStatuses,
    allStatuses,
    loading,
    error,
    refreshStatuses,
    markStatusAsViewed,
    fetchMyStatuses,
    fetchContactStatuses,
  };
}