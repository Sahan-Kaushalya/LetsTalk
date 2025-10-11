import { View, Text, TouchableOpacity, Image, StatusBar, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState, useRef } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { useSendStatus } from "../hook/useSendStatus";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AddStatusScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'AddStatusScreen'>;
const { width, height } = Dimensions.get('window');

interface MediaFile {
  uri: string;
  type: 'image' | 'video';
  name?: string;
  mimeType?: string;
}

export default function AddStatusScreen() {
  const { applied } = useTheme();
  const navigation = useNavigation<NavigationProps>();
  const { sendStatus } = useSendStatus();
  const isDark = applied === "dark";

  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textStatusContent, setTextStatusContent] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#3b82f6');
  const route = useRoute<RouteProps>();
  const { avatar } = route.params;
  const videoRef = useRef<Video>(null);

  const backgroundColors = [
    { id: '1', color: '#3b82f6' },
    { id: '2', color: '#8b5cf6' },
    { id: '3', color: '#ec4899' },
    { id: '4', color: '#f59e0b' },
    { id: '5', color: '#10b981' },
    { id: '6', color: '#ef4444' },
    { id: '7', color: '#06b6d4' },
    { id: '8', color: '#6366f1' },
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'image',
          name: result.assets[0].fileName || 'status_image.jpg',
          mimeType: result.assets[0].mimeType || 'image/jpeg'
        });
        setShowTextEditor(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to pick image',
        autoClose: 3000,
      });
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'video',
          name: result.assets[0].fileName || 'status_video.mp4',
          mimeType: result.assets[0].mimeType || 'video/mp4'
        });
        setShowTextEditor(false);
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to pick video',
        autoClose: 3000,
      });
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: 'image',
          name: result.assets[0].fileName || 'status_photo.jpg',
          mimeType: result.assets[0].mimeType || 'image/jpeg'
        });
        setShowTextEditor(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to capture photo',
        autoClose: 3000,
      });
    }
  };

  const createTextStatus = () => {
    setSelectedMedia(null);
    setShowTextEditor(true);
  };

  const handlePost = async () => {
    try {
      setUploading(true);

      if (showTextEditor && textStatusContent.trim()) {
        await sendStatus({
          message: textStatusContent.trim(),
          messageType: 'TEXT',
          bgColor: selectedBgColor,
        });

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Text status posted successfully!',
          autoClose: 2000,
          onPress: () => Toast.hide(),
        });

        setTimeout(() => {
          navigation.goBack();
        }, 500);

        return;
      }

      if (selectedMedia) {
        const messageType = selectedMedia.type === 'image' ? 'IMAGE' : 'VIDEO';

        await sendStatus({
          message: caption.trim(),
          messageType: messageType,
          file: {
            uri: selectedMedia.uri,
            name: selectedMedia.name,
            type: selectedMedia.mimeType,
          },
        });

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `${selectedMedia.type === 'image' ? 'Image' : 'Video'} status posted successfully!`,
          autoClose: 2000,
          onPress: () => Toast.hide(),
        });

        setTimeout(() => {
          navigation.goBack();
        }, 500);

        return;
      }

      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Please select media or add text content',
        autoClose: 3000,
      });

    } catch (error) {
      console.error('Status post error:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to post status. Please try again.',
        autoClose: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setCaption('');
  };

  const renderMediaOptions = () => (
    <View className="items-center justify-center flex-1 px-6">
      <View className="items-center mb-8">
        <View className="items-center justify-center w-24 h-24 mb-4 rounded-full bg-sky-100 dark:bg-slate-800">
          <MaterialCommunityIcons name="camera-plus" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
        </View>
        <Text className="mb-2 text-2xl font-bold text-sky-900 dark:text-slate-200">
          Create Status
        </Text>
        <Text className="text-center text-sky-600 dark:text-slate-400">
          Share photos, videos or text with your friends
        </Text>
      </View>

      <View className="w-full space-y-3">
        <TouchableOpacity
          onPress={takePhoto}
          className="flex-row items-center p-4 bg-white border-2 rounded-2xl dark:bg-slate-900 border-sky-100 dark:border-slate-800"
        >
          <View className="items-center justify-center w-12 h-12 mr-4 bg-red-100 rounded-full dark:bg-red-900/30">
            <Ionicons name="camera" size={24} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-sky-900 dark:text-slate-200">
              Camera
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              Take a photo
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#64748b" : "#94a3b8"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          className="flex-row items-center p-4 bg-white border-2 rounded-2xl dark:bg-slate-900 border-sky-100 dark:border-slate-800"
        >
          <View className="items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-full dark:bg-purple-900/30">
            <Ionicons name="image" size={24} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-sky-900 dark:text-slate-200">
              Gallery
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              Choose from gallery
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#64748b" : "#94a3b8"} />
        </TouchableOpacity>

        {/* Video */}
        <TouchableOpacity
          onPress={pickVideo}
          className="flex-row items-center p-4 bg-white border-2 rounded-2xl dark:bg-slate-900 border-sky-100 dark:border-slate-800"
        >
          <View className="items-center justify-center w-12 h-12 mr-4 bg-pink-100 rounded-full dark:bg-pink-900/30">
            <Ionicons name="videocam" size={24} color="#ec4899" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-sky-900 dark:text-slate-200">
              Video
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              Share a video
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#64748b" : "#94a3b8"} />
        </TouchableOpacity>

        {/* Text Status */}
        <TouchableOpacity
          onPress={createTextStatus}
          className="flex-row items-center p-4 bg-white border-2 rounded-2xl dark:bg-slate-900 border-sky-100 dark:border-slate-800"
        >
          <View className="items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <Ionicons name="text" size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-sky-900 dark:text-slate-200">
              Text Status
            </Text>
            <Text className="text-sm text-sky-600 dark:text-slate-400">
              Write something
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#64748b" : "#94a3b8"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMediaEditor = () => (
    <View className="flex-1">
      <View className="relative flex-1 bg-black">
        {selectedMedia?.type === 'image' ? (
          <Image
            source={{ uri: selectedMedia.uri }}
            style={{ width, height: height * 0.7 }}
            resizeMode="contain"
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: selectedMedia?.uri || '' }}
            style={{ width, height: height * 0.7 }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            isMuted
          />
        )}

        <View className="absolute top-0 left-0 right-0">
          <SafeAreaView>
            <View className="flex-row items-center justify-between px-4 py-2">
              <TouchableOpacity
                onPress={removeMedia}
                className="p-2 rounded-full bg-black/50"
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>

              <View className="flex-row">
                <TouchableOpacity className="p-2 mr-2 rounded-full bg-black/50">
                  <Ionicons name="color-palette-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 rounded-full bg-black/50">
                  <Ionicons name="text" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        className="bg-white dark:bg-slate-900"
      >
        <View className="px-4 py-4 border-t border-sky-100 dark:border-slate-800">
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: avatar }}
              className="w-12 h-12 mr-3 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                Your Story
              </Text>
              <Text className="text-sm text-sky-600 dark:text-slate-400">
                Visible for 24 hours
              </Text>
            </View>
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption..."
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            multiline
            maxLength={200}
            className="px-4 py-3 mb-4 text-base rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-slate-200"
            style={{ maxHeight: 80 }}
          />

          <TouchableOpacity
            onPress={handlePost}
            disabled={uploading}
            className="items-center justify-center py-4 rounded-xl bg-sky-500 dark:bg-blue-500"
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="paper-plane" size={20} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Post Status
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  const renderTextEditor = () => {
    return (
      <View className="flex-1">
        <View className="relative flex-1" style={{ backgroundColor: selectedBgColor }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <TextInput
              value={textStatusContent}
              onChangeText={setTextStatusContent}
              placeholder="What's on your mind?"
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              maxLength={300}
              textAlign="center"
              className="w-full text-3xl font-bold text-white"
              style={{
                minHeight: 200,
                textAlignVertical: 'center'
              }}
            />
          </View>

          <View className="absolute top-0 left-0 right-0">
            <SafeAreaView>
              <View className="flex-row items-center justify-between px-4 py-2">
                <TouchableOpacity
                  onPress={() => {
                    setShowTextEditor(false);
                    setTextStatusContent('');
                  }}
                  className="p-2 rounded-full bg-black/30"
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>

                <Text className="text-white/80">
                  {textStatusContent.length}/300
                </Text>
              </View>
            </SafeAreaView>
          </View>
        </View>

        <View className="bg-white dark:bg-slate-900">
          <View className="px-4 py-4 border-t border-sky-100 dark:border-slate-800">
            <Text className="mb-3 text-sm font-semibold text-sky-900 dark:text-slate-200">
              Background Color
            </Text>
            <View className="flex-row flex-wrap mb-4">
              {backgroundColors.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  onPress={() => setSelectedBgColor(bg.color)}
                  className="mb-3 mr-3"
                >
                  <View
                    style={{ backgroundColor: bg.color }}
                    className={`w-14 h-14 rounded-full items-center justify-center ${selectedBgColor === bg.color ? 'border-4 border-sky-500 dark:border-blue-500' : ''
                      }`}
                  >
                    {selectedBgColor === bg.color && (
                      <Ionicons name="checkmark" size={24} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handlePost}
              disabled={uploading || !textStatusContent.trim()}
              className={`items-center justify-center py-4 rounded-xl ${textStatusContent.trim()
                  ? 'bg-sky-500 dark:bg-blue-500'
                  : 'bg-slate-300 dark:bg-slate-700'
                }`}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="paper-plane" size={20} color="white" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Post Status
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50 dark:bg-slate-950">
      <StatusBar
        barStyle={selectedMedia || showTextEditor ? "light-content" : (isDark ? "light-content" : "dark-content")}
        backgroundColor={selectedMedia || showTextEditor ? "#000000" : (isDark ? "#0f172a" : "#ffffff")}
      />

      {!selectedMedia && !showTextEditor && (
        <View className="px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="p-2 mr-3 -ml-2"
              >
                <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
                Add Status
              </Text>
            </View>
          </View>
        </View>
      )}

      {!selectedMedia && !showTextEditor && renderMediaOptions()}
      {selectedMedia && renderMediaEditor()}
      {showTextEditor && renderTextEditor()}
    </SafeAreaView>
  );
}