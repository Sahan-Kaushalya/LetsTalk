import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, TextInput, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ChatScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'ChatScreen'>;

interface Message {
    id: string;
    text: string;
    timestamp: string;
    isSent: boolean;
    isDelivered: boolean;
    isRead: boolean;
    messageType: 'text' | 'image' | 'voice';
    imageUrl?: string;
    voiceDuration?: string;
}

// Mock messages data
const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        text: 'Hey! How are you?',
        timestamp: '10:30 AM',
        isSent: false,
        isDelivered: true,
        isRead: true,
        messageType: 'text',
    },
    {
        id: '2',
        text: "I'm good! Just working on the new project. What about you?",
        timestamp: '10:32 AM',
        isSent: true,
        isDelivered: true,
        isRead: true,
        messageType: 'text',
    },
    {
        id: '3',
        text: 'Same here! Want to grab coffee later?',
        timestamp: '10:35 AM',
        isSent: false,
        isDelivered: true,
        isRead: true,
        messageType: 'text',
    },
    {
        id: '4',
        text: 'Sure! How about 4 PM at the usual place?',
        timestamp: '10:36 AM',
        isSent: true,
        isDelivered: true,
        isRead: true,
        messageType: 'text',
    },
    {
        id: '5',
        text: 'Perfect! See you then 👍',
        timestamp: '10:37 AM',
        isSent: false,
        isDelivered: true,
        isRead: false,
        messageType: 'text',
    },
];

export default function ChatScreen() {
    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute<RouteProps>();
    const isDark = applied === "dark";

    // Get params from navigation (chatId, name, avatar, isOnline)
    const chatName = route.params?.name || "Kasun Perera";
    const chatAvatar = route.params?.avatar || "https://i.pravatar.cc/150?img=1";
    const isOnline = route.params?.isOnline || true;

    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Scroll to bottom when messages change
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const sendMessage = () => {
        if (inputText.trim() === '') return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            isDelivered: false,
            isRead: false,
            messageType: 'text',
        };

        setMessages([...messages, newMessage]);
        setInputText('');
        Keyboard.dismiss();

        // Simulate message delivered
        setTimeout(() => {
            setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id ? { ...msg, isDelivered: true } : msg
            ));
        }, 1000);

        // Simulate message read
        setTimeout(() => {
            setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id ? { ...msg, isRead: true } : msg
            ));
        }, 2000);
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            className={`flex-row mb-3 px-4 ${item.isSent ? 'justify-end' : 'justify-start'}`}
        >
            {/* Received Message */}
            {!item.isSent && (
                <View className="flex-row max-w-[75%]">
                    <Image
                        source={{ uri: chatAvatar }}
                        className="w-8 h-8 mr-2 rounded-full"
                    />
                    <View>
                        <View className="px-4 py-3 rounded-tl-none rounded-2xl bg-sky-100 dark:bg-slate-800">
                            <Text className="text-base text-sky-900 dark:text-slate-200">
                                {item.text}
                            </Text>
                        </View>
                        <Text className="mt-1 ml-2 text-xs text-sky-600 dark:text-slate-500">
                            {item.timestamp}
                        </Text>
                    </View>
                </View>
            )}

            {/* Sent Message */}
            {item.isSent && (
                <View className="max-w-[75%]">
                    <View className="px-4 py-3 rounded-tr-none rounded-2xl bg-sky-500 dark:bg-blue-500">
                        <Text className="text-base text-white">
                            {item.text}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-end mt-1 mr-2">
                        <Text className="mr-1 text-xs text-sky-600 dark:text-slate-500">
                            {item.timestamp}
                        </Text>
                        {item.isRead ? (
                            <Ionicons name="checkmark-done" size={14} color="#3b82f6" />
                        ) : item.isDelivered ? (
                            <Ionicons name="checkmark-done" size={14} color={isDark ? "#64748b" : "#94a3b8"} />
                        ) : (
                            <Ionicons name="checkmark" size={14} color={isDark ? "#64748b" : "#94a3b8"} />
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <StatusBar hidden={false} />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 mr-2 -ml-2"
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                </TouchableOpacity>

                {/* Avatar & Name */}
                <TouchableOpacity 
                    className="flex-row items-center flex-1"
                    onPress={() => {
                        // Navigate to user profile
                    }}
                >
                    <View className="relative mr-3">
                        <Image
                            source={{ uri: chatAvatar }}
                            className="w-12 h-12 rounded-full"
                        />
                        {isOnline && (
                            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-slate-900" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                            {chatName}
                        </Text>
                        <Text className="text-xs text-sky-600 dark:text-slate-400">
                            {isTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Action Buttons */}
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

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "android" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "android" ? 50 : 50}
            >
                <View className="flex-row items-center px-4 py-3 bg-white border-t dark:bg-slate-900 border-sky-100 dark:border-slate-800">
                    {/* Emoji Button */}
                    <TouchableOpacity className="p-2 mr-2">
                        <Ionicons name="happy-outline" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>

                    {/* Text Input */}
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
                        
                        {/* Attachment Button */}
                        <TouchableOpacity className="p-1 ml-2">
                            <Ionicons name="attach" size={22} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                        
                        {/* Camera Button */}
                        <TouchableOpacity className="p-1 ml-1">
                            <Ionicons name="camera-outline" size={22} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                    </View>

                    {/* Send/Voice Button */}
                    {inputText.trim() ? (
                        <TouchableOpacity
                            onPress={sendMessage}
                            className="items-center justify-center w-12 h-12 ml-2 rounded-full bg-sky-500 dark:bg-blue-500"
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="items-center justify-center w-12 h-12 ml-2 rounded-full bg-sky-500 dark:bg-blue-500"
                        >
                            <Ionicons name="mic" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}