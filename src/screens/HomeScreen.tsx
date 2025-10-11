import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, TextInput, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useUserRegistration } from "../components/UserContext";
import "../../global.css";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import { ChatItem } from "../interface/LetsTalkChats";
import { useChatList } from "../hook/UseChatList";
import { formatChatTime } from "../util/DateFormatter";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { AuthContext } from "../components/AuthProvider";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;


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
    const [showMenu, setShowMenu] = useState(false);
    const chatList = useChatList();
    const auth = useContext(AuthContext);

    const handleLogout = () => {
        Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Logout',
            textBody: 'Are you sure you want to logout?',
            button: 'Cancel',
            autoClose: false,
            onPressButton: () => {
                Dialog.hide();
            },
        });

        setTimeout(() => {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Confirm Logout',
                textBody: 'Please confirm to logout.',
                button: 'Logout',
                onPressButton: async () => {
                    Dialog.hide();
                    await auth?.signOut();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'WelcomeScreen' }],
                    });
                },
            });
        }, 100);
    };

    useEffect(() => {
        setTimeout(() => {

            const sortedChats = [...chatList].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setChats(sortedChats);
            setFilteredChats(sortedChats);
            setIsLoading(false);
        }, 2000);
    }, [chatList, navigation]);

    useEffect(() => {
        filterChats();
    }, [searchQuery, activeTab, chats]);

    const filterChats = () => {
        let filtered = chats;

        if (searchQuery.trim()) {
            filtered = filtered.filter(chat =>
                chat.friendName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeTab === 'unread') {
            filtered = filtered.filter(chat => chat.unreadCount > 0);
        }

        filtered = filtered.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setFilteredChats(filtered);
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'IMAGE':
                return <Ionicons name="image" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            case 'VOICE':
                return <Ionicons name="mic" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            case 'VIDEO':
                return <Ionicons name="videocam" size={14} color={isDark ? "#94a3b8" : "#64748b"} />;
            default:
                return null;
        }
    };

    // Get message status icon - only show if unreadCount is 0 (meaning user sent the last message)
    const getMessageStatusIcon = (status: string, unreadCount: number) => {
        // Only show status if there are no unread messages (meaning user sent the last message)
        if (unreadCount > 0) return null;
        if (!status) return null;

        switch (status) {
            case 'SENT':
                return <Ionicons name="checkmark" size={16} color={isDark ? "#94a3b8" : "#64748b"} style={{ marginLeft: 4 }} />;
            case 'DELIVERED':
                return <Ionicons name="checkmark-done" size={16} color={isDark ? "#94a3b8" : "#64748b"} style={{ marginLeft: 4 }} />;
            case 'READ':
                return <Ionicons name="checkmark-done" size={16} color="#0ea5e9" style={{ marginLeft: 4 }} />;
            default:
                return null;
        }
    };

    const renderChatItem = ({ item }: { item: ChatItem }) => {
        // Use default image if profileImage is null, undefined, or empty
        const profileImageUri = item.profileImage && item.profileImage.trim() !== ''
            ? item.profileImage
            : process.env.EXPO_PUBLIC_DEFAULT_PROFILE_IMAGE;

        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate("ChatScreen", {
                        chatId: Number(item.friendId),
                        name: item.friendName,
                        isOnline: item.isOnline ? "true" : "false",
                        avatar: item.profileImage && item.profileImage.trim() !== ''
                            ? item.profileImage
                            : process.env.EXPO_PUBLIC_DEFAULT_PROFILE_IMAGE,
                    });
                }}
                className="flex-row items-center px-4 py-3 bg-white border-b dark:bg-slate-900 border-sky-100 dark:border-slate-800"
            >
                {/* Avatar */}
                <View className="relative mr-3">
                    <Image
                        source={{ uri: profileImageUri }}
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
                            {item.friendName}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-xs text-sky-600 dark:text-slate-500">
                                {formatChatTime(item.timestamp)}
                            </Text>
                            {/* Unread Badge next to timestamp */}
                            {item.unreadCount > 0 && (
                                <View className="items-center justify-center w-5 h-5 ml-2 rounded-full bg-sky-500 dark:bg-blue-500">
                                    <Text className="text-xs font-bold text-white">
                                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        {getMessageIcon(item.messageType)}
                        <Text
                            className={`flex-1 text-sm ${item.unreadCount > 0
                                ? 'font-semibold text-sky-700 dark:text-slate-300'
                                : 'text-sky-600 dark:text-slate-400'
                                }`}
                            numberOfLines={1}
                            style={{ marginLeft: item.messageType !== 'text' ? 6 : 0 }}
                        >
                            {item.lastMessage}
                        </Text>
                        {/* Message status */}
                        {getMessageStatusIcon(item.messageStatus, item.unreadCount)}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
                            onPress={() => setShowMenu(!showMenu)}
                        >
                            <Ionicons name="ellipsis-vertical" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dropdown Menu */}
                {showMenu && (
                    <View className="absolute z-50 overflow-hidden bg-white rounded-lg shadow-lg right-4 top-16 w-44 dark:bg-slate-800">
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-sky-100 dark:border-slate-700"
                            onPress={() => {
                                setShowMenu(false);

                                navigation.navigate("SettingScreen");
                            }}
                        >
                            <Ionicons name="settings-outline" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text className="ml-3 text-base text-sky-900 dark:text-slate-200">
                                Settings
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={() => {
                                setShowMenu(false);
                                handleLogout();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            <Text className="ml-3 text-base text-red-500">
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

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
                        className={`flex-1 py-2 mr-2 rounded-lg ${activeTab === 'all'
                            ? 'bg-sky-500 dark:bg-blue-500'
                            : 'bg-sky-100 dark:bg-slate-800'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${activeTab === 'all'
                                ? 'text-white'
                                : 'text-sky-700 dark:text-slate-400'
                                }`}
                        >
                            All Chats
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('unread')}
                        className={`flex-1 py-2 rounded-lg ${activeTab === 'unread'
                            ? 'bg-sky-500 dark:bg-blue-500'
                            : 'bg-sky-100 dark:bg-slate-800'
                            }`}
                    >
                        <View className="flex-row items-center justify-center">
                            <Text
                                className={`text-center font-semibold ${activeTab === 'unread'
                                    ? 'text-white'
                                    : 'text-sky-700 dark:text-slate-400'
                                    }`}
                            >
                                Unread
                            </Text>
                            {unreadCount > 0 && (
                                <View
                                    className={`ml-2 px-2 py-0.5 rounded-full ${activeTab === 'unread'
                                        ? 'bg-white'
                                        : 'bg-sky-500 dark:bg-blue-500'
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${activeTab === 'unread'
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
                    keyExtractor={(item) => item.friendId}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}

            {showMenu && (
                <TouchableOpacity
                    className="absolute inset-0 bg-transparent"
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => {

                    navigation.navigate("ContactListScreen");
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