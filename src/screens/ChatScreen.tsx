// ChatScreen.tsx - Complete implementation with file uploads and Image Viewer
import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, TextInput, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Modal, Pressable, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons, Entypo, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { useSingleChat } from "../hook/UseSingleChat";
import { formatChatTime, formatMessageTime } from "../util/DateFormatter";
import { SingleChat } from "../interface/LetsTalkChats";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import EmojiPicker, { EmojiType } from 'rn-emoji-keyboard';
import { useSendChat } from "../hook/UseSendChat";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ChatScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'ChatScreen'>;

interface AttachmentOption {
    id: string;
    title: string;
    icon: string;
    iconFamily: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
    color: string;
    bgColor: string;
    onPress: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute<RouteProps>();
    const isDark = applied === "dark";
    const { chatId, avatar } = route.params;

    const singleChat = useSingleChat(chatId);
    const sendChat = useSendChat();
    const chatMessages = singleChat.messages || [];
    const friend = singleChat.friend;

    const [inputText, setInputText] = useState('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    
    
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const [imageLoading, setImageLoading] = useState(false);
    
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    setCurrentUserId(parseInt(userId));
                }
            } catch (error) {
                console.error('Error getting user ID:', error);
            }
        };
        getCurrentUser();
    }, []);

    useEffect(() => {
        (async () => {
            await ImagePicker.requestCameraPermissionsAsync();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            await Audio.requestPermissionsAsync();
        })();
    }, []);

    useEffect(() => {
        if (chatMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [chatMessages]);

    // Image Viewer Handlers
    const handleImagePress = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setImageLoading(true);
        setIsImageViewerOpen(true);
    };

    const closeImageViewer = () => {
        setIsImageViewerOpen(false);
        setSelectedImageUrl('');
        setImageLoading(false);
    };

    const sendMessage = async () => {
        if (inputText.trim() === '' || !friend) return;

        try {
            await sendChat({
                toUserId: friend.id,
                message: inputText.trim(),
                messageType: 'TEXT',
            });
            setInputText('');
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handleEmojiPicker = () => {
        Keyboard.dismiss();
        setIsEmojiPickerOpen(true);
    };

    const handleEmojiSelect = (emoji: EmojiType) => {
        setInputText(prev => prev + emoji.emoji);
    };

    const handleCamera = async () => {
        setIsAttachmentModalOpen(false);
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3,4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0] && friend) {
                setUploadingFile(true);
                setUploadProgress('Sending image...');

                await sendChat({
                    toUserId: friend.id,
                    message: inputText.trim(),
                    messageType: 'IMAGE',
                    file: {
                        uri: result.assets[0].uri,
                        name: `image_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    },
                });

                setInputText('');
                setUploadingFile(false);
                setUploadProgress('');
            }
        } catch (error) {
            console.error('Camera error:', error);
            setUploadingFile(false);
            setUploadProgress('');
            Alert.alert('Error', 'Failed to capture image');
        }
    };

    const handleImagePicker = async () => {
        setIsAttachmentModalOpen(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets[0] && friend) {
                setUploadingFile(true);
                setUploadProgress('Sending image...');

                await sendChat({
                    toUserId: friend.id,
                    message: inputText.trim(),
                    messageType: 'IMAGE',
                    file: {
                        uri: result.assets[0].uri,
                        name: `image_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    },
                });

                setInputText('');
                setUploadingFile(false);
                setUploadProgress('');
            }
        } catch (error) {
            console.error('Image picker error:', error);
            setUploadingFile(false);
            setUploadProgress('');
            Alert.alert('Error', 'Failed to send image');
        }
    };

    const handleVideoPicker = async () => {
        setIsAttachmentModalOpen(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0] && friend) {
                setUploadingFile(true);
                setUploadProgress('Sending video...');

                await sendChat({
                    toUserId: friend.id,
                    message: inputText.trim(),
                    messageType: 'VIDEO',
                    file: {
                        uri: result.assets[0].uri,
                        name: `video_${Date.now()}.mp4`,
                        type: 'video/mp4',
                    },
                });

                setInputText('');
                setUploadingFile(false);
                setUploadProgress('');
            }
        } catch (error) {
            setUploadingFile(false);
            setUploadProgress('');
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Sending Error",
                textBody: "Failed to send video",
                autoClose: 2500,
                textBodyStyle: { fontSize: 15 },
            });
        }
    };

    const handleDocumentPicker = async () => {
        setIsAttachmentModalOpen(false);
        Toast.show({
            type: ALERT_TYPE.INFO,
            title: "Coming Soon",
            textBody: "Document sharing will be available soon!",
            autoClose: 2500,
            textBodyStyle: { fontSize: 15 },
        });
    };

    const handleVoiceRecording = async () => {
        if (isRecording) {
            try {
                if (recording && friend) {
                    setUploadingFile(true);
                    setUploadProgress('Sending voice note...');

                    await recording.stopAndUnloadAsync();
                    const uri = recording.getURI();
                    setIsRecording(false);
                    setRecording(null);

                    if (uri) {
                        await sendChat({
                            toUserId: friend.id,
                            message: '',
                            messageType: 'VOICE',
                            file: {
                                uri: uri,
                                name: `voice_${Date.now()}.m4a`,
                                type: 'audio/m4a',
                            },
                        });
                    }

                    setUploadingFile(false);
                    setUploadProgress('');
                }
            } catch (error) {
                console.error('Stop recording error:', error);
                setUploadingFile(false);
                setUploadProgress('');
                Alert.alert('Error', 'Failed to send voice note');
            }
        } else {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );

                setRecording(recording);
                setIsRecording(true);
            } catch (error) {
                console.error('Start recording error:', error);
                Alert.alert('Error', 'Failed to start recording');
            }
        }
    };

    const attachmentOptions: AttachmentOption[] = [
        {
            id: 'camera',
            title: 'Camera',
            icon: 'camera',
            iconFamily: 'Ionicons',
            color: '#ef4444',
            bgColor: isDark ? '#7f1d1d' : '#fee2e2',
            onPress: handleCamera,
        },
        {
            id: 'image',
            title: 'Gallery',
            icon: 'image',
            iconFamily: 'Ionicons',
            color: '#8b5cf6',
            bgColor: isDark ? '#5b21b6' : '#ede9fe',
            onPress: handleImagePicker,
        },
        {
            id: 'video',
            title: 'Video',
            icon: 'videocam',
            iconFamily: 'Ionicons',
            color: '#ec4899',
            bgColor: isDark ? '#831843' : '#fce7f3',
            onPress: handleVideoPicker,
        },
        {
            id: 'document',
            title: 'Document',
            icon: 'document-text',
            iconFamily: 'Ionicons',
            color: '#3b82f6',
            bgColor: isDark ? '#1e3a8a' : '#dbeafe',
            onPress: handleDocumentPicker,
        },
    ];

    const renderAttachmentOption = (option: AttachmentOption) => {
        const IconComponent = option.iconFamily === 'Ionicons' ? Ionicons :
            option.iconFamily === 'MaterialIcons' ? MaterialIcons :
                FontAwesome5;

        return (
            <TouchableOpacity
                key={option.id}
                className="items-center justify-center w-20 mb-6"
                onPress={option.onPress}
            >
                <View
                    className="items-center justify-center w-16 h-16 mb-2 rounded-full"
                    style={{ backgroundColor: option.bgColor }}
                >
                    <IconComponent name={option.icon as any} size={28} color={option.color} />
                </View>
                <Text className="text-xs font-medium text-sky-900 dark:text-slate-200">
                    {option.title}
                </Text>
            </TouchableOpacity>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'READ':
                return <Ionicons name="checkmark-done" size={14} color="#3b82f6" />;
            case 'DELIVERED':
                return <Ionicons name="checkmark-done" size={14} color={isDark ? "#64748b" : "#94a3b8"} />;
            case 'SENT':
            default:
                return <Ionicons name="checkmark" size={14} color={isDark ? "#64748b" : "#94a3b8"} />;
        }
    };

    const renderMessage = ({ item }: { item: SingleChat }) => {
        const isSent = item.sender?.id === currentUserId;

        return (
            <View
                className={`flex-row mb-3 px-4 ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              
                {!isSent && (
                    <View className="flex-row max-w-[75%]">
                        <Image
                            source={{ uri: avatar }}
                            className="w-8 h-8 mr-2 rounded-full"
                        />
                        <View>
                          
                            {item.messageType === 'TEXT' && (
                                <View className="px-4 py-3 rounded-tl-none rounded-2xl bg-sky-100 dark:bg-slate-800">
                                    <Text className="text-base text-sky-900 dark:text-slate-200">
                                        {item.message}
                                    </Text>
                                </View>
                            )}

                          
                            {item.messageType === 'IMAGE' && (
                                <View className="overflow-hidden border-4 rounded-tl-none rounded-2xl border-sky-100 dark:border-slate-800">
                                    <TouchableOpacity
                                        onPress={() => handleImagePress(item.filePath)}
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={{ uri: item.filePath }}
                                            className="w-48 h-48"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                    {item.message && item.message.trim() !== '' && (
                                        <View className="px-4 py-2 bg-sky-100 dark:bg-slate-800">
                                            <Text className="text-base text-sky-900 dark:text-slate-200">
                                                {item.message}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                     
                            {item.messageType === 'VIDEO' && (
                                <View className="overflow-hidden rounded-tl-none rounded-2xl bg-sky-100 dark:bg-slate-800">
                                    <TouchableOpacity className="items-center justify-center w-48 h-48 bg-sky-200 dark:bg-slate-700">
                                        <Ionicons name="play-circle" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                                        <Text className="mt-2 text-xs text-sky-900 dark:text-slate-300">Video</Text>
                                    </TouchableOpacity>
                                    {item.message && item.message.trim() !== '' && (
                                        <View className="px-4 py-2">
                                            <Text className="text-base text-sky-900 dark:text-slate-200">
                                                {item.message}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                       
                            {item.messageType === 'VOICE' && (
                                <View className="flex-row items-center px-4 py-3 rounded-tl-none rounded-2xl bg-sky-100 dark:bg-slate-800">
                                    <TouchableOpacity>
                                        <Ionicons name="play" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                                    </TouchableOpacity>
                                    <View className="flex-1 h-1 mx-3 rounded-full bg-sky-300 dark:bg-slate-600">
                                        <View className="w-0 h-full rounded-full bg-sky-500 dark:bg-blue-500" />
                                    </View>
                                    <Text className="text-xs text-sky-600 dark:text-slate-400">0:00</Text>
                                </View>
                            )}

                            <Text className="mt-1 ml-2 text-xs text-sky-600 dark:text-slate-500">
                                {formatMessageTime(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                )}

                {isSent && (
                    <View className="max-w-[75%]">
                  
                        {item.messageType === 'TEXT' && (
                            <View className="px-4 py-3 rounded-tr-none rounded-2xl bg-sky-500 dark:bg-blue-500">
                                <Text className="text-base text-white">
                                    {item.message}
                                </Text>
                            </View>
                        )}

                        {item.messageType === 'IMAGE' && (
                            <View className="overflow-hidden border-4 rounded-tr-none rounded-2xl border-sky-500 dark:border-blue-500">
                                <TouchableOpacity
                                    onPress={() => handleImagePress(item.filePath)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: item.filePath }}
                                        className="w-48 h-48"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                                {item.message && item.message.trim() !== '' && (
                                    <View className="px-4 py-2 bg-sky-500 dark:bg-blue-500">
                                        <Text className="text-base text-white">
                                            {item.message}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {item.messageType === 'VIDEO' && (
                            <View className="overflow-hidden rounded-tr-none rounded-2xl bg-sky-500 dark:bg-blue-500">
                                <TouchableOpacity className="items-center justify-center w-48 h-48 bg-sky-600 dark:bg-blue-600">
                                    <Ionicons name="play-circle" size={48} color="white" />
                                    <Text className="mt-2 text-xs text-white">Video</Text>
                                </TouchableOpacity>
                                {item.message && item.message.trim() !== '' && (
                                    <View className="px-4 py-2">
                                        <Text className="text-base text-white">
                                            {item.message}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {item.messageType === 'VOICE' && (
                            <View className="flex-row items-center px-4 py-3 rounded-tr-none rounded-2xl bg-sky-500 dark:bg-blue-500">
                                <TouchableOpacity>
                                    <Ionicons name="play" size={24} color="white" />
                                </TouchableOpacity>
                                <View className="flex-1 h-1 mx-3 bg-white rounded-full opacity-40">
                                    <View className="w-0 h-full bg-white rounded-full opacity-80" />
                                </View>
                                <Text className="text-xs text-white opacity-80">0:00</Text>
                            </View>
                        )}

                        <View className="flex-row items-center justify-end mt-1 mr-2">
                            <Text className="mr-1 text-xs text-sky-600 dark:text-slate-500">
                                {formatMessageTime(item.createdAt)}
                            </Text>
                            {getStatusIcon(item.messageStatus)}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (!friend) {
        return (
            <SafeAreaView className="items-center justify-center flex-1 bg-white dark:bg-slate-950">
                <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                <Text className="mt-4 text-sky-900 dark:text-slate-200">Loading chat...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#0f172a" : "#ffffff"}
            />

            <View className="flex-row items-center px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 mr-2 -ml-2"
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center flex-1"
                    onPress={() => { }}
                >
                    <View className="relative mr-3">
                        <Image
                            source={{ uri: avatar}}
                            className="w-12 h-12 rounded-full"
                        />
                        {friend.status === "ONLINE" && (
                            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-slate-900" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                            {`${friend.displayName}`}
                        </Text>
                        <Text className="text-xs text-sky-600 dark:text-slate-400">
                            {friend.status === "ONLINE"
                                ? "Online"
                                : friend.updatedAt
                                    ? `Last seen ${formatChatTime(friend.updatedAt)}`
                                    : "Offline"
                            }
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className="flex-row items-center">
                    <TouchableOpacity className="p-2 mr-1">
                        <Ionicons name="videocam" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 mr-1">
                        <Ionicons name="call" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2">
                        <Entypo name="dots-three-vertical" size={18} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={chatMessages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListEmptyComponent={
                    <View className="items-center justify-center flex-1 px-4 py-16">
                        <Ionicons
                            name="chatbubbles-outline"
                            size={64}
                            color={isDark ? "#475569" : "#cbd5e1"}
                        />
                        <Text className="mt-4 text-center text-sky-600 dark:text-slate-400">
                            No messages yet
                        </Text>
                        <Text className="mt-1 text-center text-sky-500 dark:text-slate-500">
                            Start the conversation!
                        </Text>
                    </View>
                }
            />

            {uploadingFile && (
                <View className="px-4 py-3 border-t bg-sky-100 dark:bg-slate-800 border-sky-200 dark:border-slate-700">
                    <View className="flex-row items-center">
                        <ActivityIndicator size="small" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        <Text className="ml-3 text-sky-700 dark:text-slate-300">
                            {uploadProgress}
                        </Text>
                    </View>
                </View>
            )}

            {isRecording && (
                <View className="px-4 py-2 bg-red-100 border-t border-red-200 dark:bg-red-900 dark:border-red-800">
                    <View className="flex-row items-center justify-center">
                        <View className="w-3 h-3 mr-2 bg-red-500 rounded-full animate-pulse" />
                        <Text className="text-base font-semibold text-red-700 dark:text-red-300">
                            Recording... Tap mic to stop
                        </Text>
                    </View>
                </View>
            )}


            <KeyboardAvoidingView
                behavior={Platform.OS === "android" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "android" ? 10 : 0}
            >
                <View className="flex-row items-center px-4 py-3 bg-white border-t dark:bg-slate-900 border-sky-100 dark:border-slate-800">
                    <TouchableOpacity
                        className="p-2 mr-2"
                        onPress={handleEmojiPicker}
                    >
                        <Ionicons name="happy-outline" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>

                    <View className="flex-row items-center flex-1 px-4 py-2 rounded-full bg-sky-50 dark:bg-slate-800">
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                            multiline
                            maxLength={1000}
                            className="flex-1 text-base text-sky-900 dark:text-slate-200"
                            style={{ maxHeight: 100 }}
                        />

                        <TouchableOpacity
                            className="p-1 ml-2"
                            onPress={() => setIsAttachmentModalOpen(true)}
                        >
                            <Ionicons name="attach" size={22} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="p-1 ml-1"
                            onPress={handleCamera}
                        >
                            <Ionicons name="camera-outline" size={22} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                    </View>

                    {inputText.trim() ? (
                        <TouchableOpacity
                            onPress={sendMessage}
                            className="items-center justify-center w-12 h-12 ml-2 rounded-full bg-sky-500 dark:bg-blue-500"
                            disabled={uploadingFile}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleVoiceRecording}
                            className={`items-center justify-center w-12 h-12 ml-2 rounded-full ${isRecording
                                ? 'bg-red-500 dark:bg-red-600'
                                : 'bg-sky-500 dark:bg-blue-500'
                                }`}
                            disabled={uploadingFile}
                        >
                            <Ionicons
                                name={isRecording ? "stop" : "mic"}
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isImageViewerOpen}
                onRequestClose={closeImageViewer}
                statusBarTranslucent
            >
                <View className="flex-1 bg-black">
                    
                    <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                        <View className="flex-row items-center justify-between px-4 py-3">
                            <TouchableOpacity
                                onPress={closeImageViewer}
                                className="p-2 rounded-full bg-black/50"
                            >
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                            
                            <View className="flex-row">
                                <TouchableOpacity className="p-2 mr-2 rounded-full bg-black/50">
                                    <Ionicons name="download-outline" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity className="p-2 rounded-full bg-black/50">
                                    <Ionicons name="share-outline" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>

                    <View className="items-center justify-center flex-1">
                        {imageLoading && (
                            <View className="absolute z-20 items-center justify-center">
                                <ActivityIndicator size="large" color="#3b82f6" />
                                <Text className="mt-3 text-base text-white">Loading...</Text>
                            </View>
                        )}
                        
                        <Image
                            source={{ uri: selectedImageUrl }}
                            style={{
                                width: SCREEN_WIDTH,
                                height: SCREEN_HEIGHT,
                            }}
                            resizeMode="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => {
                                setImageLoading(false);
                                Toast.show({
                                    type: ALERT_TYPE.DANGER,
                                    title: "Error",
                                    textBody: "Failed to load image",
                                    autoClose: 2500,
                                });
                            }}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isAttachmentModalOpen}
                onRequestClose={() => setIsAttachmentModalOpen(false)}
            >
                <Pressable
                    className="justify-end flex-1 bg-black/50"
                    onPress={() => setIsAttachmentModalOpen(false)}
                >
                    <Pressable
                        className="px-6 py-8 bg-white rounded-t-3xl dark:bg-slate-900"
                        onPress={(e) => e.stopPropagation()}
                    >
                        
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
                                Share Content
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsAttachmentModalOpen(false)}
                                className="p-2 rounded-full bg-sky-100 dark:bg-slate-800"
                            >
                                <Ionicons name="close" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                            </TouchableOpacity>
                        </View>

                        {inputText.trim() !== '' && (
                            <View className="px-4 py-3 mb-4 rounded-lg bg-sky-50 dark:bg-slate-800">
                                <Text className="text-sm text-sky-700 dark:text-slate-300">
                                    💡 Your message will be sent as a caption with the selected file
                                </Text>
                            </View>
                        )}

                        <View className="flex-row flex-wrap justify-around">
                            {attachmentOptions.map(option => renderAttachmentOption(option))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <EmojiPicker
                onEmojiSelected={handleEmojiSelect}
                open={isEmojiPickerOpen}
                onClose={() => setIsEmojiPickerOpen(false)}
                theme={{
                    backdrop: isDark ? '#000000' : '#00000066',
                    knob: isDark ? '#64748b' : '#cbd5e1',
                    container: isDark ? '#1e293b' : '#ffffff',
                    header: isDark ? '#334155' : '#f1f5f9',
                    skinTonesContainer: isDark ? '#334155' : '#f1f5f9',
                    category: {
                        icon: isDark ? '#94a3b8' : '#64748b',
                        iconActive: isDark ? '#3b82f6' : '#0ea5e9',
                        container: isDark ? '#1e293b' : '#ffffff',
                        containerActive: isDark ? '#334155' : '#e0f2fe',
                    },
                }}
                enableSearchBar
                enableRecentlyUsed
                categoryOrder={[
                    'smileys_emotion',
                    'people_body',
                    'animals_nature',
                    'food_drink',
                    'travel_places',
                    'activities',
                    'objects',
                    'symbols',
                    'flags'
                ]}
            />
        </SafeAreaView>
    );
}