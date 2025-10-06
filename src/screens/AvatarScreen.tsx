import { Image, KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useUserRegistration } from "../components/UserContext";
import "../../global.css";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useState } from "react";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AvatarScreen'>;


const AVATAR_OPTIONS = [
    { id: 1, source: require("../../assets/avatars/avatar1.png") },
    { id: 2, source: require("../../assets/avatars/avatar2.png") },
    { id: 3, source: require("../../assets/avatars/avatar3.png") },
    { id: 4, source: require("../../assets/avatars/avatar4.png") },
    { id: 5, source: require("../../assets/avatars/avatar5.png") },
    { id: 6, source: require("../../assets/avatars/avatar6.png") },
    { id: 7, source: require("../../assets/avatars/avatar7.png") },
    { id: 8, source: require("../../assets/avatars/avatar8.png") },
];

export default function AvatarScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
    const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
    const { applied } = useTheme();
    const { userData, setUserData } = useUserRegistration();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setSelectedAvatar(null);
            setGeneratedAvatar(null);
            setUserData((previous) => ({
                ...previous,
                profileImage: result.assets[0].uri,
            }));
        }
    };

    const selectAvatar = (avatarId: number) => {
        const selectedAvatarOption = AVATAR_OPTIONS.find(a => a.id === avatarId);
        if (selectedAvatarOption) {
            const avatarUri = Image.resolveAssetSource(selectedAvatarOption.source).uri;

            setSelectedAvatar(avatarId);
            setImage(null);
            setGeneratedAvatar(null);
            setUserData((previous) => ({
                ...previous,
                profileImage: avatarUri,
            }));
        }
    }

    const generateRandomAvatar = () => {

        const randomSeed = Math.random().toString(36).substring(7);
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9,fcbade,ffdfbf,fffff0`;

        setGeneratedAvatar(avatarUrl);
        setImage(null);
        setSelectedAvatar(null);
        setUserData((previous) => ({
            ...previous,
            profileImage: avatarUrl,
        }));

        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Avatar Generated",
            textBody: "Your random avatar has been created!",
            autoClose: 2000,
            textBodyStyle: { fontSize: 15 },
        });
    };

    const getDisplayImage = () => {
        if (image) return { uri: image };
        if (generatedAvatar) return { uri: generatedAvatar };
        if (selectedAvatar) return AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.source;
        return require("../../assets/icons/user.png");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 100 : 100}
            className="flex-1 bg-blue-100 dark:bg-slate-900"
        >
            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    className="px-6"
                >
                    <StatusBar hidden={false} />


                    <View className="items-center mt-4">
                        <Image source={require("../../assets/icons/logo.png")} className="w-32 h-32" />
                    </View>


                    <View className="items-center mt-6">
                        <Text className="text-3xl font-bold text-center text-sky-900 dark:text-slate-200">
                            Choose Your Profile Picture
                        </Text>
                        <Text className="mt-2 text-base text-center text-sky-600 dark:text-slate-400">
                            Upload, select an avatar, or generate one
                        </Text>
                    </View>


                    <View className="items-center mt-8">
                        <View className="relative">
                            <Image
                                source={getDisplayImage()}
                                className="border-4 rounded-full w-36 h-36 border-sky-500 dark:border-blue-500"
                            />
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 p-2 rounded-full bg-sky-500 dark:bg-blue-500"
                                onPress={pickImage}
                            >
                                <Ionicons name="camera" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>


                    <TouchableOpacity
                        className="flex-row items-center justify-center w-full py-3 mt-6 border-2 rounded-xl border-sky-500 dark:border-blue-500"
                        onPress={pickImage}
                    >
                        <Ionicons name="cloud-upload-outline" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        <Text className="ml-2 text-base font-semibold text-sky-600 dark:text-blue-400">
                            Upload from Gallery
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-sky-300 dark:bg-slate-700" />
                        <Text className="px-4 text-sm text-sky-600 dark:text-slate-400">OR</Text>
                        <View className="flex-1 h-px bg-sky-300 dark:bg-slate-700" />
                    </View>

                    <Text className="mb-3 text-base font-semibold text-sky-900 dark:text-slate-200">
                        Choose an Avatar
                    </Text>
                    <View className="flex-row flex-wrap justify-between mb-6">
                        <FlatList
                            data={AVATAR_OPTIONS}
                            horizontal
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            renderItem={({ item: avatar }) => (
                                <TouchableOpacity
                                    onPress={() => selectAvatar(avatar.id)}
                                    className={`w-32 h-32 mr-4 rounded-2xl overflow-hidden ${selectedAvatar === avatar.id
                                        ? 'border-4 border-sky-500 dark:border-blue-500'
                                        : 'border-2 border-sky-200 dark:border-slate-700'
                                        }`}
                                >
                                    <Image
                                        source={avatar.source}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    {selectedAvatar === avatar.id && (
                                        <View className="absolute top-1 right-1 bg-sky-500 dark:bg-blue-500 rounded-full p-0.5">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>


                    <TouchableOpacity
                        className="flex-row items-center justify-center w-full py-3 mb-6 border-2 border-dashed rounded-xl border-sky-400 dark:border-blue-400"
                        onPress={generateRandomAvatar}
                    >
                        <Ionicons name="shuffle-outline" size={24} color={isDark ? "#60a5fa" : "#0ea5e9"} />
                        <Text className="ml-2 text-base font-semibold text-sky-600 dark:text-blue-400">
                            Generate Random Avatar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center w-full py-4 mb-4 rounded-xl bg-sky-500 dark:bg-blue-500"
                        onPress={() => {
                            if (!image && !selectedAvatar && !generatedAvatar) {
                                Toast.show({
                                    type: ALERT_TYPE.WARNING,
                                    title: "No Profile Image",
                                    textBody: "Please select or upload a profile image",
                                    autoClose: 2500,
                                    textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
                                });
                                return;
                            }else{
                                navigation.replace("MobileScreen");
                            }
                        }}
                    >
                        <Text className="text-lg font-bold text-center text-white">
                            Continue
                        </Text>
                        <MaterialIcons className="ml-2" name="keyboard-arrow-right" size={24} color="white" />
                    </TouchableOpacity>

                  
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}