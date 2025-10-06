import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useUserRegistration } from "../components/UserContext";
import "../../global.css";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

interface ChatItem {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar: string;
    isOnline: boolean;
    messageType: 'text' | 'image' | 'voice' | 'video';
}

// Mock data - Replace with your actual API
const MOCK_CHATS: ChatItem[] = [
    {
        id: '1',
        name: 'Kasun Perera',
        lastMessage: 'See you tomorrow! 👋',
        timestamp: '2m ago',
        unreadCount: 2,
        avatar: 'https://i.pravatar.cc/150?img=1',
        isOnline: true,
        messageType: 'text',
    },
    {
        id: '2',
        name: 'Nimali Fernando',
        lastMessage: 'Thanks for the help!',
        timestamp: '15m ago',
        unreadCount: 0,
        avatar: 'https://i.pravatar.cc/150?img=5',
        isOnline: true,
        messageType: 'text',
    },
    {
        id: '3',
        name: 'Ravindu Silva',
        lastMessage: '📷 Photo',
        timestamp: '1h ago',
        unreadCount: 5,
        avatar: 'https://i.pravatar.cc/150?img=8',
        isOnline: false,
        messageType: 'image',
    },
    {
        id: '4',
        name: 'Tharushi Jayasinghe',
        lastMessage: '🎤 Voice message',
        timestamp: '3h ago',
        unreadCount: 1,
        avatar: 'https://i.pravatar.cc/150?img=9',
        isOnline: false,
        messageType: 'voice',
    },
    {
        id: '5',
        name: 'Chaminda Weerasinghe',
        lastMessage: 'Meeting at 3 PM? nuiheuiwhio huehwuihui yguyweugtuewygewhibn buysghb bvuwbjhbugyf gyugwuuyj hweiu',
        timestamp: 'Yesterday',
        unreadCount: 0,
        avatar: 'https://i.pravatar.cc/150?img=12',
        isOnline: false,
        messageType: 'text',
    },
    {
        id: '6',
        name: 'Sanduni Rajapaksha',
        lastMessage: '📹 Video call',
        timestamp: 'Yesterday',
        unreadCount: 0,
        avatar: 'https://i.pravatar.cc/150?img=20',
        isOnline: true,
        messageType: 'video',
    },
];

export default function HomeScreen() {
    const { applied } = useTheme();
    const { userData } = useUserRegistration();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const [chats, setChats] = useState<ChatItem[]>([]);
    const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setChats(MOCK_CHATS);
            setFilteredChats(MOCK_CHATS);
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        filterChats();
    }, [searchQuery, activeTab, chats]);

    const filterChats = () => {
        let filtered = chats;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(chat =>
                chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by unread
        if (activeTab === 'unread') {
            filtered = filtered.filter(chat => chat.unreadCount > 0);
        }

        setFilteredChats(filtered);
    };

    const getMessageIcon = (type: ChatItem['messageType']) => {
        switch (type) {
            case 'image':
                return <Ionicons name="image" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            case 'voice':
                return <Ionicons name="mic" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            case 'video':
                return <Ionicons name="videocam" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            default:
                return null;
        }
    };

    const renderChatItem = ({ item }: { item: ChatItem }) => (
        <TouchableOpacity
            onPress={() => {
                // Navigate to chat screen
                // navigation.navigate("ChatScreen", { chatId: item.id, name: item.name });
            }}
            className="flex-row items-center px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800"
        >
            {/* Avatar */}
            <View className="relative mr-3">
                <Image
                    source={{ uri: item.avatar }}
                    className="w-16 h-16 rounded-full"
                />
                {item.isOnline && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full dark:border-slate-900" />
                )}
            </View>

            {/* Chat Info */}
            <View className="flex-1 mr-2">
                <View className="flex-row items-center justify-between mb-1">
                    <Text
                        className="text-lg font-semibold text-sky-900 dark:text-slate-200"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text className="text-xs text-sky-600 dark:text-slate-500">
                        {item.timestamp}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    {getMessageIcon(item.messageType)}
                    <Text
                        className={`flex-1 text-sm ${
                            item.unreadCount > 0
                                ? 'font-semibold text-sky-700 dark:text-slate-300'
                                : 'text-sky-600 dark:text-slate-400'
                        }`}
                        numberOfLines={1}
                        style={{ marginLeft: item.messageType !== 'text' ? 6 : 0 }}
                    >
                        {item.lastMessage}
                    </Text>
                </View>
            </View>

            {/* Unread Badge */}
            {item.unreadCount > 0 && (
                <View className="items-center justify-center w-6 h-6 rounded-full bg-sky-500 dark:bg-blue-500">
                    <Text className="text-xs font-bold text-white">
                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const unreadCount = chats.filter(chat => chat.unreadCount > 0).length;

    return (
        <SafeAreaView className="flex-1 bg-blue-50 dark:bg-slate-950">
            <StatusBar hidden={false} />

            {/* Header */}
            <View className="px-4 pt-2 pb-4 bg-white dark:bg-slate-900">
                <View className="flex-row items-center justify-between mb-4">
                    {/* Logo and Title */}
                    <View className="flex-row items-center flex-1">
                        <Image
                            source={require("../../assets/icons/icon.png")}
                            className="w-12 h-12 mr-3"
                            resizeMode="contain"
                        />
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-sky-900 dark:text-slate-200">
                                Messages
                            </Text>
                            <Text className="text-sm text-sky-600 dark:text-slate-400">
                                {chats.length} conversations
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity className="p-2 mr-2 rounded-full bg-sky-100 dark:bg-slate-800">
                            <Ionicons name="search" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2 rounded-full bg-sky-100 dark:bg-slate-800"
                            onPress={() => {
                                // Navigate to settings or menu
                            }}
                        >
                            <Ionicons name="ellipsis-vertical" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center px-4 py-3 rounded-xl bg-sky-50 dark:bg-slate-800">
                    <Ionicons name="search" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search chats..."
                        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                        className="flex-1 ml-2 text-base text-sky-900 dark:text-slate-200"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabs */}
                <View className="flex-row mt-4">
                    <TouchableOpacity
                        onPress={() => setActiveTab('all')}
                        className={`flex-1 py-2 mr-2 rounded-lg ${
                            activeTab === 'all'
                                ? 'bg-sky-500 dark:bg-blue-500'
                                : 'bg-sky-100 dark:bg-slate-800'
                        }`}
                    >
                        <Text
                            className={`text-center font-semibold ${
                                activeTab === 'all'
                                    ? 'text-white'
                                    : 'text-sky-700 dark:text-slate-400'
                            }`}
                        >
                            All Chats
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('unread')}
                        className={`flex-1 py-2 rounded-lg ${
                            activeTab === 'unread'
                                ? 'bg-sky-500 dark:bg-blue-500'
                                : 'bg-sky-100 dark:bg-slate-800'
                        }`}
                    >
                        <View className="flex-row items-center justify-center">
                            <Text
                                className={`text-center font-semibold ${
                                    activeTab === 'unread'
                                        ? 'text-white'
                                        : 'text-sky-700 dark:text-slate-400'
                                }`}
                            >
                                Unread
                            </Text>
                            {unreadCount > 0 && (
                                <View
                                    className={`ml-2 px-2 py-0.5 rounded-full ${
                                        activeTab === 'unread'
                                            ? 'bg-white'
                                            : 'bg-sky-500 dark:bg-blue-500'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            activeTab === 'unread'
                                                ? 'text-sky-500 dark:text-blue-500'
                                                : 'text-white'
                                        }`}
                                    >
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat List */}
            {isLoading ? (
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    <Text className="mt-4 text-base text-sky-600 dark:text-slate-400">
                        Loading chats...
                    </Text>
                </View>
            ) : filteredChats.length === 0 ? (
                <View className="items-center justify-center flex-1 px-8">
                    <View className="items-center justify-center w-24 h-24 mb-4 rounded-full bg-sky-100 dark:bg-slate-800">
                        <Ionicons name="chatbubbles-outline" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </View>
                    <Text className="mb-2 text-xl font-bold text-center text-sky-900 dark:text-slate-200">
                        {searchQuery ? 'No chats found' : activeTab === 'unread' ? 'No unread messages' : 'No conversations yet'}
                    </Text>
                    <Text className="text-center text-sky-600 dark:text-slate-400">
                        {searchQuery
                            ? 'Try searching with different keywords'
                            : activeTab === 'unread'
                            ? 'All caught up! You have no unread messages'
                            : 'Start a conversation by tapping the button below'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => {
                    // Navigate to new chat screen
                    // navigation.navigate("NewChatScreen");
                }}
                className="absolute items-center justify-center w-16 h-16 rounded-full shadow-lg bottom-6 right-6 bg-sky-500 dark:bg-blue-500"
                style={{
                    shadowColor: isDark ? "#3b82f6" : "#0ea5e9",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <MaterialCommunityIcons name="message-plus" size={28} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}