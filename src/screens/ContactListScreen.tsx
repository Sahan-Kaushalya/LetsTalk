import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, TextInput, SectionList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

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

// Mock contacts data
const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        name: 'Amila Jayasinghe',
        phoneNumber: '+94712345678',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isOnline: true,
        about: 'Hey there! I am using this app.',
    },
    {
        id: '2',
        name: 'Buddhika Silva',
        phoneNumber: '+94723456789',
        avatar: 'https://i.pravatar.cc/150?img=3',
        isOnline: false,
        about: 'Busy',
        lastSeen: '2 hours ago',
    },
    {
        id: '3',
        name: 'Chamari Fernando',
        phoneNumber: '+94734567890',
        avatar: 'https://i.pravatar.cc/150?img=5',
        isOnline: true,
        about: 'Available',
    },
    {
        id: '4',
        name: 'Dilshan Perera',
        phoneNumber: '+94745678901',
        avatar: 'https://i.pravatar.cc/150?img=7',
        isOnline: false,
        lastSeen: 'yesterday',
    },
    {
        id: '5',
        name: 'Kasun Rajapaksha',
        phoneNumber: '+94756789012',
        avatar: 'https://i.pravatar.cc/150?img=8',
        isOnline: true,
        about: 'At work',
    },
    {
        id: '6',
        name: 'Nimali Wijesinghe',
        phoneNumber: '+94767890123',
        avatar: 'https://i.pravatar.cc/150?img=9',
        isOnline: false,
        lastSeen: '5 minutes ago',
    },
    {
        id: '7',
        name: 'Prasad Gunasekara',
        phoneNumber: '+94778901234',
        avatar: 'https://i.pravatar.cc/150?img=12',
        isOnline: true,
    },
    {
        id: '8',
        name: 'Rashmi Kumari',
        phoneNumber: '+94789012345',
        avatar: 'https://i.pravatar.cc/150?img=16',
        isOnline: false,
        lastSeen: '3 days ago',
    },
    {
        id: '9',
        name: 'Sandun Weerasinghe',
        phoneNumber: '+94790123456',
        avatar: 'https://i.pravatar.cc/150?img=20',
        isOnline: true,
    },
    {
        id: '10',
        name: 'Tharushi Mendis',
        phoneNumber: '+94701234567',
        avatar: 'https://i.pravatar.cc/150?img=24',
        isOnline: false,
        lastSeen: '1 hour ago',
    },
];

export default function ContactListScreen() {
    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactSection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setContacts(MOCK_CONTACTS);
            organizeContacts(MOCK_CONTACTS, '');
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        organizeContacts(contacts, searchQuery);
    }, [searchQuery, contacts]);

    const organizeContacts = (contactList: Contact[], query: string) => {
        let filtered = contactList;

        // Filter by search query
        if (query.trim()) {
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(query.toLowerCase()) ||
                contact.phoneNumber.includes(query)
            );
        }

        // Sort alphabetically
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        // Group by first letter
        const grouped: { [key: string]: Contact[] } = {};
        filtered.forEach(contact => {
            const firstLetter = contact.name[0].toUpperCase();
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = [];
            }
            grouped[firstLetter].push(contact);
        });

        // Convert to section list format
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
            // Navigate to chat screen
            // navigation.navigate("ChatScreen", {
            //     chatId: contact.id,
            //     name: contact.name,
            //     avatar: contact.avatar,
            //     isOnline: contact.isOnline,
            // });
        }
    };

    const createGroupChat = () => {
        if (selectedContacts.length < 2) {
            alert('Select at least 2 contacts to create a group');
            return;
        }
        // Navigate to create group screen
        // navigation.navigate("CreateGroupScreen", { selectedContacts });
        console.log('Create group with:', selectedContacts);
    };

    const renderContact = ({ item }: { item: Contact }) => {
        const isSelected = selectedContacts.includes(item.id);

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
                        {item.about || item.lastSeen ? (item.about || `Last seen ${item.lastSeen}`) : item.phoneNumber}
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
                                        {contacts.length} contacts • {onlineCount} online
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
                            <TouchableOpacity className="p-2 mr-2 rounded-full bg-sky-100 dark:bg-slate-800">
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
                            <Text className="font-semibold text-white">
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
            {!isSelectionMode && (
                <View className="bg-white dark:bg-slate-900">
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-sky-100 dark:border-slate-800"
                        onPress={() => {
                            // Navigate to create group
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
                            // Navigate to add contact
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
                            : 'Add contacts to start chatting'}
                    </Text>
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