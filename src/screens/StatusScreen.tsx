// StatusScreen.tsx - Updated with proper field handling
import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, Modal, Dimensions, TextInput, KeyboardAvoidingView, Platform, Keyboard, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { useStatusList } from "../hook/useStatusList";
import { useSendStatus } from "../hook/useSendStatus";
import { StatusComment, StatusItem, StatusStory } from "../interface/ChatStatus";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'StatusScreen'>;

const { width, height } = Dimensions.get('window');

export default function StatusScreen() {
  const { applied } = useTheme();
  const navigation = useNavigation<NavigationProps>();
  const isDark = applied === "dark";

  const {
    myStatuses,
    allStatuses,
    loading,
    error,
    refreshStatuses,
    markStatusAsViewed,
  } = useStatusList();

  const {
    toggleStatusLike,
    addStatusComment,
  } = useSendStatus();

  const [selectedStatus, setSelectedStatus] = useState<StatusItem | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const commentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (selectedStatus && showViewer) {
      const updatedStatus = allStatuses.find(s => s.userId === selectedStatus.userId) 
        || myStatuses.find(s => s.userId === selectedStatus.userId);
      
      if (updatedStatus) {
        setSelectedStatus(updatedStatus);
      }
    }
  }, [allStatuses, myStatuses, showViewer,navigation]);

  const getCurrentStatusComments = (): StatusComment[] => {
    if (!selectedStatus || !selectedStatus.stories[currentStoryIndex]) return [];
    return selectedStatus.stories[currentStoryIndex].comments || [];
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours === 1) return '1h ago';
    if (hours < 24) return `${hours}h ago`;
    return '1d ago';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStatuses();
    setRefreshing(false);
  };

  const openStatusViewer = (status: StatusItem) => {
    setSelectedStatus(status);
    setCurrentStoryIndex(0);
    setShowViewer(true);
    setImageLoading(true);
    
    if (status.stories.length > 0) {
      markStatusAsViewed(status.stories[0].id);
    }
  };

  const closeStatusViewer = () => {
    setShowViewer(false);
    setSelectedStatus(null);
    setCurrentStoryIndex(0);
    setShowComments(false);
    setCommentText('');
    setImageLoading(false);
  };

  const nextStory = () => {
    if (selectedStatus && currentStoryIndex < selectedStatus.stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setImageLoading(true);
      
      markStatusAsViewed(selectedStatus.stories[nextIndex].id);
    } else {
      const currentIndex = allStatuses.findIndex(s => s.userId === selectedStatus?.userId);
      if (currentIndex < allStatuses.length - 1) {
        openStatusViewer(allStatuses[currentIndex + 1]);
      } else {
        closeStatusViewer();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setImageLoading(true);
    } else {
      const currentIndex = allStatuses.findIndex(s => s.userId === selectedStatus?.userId);
      if (currentIndex > 0) {
        const prevStatus = allStatuses[currentIndex - 1];
        setSelectedStatus(prevStatus);
        setCurrentStoryIndex(prevStatus.stories.length - 1);
        setImageLoading(true);
      }
    }
  };

  const sendComment = () => {
    if (commentText.trim() === '' || !selectedStatus) return;
    
    const currentStory = selectedStatus.stories[currentStoryIndex];
    
    addStatusComment(currentStory.id, commentText.trim());
    
    setCommentText('');
    Keyboard.dismiss();
  };

  const toggleLike = () => {
    if (!selectedStatus) return;

    const currentStory = selectedStatus.stories[currentStoryIndex];
    
    toggleStatusLike(currentStory.id);
    
    const updatedStories = selectedStatus.stories.map((story, index) => 
      index === currentStoryIndex 
        ? { 
            ...story, 
            isLiked: !story.isLiked,
            likes: story.isLiked ? story.likes - 1 : story.likes + 1
          }
        : story
    );

    setSelectedStatus(prev => prev ? {
      ...prev,
      stories: updatedStories
    } : null);
  };

  const renderMyStatus = () => {
    const hasMyStatus = myStatuses.length > 0;
    
    return (
      <TouchableOpacity 
        className="px-4 py-4 mb-2 bg-white dark:bg-slate-900"
        onPress={() => {
          if (hasMyStatus) {
            openStatusViewer(myStatuses[0]);
          } else {
            navigation.navigate('AddStatusScreen',{avatar:myStatuses[0]?.avatar});
          }
        }}
      >
        <View className="flex-row items-center">
          <View className="relative mr-3">
            {hasMyStatus ? (
              <View className="w-16 h-16 p-1 rounded-full bg-sky-500 dark:bg-blue-500">
                <Image
                  source={{ uri: myStatuses[0].avatar }}
                  className="w-full h-full rounded-full"
                />
              </View>
            ) : (
              <View className="items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-slate-800">
                <Ionicons name="camera" size={28} color={isDark ? "#3b82f6" : "#0ea5e9"} />
              </View>
            )}
            {!hasMyStatus && (
              <View className="absolute bottom-0 right-0 items-center justify-center w-6 h-6 border-2 border-white rounded-full bg-sky-500 dark:bg-blue-500 dark:border-slate-900">
                <Ionicons name="add" size={16} color="white" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-sky-900 dark:text-slate-200">
              My Status
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              {hasMyStatus 
                ? `${myStatuses[0].stories.length} update${myStatuses[0].stories.length > 1 ? 's' : ''} • ${formatTime(myStatuses[0].timestamp)}`
                : 'Tap to add status update'
              }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatusItem = ({ item }: { item: StatusItem }) => {
    const totalComments = item.stories.reduce((acc, story) => acc + story.comments.length, 0);
    
    return (
      <TouchableOpacity
        onPress={() => openStatusViewer(item)}
        className="px-4 py-3 bg-white dark:bg-slate-900"
      >
        <View className="flex-row items-center">
          <View className="relative mr-3">
            <View className={`w-16 h-16 rounded-full p-1 ${
              item.isViewed 
                ? 'bg-slate-300 dark:bg-slate-700' 
                : 'bg-sky-500 dark:bg-blue-500'
            }`}>
              <Image
                source={{ uri: item.avatar }}
                className="w-full h-full rounded-full"
              />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
              {item.userName}
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              {formatTime(item.timestamp)}
            </Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center mb-1">
              <Ionicons name="eye-outline" size={14} color={isDark ? "#64748b" : "#94a3b8"} />
              <Text className="ml-1 text-xs text-sky-500 dark:text-slate-500">
                {item.stories.reduce((acc, story) => acc + story.views, 0)}
              </Text>
            </View>
            {totalComments > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={14} color={isDark ? "#64748b" : "#94a3b8"} />
                <Text className="ml-1 text-xs text-sky-500 dark:text-slate-500">
                  {totalComments}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderComment = ({ item }: { item: StatusComment }) => (
    <View className="flex-row px-4 py-3">
      <Image
        source={{ uri: item.avatar }}
        className="w-10 h-10 mr-3 rounded-full"
      />
      <View className="flex-1">
        <View className="px-4 py-2 rounded-lg bg-sky-100 dark:bg-slate-800">
          <Text className="mb-1 text-sm font-semibold text-sky-900 dark:text-slate-200">
            {item.userName}
          </Text>
          <Text className="text-base text-sky-900 dark:text-slate-200">
            {item.comment}
          </Text>
        </View>
        <Text className="mt-1 ml-2 text-xs text-sky-600 dark:text-slate-500">
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderStoryContent = (story: StatusStory) => {
    if (story.type === 'TEXT') {
  
      return (
        <View 
          className="items-center justify-center flex-1 px-8"
          style={{ backgroundColor: story.bgColor || '#3b82f6' }}
        >
          <Text className="text-3xl font-bold text-center text-white">
            {story.message || ''}
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center flex-1">
        {imageLoading && (
          <View className="absolute z-30 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
        
        <Image
          source={{ uri: story.url }}
          style={{ width, height }}
          resizeMode="contain"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {story.message && story.message.trim() !== '' && (
          <View className="absolute bottom-0 left-0 right-0 pb-32">
            <View className="px-6 py-4 mx-4 rounded-2xl bg-black/60">
              <Text className="text-base leading-relaxed text-center text-white">
                {story.message}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStatusViewer = () => {
    if (!selectedStatus) return null;

    const currentStory = selectedStatus.stories[currentStoryIndex];
    const currentComments = getCurrentStatusComments();

    return (
      <Modal visible={showViewer} animationType="fade" statusBarTranslucent>
        <SafeAreaView className="flex-1 bg-black">
          <StatusBar hidden />

          <View className="absolute top-0 left-0 right-0 z-20 flex-row px-2 pt-2 gap-x-1">
            {selectedStatus.stories.map((_, index) => (
              <View key={index} className="flex-1 h-1 overflow-hidden rounded-full bg-white/30">
                <View
                  className={`h-full transition-all duration-300 ${
                    index < currentStoryIndex ? 'w-full bg-white' : 
                    index === currentStoryIndex ? 'w-full bg-white' : 'w-0 bg-white'
                  }`}
                />
              </View>
            ))}
          </View>

          <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-4 pt-12">
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: selectedStatus.avatar }}
                className="w-10 h-10 mr-3 border-2 border-white rounded-full"
              />
              <View>
                <Text className="font-semibold text-white">
                  {selectedStatus.userName}
                </Text>
                <Text className="text-xs text-gray-300">
                  {formatTime(currentStory.timestamp)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeStatusViewer}
              className="p-2 rounded-full bg-black/50"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {renderStoryContent(currentStory)}

          <View className="absolute inset-0 flex-row" style={{ top: currentStory.type === 'TEXT' ? 60 : 0 }}>
            <TouchableOpacity
              onPress={prevStory}
              className="w-1/3 h-full"
              activeOpacity={1}
            />
            <View className="w-1/3 h-full" />
            <TouchableOpacity
              onPress={nextStory}
              className="w-1/3 h-full"
              activeOpacity={1}
            />
          </View>

  
          <View className="absolute bottom-0 left-0 right-0 pb-4">
            <View className="flex-row items-center justify-center px-4 py-2 mb-3">
              <View className="flex-row items-center px-4 py-2 rounded-full bg-black/50">
                <Ionicons name="eye" size={16} color="white" />
                <Text className="ml-2 text-sm font-medium text-white">
                  {currentStory.views}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={toggleLike}
                className="flex-row items-center px-4 py-2 ml-2 rounded-full bg-black/50"
              >
                <Ionicons 
                  name={currentStory.isLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={currentStory.isLiked ? "#ef4444" : "white"} 
                />
                <Text className="ml-2 text-sm font-medium text-white">
                  {currentStory.likes}
                </Text>
              </TouchableOpacity>

              {currentComments.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowComments(true)}
                  className="flex-row items-center px-4 py-2 ml-2 rounded-full bg-black/50"
                >
                  <Ionicons name="chatbubble" size={16} color="white" />
                  <Text className="ml-2 text-sm font-medium text-white">
                    {currentComments.length}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View className="px-4">
                <View className="flex-row items-center px-4 py-3 rounded-full bg-white/20">
                  <TouchableOpacity
                    onPress={() => commentInputRef.current?.focus()}
                    className="flex-1"
                  >
                    <TextInput
                      ref={commentInputRef}
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder={`Reply to ${selectedStatus.userName}...`}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      className="flex-1 text-base text-white"
                      maxLength={500}
                    />
                  </TouchableOpacity>
                  
                  {commentText.trim() ? (
                    <TouchableOpacity onPress={sendComment} className="ml-2">
                      <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row">
                      <TouchableOpacity onPress={toggleLike} className="mr-2">
                        <Ionicons 
                          name={currentStory.isLiked ? "heart" : "heart-outline"} 
                          size={24} 
                          color={currentStory.isLiked ? "#ef4444" : "white"} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowComments(true)}>
                        <Ionicons name="chatbubble-outline" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>

          <Modal
            visible={showComments}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowComments(false)}
          >
            <Pressable
              className="justify-end flex-1 bg-black/70"
              onPress={() => setShowComments(false)}
            >
              <Pressable
                className="bg-white h-2/3 rounded-t-3xl dark:bg-slate-900"
                onPress={(e) => e.stopPropagation()}
              >
                <View className="px-4 py-4 border-b border-sky-100 dark:border-slate-800">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-sky-900 dark:text-slate-200">
                      Comments ({currentComments.length})
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowComments(false)}
                      className="p-2 rounded-full bg-sky-100 dark:bg-slate-800"
                    >
                      <Ionicons name="close" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                    </TouchableOpacity>
                  </View>
                </View>

                <FlatList
                  data={currentComments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  ListEmptyComponent={
                    <View className="items-center justify-center py-16">
                      <Ionicons
                        name="chatbubbles-outline"
                        size={48}
                        color={isDark ? "#475569" : "#cbd5e1"}
                      />
                      <Text className="mt-4 text-sky-600 dark:text-slate-400">
                        No comments yet
                      </Text>
                    </View>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>
        </SafeAreaView>
      </Modal>
    );
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-sky-50 dark:bg-slate-950">
        <View className="items-center justify-center flex-1">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text className="mt-4 text-lg text-red-500">{error}</Text>
          <TouchableOpacity
            onPress={refreshStatuses}
            className="px-6 py-3 mt-4 rounded-full bg-sky-500"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sky-50 dark:bg-slate-950">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      />

      <View className="px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Image
              source={require("../../assets/icons/icon.png")}
              className="w-12 h-12 mr-3"
              resizeMode="contain"
            />
            <View>
              <Text className="text-2xl font-bold text-sky-900 dark:text-slate-200">
                Status
              </Text>
              <Text className="text-sm text-sky-600 dark:text-slate-400">
                Share your moments
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-sky-100 dark:bg-slate-800"
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={allStatuses}
        renderItem={renderStatusItem}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={renderMyStatus}
        ItemSeparatorComponent={() => <View className="h-px bg-sky-100 dark:bg-slate-800" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDark ? "#3b82f6" : "#0ea5e9"]}
            tintColor={isDark ? "#3b82f6" : "#0ea5e9"}
          />
        }
        ListEmptyComponent={() => (
          loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
              <Text className="mt-4 text-sky-600 dark:text-slate-400">
                Loading statuses...
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center px-8 py-20">
              <View className="items-center justify-center w-24 h-24 mb-4 rounded-full bg-sky-100 dark:bg-slate-800">
                <MaterialCommunityIcons name="camera-plus" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
              </View>
              <Text className="mb-2 text-xl font-bold text-center text-sky-900 dark:text-slate-200">
                No Status Yet
              </Text>
              <Text className="text-center text-sky-600 dark:text-slate-400">
                Be the first to share a status update
              </Text>
            </View>
          )
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('AddStatusScreen',{avatar:myStatuses[0]?.avatar})}
        className="absolute items-center justify-center w-16 h-16 rounded-full shadow-lg bottom-6 right-6 bg-sky-500 dark:bg-blue-500"
        style={{
          shadowColor: isDark ? "#3b82f6" : "#0ea5e9",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="camera-plus" size={28} color="white" />
      </TouchableOpacity>

      {renderStatusViewer()}
    </SafeAreaView>
  );
}