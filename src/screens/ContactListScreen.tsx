import { View, Text, TouchableOpacity, SectionList, Image, StatusBar, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useUserFriendList } from "../hook/UseUserFriendList";
import { UserDTo } from "../interface/LetsTalkChats";
import { formatLastSeen } from "../util/DateFormatter";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ContactListScreen'>;

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    avatar: string;
    isOnline: boolean;
    about?: string;
    lastSeen?: string;
}

interface ContactSection {
    title: string;
    data: Contact[];
}

export default function ContactListScreen() {
    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const users = useUserFriendList();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactSection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        if (users && users.length > 0) {
            const mappedContacts: Contact[] = users.map((user: UserDTo) => ({
                id: user.id.toString(),
                name: user.displayName,
                phoneNumber: `${user.countryCode}${user.contactNo}`,
                avatar: user.profileImage || process.env.EXPO_PUBLIC_DEFAULT_PROFILE_IMAGE,
                isOnline: user.isOnline === 'true',
                about: user.aboutMe || undefined,
                lastSeen: user.updatedAt,
            }));
            setContacts(mappedContacts);
            organizeContacts(mappedContacts, searchQuery);
            setIsLoading(false);
        } else if (users.length === 0) {
            setContacts([]);
            setFilteredContacts([]);
            setIsLoading(false);
        }
    }, [users,navigation]);

    useEffect(() => {
        organizeContacts(contacts, searchQuery);
    }, [searchQuery]);

    const organizeContacts = (contactList: Contact[], query: string) => {
        let filtered = contactList;

        if (query.trim()) {
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(query.toLowerCase()) ||
                contact.phoneNumber.includes(query)
            );
        }

        filtered.sort((a, b) => a.name.localeCompare(b.name));

        const grouped: { [key: string]: Contact[] } = {};
        filtered.forEach(contact => {
            const firstLetter = contact.name[0].toUpperCase();
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = [];
            }
            grouped[firstLetter].push(contact);
        });

        const sections: ContactSection[] = Object.keys(grouped)
            .sort()
            .map(letter => ({
                title: letter,
                data: grouped[letter],
            }));

        setFilteredContacts(sections);
    };

    const toggleContactSelection = (contactId: string) => {
        if (selectedContacts.includes(contactId)) {
            setSelectedContacts(selectedContacts.filter(id => id !== contactId));
        } else {
            setSelectedContacts([...selectedContacts, contactId]);
        }
    };

    const startChat = (contact: Contact) => {
        if (isSelectionMode) {
            toggleContactSelection(contact.id);
        } else {
            
            navigation.navigate("ChatScreen", {
                chatId: Number(contact.id),
                name: contact.name,
                isOnline: contact.isOnline ? "true" : "false",
                avatar: contact.avatar,
            });
            console.log('Start chat with:', contact.name, 'ID:', contact.id);
        }
    };

    const createGroupChat = () => {
        if (selectedContacts.length < 2) {
            alert('Select at least 2 contacts to create a group');
            return;
        }
        // Navigate to create group screen with selected contact IDs
        // navigation.navigate("CreateGroupScreen", { selectedContactIds: selectedContacts });
        console.log('Create group with contact IDs:', selectedContacts);
        setIsSelectionMode(false);
        setSelectedContacts([]);
    };

    const renderContact = ({ item }: { item: Contact }) => {
        const isSelected = selectedContacts.includes(item.id);
        const lastSeenText = formatLastSeen(item.lastSeen);

        return (
            <TouchableOpacity
                onPress={() => startChat(item)}
                onLongPress={() => {
                    setIsSelectionMode(true);
                    toggleContactSelection(item.id);
                }}
                className={`flex-row items-center px-4 py-3 ${
                    isSelected ? 'bg-sky-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'
                }`}
            >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                    <View className="mr-3">
                        <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                isSelected
                                    ? 'bg-sky-500 dark:bg-blue-500 border-sky-500 dark:border-blue-500'
                                    : 'border-sky-300 dark:border-slate-600'
                            }`}
                        >
                            {isSelected && (
                                <Ionicons name="checkmark" size={16} color="white" />
                            )}
                        </View>
                    </View>
                )}

                {/* Avatar */}
                <View className="relative mr-3">
                    <Image
                        source={{ uri: item.avatar }}
                        className="w-12 h-12 rounded-full"
                    />
                    {item.isOnline && (
                        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full dark:border-slate-900" />
                    )}
                </View>

                {/* Contact Info */}
                <View className="flex-1">
                    <Text
                        className="text-base font-semibold text-sky-900 dark:text-slate-200"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text
                        className="text-sm text-sky-600 dark:text-slate-400"
                        numberOfLines={1}
                    >
                        {item.isOnline 
                            ? (item.about || 'Online') 
                            : (lastSeenText ? `Last seen ${lastSeenText}` : (item.about || 'Offline'))
                        }
                    </Text>
                </View>

                {/* Action Icon */}
                {!isSelectionMode && (
                    <TouchableOpacity
                        onPress={() => startChat(item)}
                        className="p-2"
                    >
                        <Ionicons
                            name="chatbubble-ellipses"
                            size={22}
                            color={isDark ? "#3b82f6" : "#0ea5e9"}
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }: { section: ContactSection }) => (
        <View className="px-4 py-2 bg-sky-50 dark:bg-slate-800">
            <Text className="text-sm font-bold text-sky-700 dark:text-slate-300">
                {section.title}
            </Text>
        </View>
    );

    const onlineCount = contacts.filter(c => c.isOnline).length;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <StatusBar hidden={false} />

            {/* Header */}
            <View className="px-4 pt-2 pb-4 bg-white dark:bg-slate-900">
                <View className="flex-row items-center justify-between mb-4">
                    {/* Back Button & Title */}
                    <View className="flex-row items-center flex-1">
                        {!isSelectionMode ? (
                            <>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    className="p-2 mr-2 -ml-2"
                                >
                                    <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                                </TouchableOpacity>
                                <View>
                                    <Text className="text-2xl font-bold text-sky-900 dark:text-slate-200">
                                        Contacts
                                    </Text>
                                    <Text className="text-sm text-sky-600 dark:text-slate-400">
                                        {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} • {onlineCount} online
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsSelectionMode(false);
                                        setSelectedContacts([]);
                                    }}
                                    className="p-2 mr-2 -ml-2"
                                >
                                    <Ionicons name="close" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                                </TouchableOpacity>
                                <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
                                    {selectedContacts.length} selected
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Action Buttons */}
                    {!isSelectionMode ? (
                        <View className="flex-row items-center">
                            <TouchableOpacity 
                                className="p-2 mr-2 rounded-full bg-sky-100 dark:bg-slate-800"
                                onPress={() => {
                                   navigation.navigate("AddContactScreen");
                                }}
                            >
                                <Ionicons name="person-add" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="p-2 rounded-full bg-sky-100 dark:bg-slate-800"
                                onPress={() => {
                                    // More options
                                }}
                            >
                                <Ionicons name="ellipsis-vertical" size={22} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={createGroupChat}
                            disabled={selectedContacts.length < 2}
                            className={`px-4 py-2 rounded-full ${
                                selectedContacts.length >= 2
                                    ? 'bg-sky-500 dark:bg-blue-500'
                                    : 'bg-sky-200 dark:bg-slate-700'
                            }`}
                        >
                            <Text className={`font-semibold ${
                                selectedContacts.length >= 2 ? 'text-white' : 'text-sky-400 dark:text-slate-500'
                            }`}>
                                Create Group
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center px-4 py-3 rounded-xl bg-sky-50 dark:bg-slate-800">
                    <Ionicons name="search" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search contacts..."
                        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                        className="flex-1 ml-2 text-base text-sky-900 dark:text-slate-200"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            {!isSelectionMode && contacts.length > 0 && (
                <View className="bg-white dark:bg-slate-900">
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-sky-100 dark:border-slate-800"
                        onPress={() => {
                            setIsSelectionMode(true);
                        }}
                    >
                        <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-sky-500 dark:bg-blue-500">
                            <Ionicons name="people" size={24} color="white" />
                        </View>
                        <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                            New Group
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-sky-100 dark:border-slate-800"
                        onPress={() => {
                            navigation.navigate("AddContactScreen");
                        }}
                    >
                        <View className="items-center justify-center w-12 h-12 mr-3 bg-green-500 rounded-full">
                            <Ionicons name="person-add" size={24} color="white" />
                        </View>
                        <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                            Add New Contact
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Contacts List */}
            {isLoading ? (
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    <Text className="mt-4 text-base text-sky-600 dark:text-slate-400">
                        Loading contacts...
                    </Text>
                </View>
            ) : filteredContacts.length === 0 ? (
                <View className="items-center justify-center flex-1 px-8">
                    <View className="items-center justify-center w-24 h-24 mb-4 rounded-full bg-sky-100 dark:bg-slate-800">
                        <Ionicons name="people-outline" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </View>
                    <Text className="mb-2 text-xl font-bold text-center text-sky-900 dark:text-slate-200">
                        {searchQuery ? 'No contacts found' : 'No contacts yet'}
                    </Text>
                    <Text className="text-center text-sky-600 dark:text-slate-400">
                        {searchQuery
                            ? 'Try searching with different keywords'
                            : 'Add contacts to start chatting with friends'}
                    </Text>
                    {!searchQuery && (
                        <TouchableOpacity
                            className="px-6 py-3 mt-6 rounded-full bg-sky-500 dark:bg-blue-500"
                            onPress={() => {
                                navigation.navigate("AddContactScreen");
                            }}
                        >
                            <Text className="font-semibold text-white">
                                Add Contact
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <SectionList
                    sections={filteredContacts}
                    renderItem={renderContact}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={true}
                />
            )}
        </SafeAreaView>
    );
}