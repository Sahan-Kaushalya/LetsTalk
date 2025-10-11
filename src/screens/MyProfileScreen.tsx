import {
    View, Text, TouchableOpacity, Image, StatusBar, ScrollView,
    TextInput, Modal, ActivityIndicator, Alert,
    ImageBackground
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useUserRegistration } from "../components/UserContext";
import "../../global.css";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useContext, useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { validateFirstName, validateLastName } from "../util/Validation";
import { useUserProfile } from "../hook/UseUserProfile";
import { updateProfile } from "../api/UserService";
import { AuthContext } from "../components/AuthProvider";
import { formatMemberSince, formatMessageTime } from "../util/DateFormatter";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'MyProfileScreen'>;

export default function MyProfileScreen() {
    const { applied } = useTheme();
    const { userData, setUserData } = useUserRegistration();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const userProfile = useUserProfile();
    const auth = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);


    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName);
            setLastName(userProfile.lastName);
            setAboutMe(userProfile.aboutMe || 'Hey there! I am using this app.');
            setProfileImage(userProfile.profileImage || 'https://i.pravatar.cc/150?img=1');
        }
    }, [userProfile]);

    const phoneNumber = userProfile?.contactNo;
    const joined = userProfile?.createdAt || new Date().toISOString();

    const pickImageFromGallery = async () => {
        setShowImageOptions(false);

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            setIsEditing(true);
        }
    };

    const takePhoto = async () => {
        setShowImageOptions(false);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Permission Denied",
                textBody: "Camera permission is required",
                autoClose: 2000,
                textBodyStyle: { fontSize: 15 },
            });
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            setIsEditing(true);
        }
    };

    const removePhoto = () => {
        setShowImageOptions(false);
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove your profile photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setProfileImage('https://ui-avatars.com/api/?name=' + firstName + '+' + lastName + '&size=200');
                        setIsEditing(true);
                    },
                },
            ]
        );
    };

    const validateAndSave = () => {
        const firstNameError = validateFirstName(firstName);
        if (firstNameError) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid First Name",
                textBody: firstNameError,
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return;
        }

        const lastNameError = validateLastName(lastName);
        if (lastNameError) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid Last Name",
                textBody: lastNameError,
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return;
        }


        if (!aboutMe || aboutMe.trim().length < 10) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid About",
                textBody: "About must be at least 10 characters",
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return;
        }

        if (aboutMe.trim().length > 350) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "About Too Long",
                textBody: "About must be less than 350 characters",
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return;
        }

        saveProfile();
    };

    const saveProfile = async () => {
        setIsLoading(true);

        try {

            const result = await updateProfile(
                String(auth ? auth.userId : 0),
                firstName.trim(),
                lastName.trim(),
                aboutMe.trim(),
                profileImage
            );

            if (result && result.status) {

                setUserData({
                    ...userData,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    aboutMe: aboutMe.trim(),
                    profileImage: profileImage,
                });

                setIsEditing(false);

                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Profile Updated",
                    textBody: result.message || "Your profile has been updated successfully",
                    autoClose: 2000,
                    textBodyStyle: { fontSize: 15 },
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Update Failed",
                    textBody: result?.message || "Failed to update profile",
                    autoClose: 2000,
                    textBodyStyle: { fontSize: 15 },
                });
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Error",
                textBody: "An error occurred while updating your profile. Please try again.",
                autoClose: 2000,
                textBodyStyle: { fontSize: 15 },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {

        if (userProfile) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setAboutMe(userProfile.aboutMe || 'Hey there! I am using this app.');
            setProfileImage(userProfile.profileImage || 'https://i.pravatar.cc/150?img=1');
        }
        setIsEditing(false);
    };

    if (!userProfile && !firstName) {
        return (
            <SafeAreaView className="items-center justify-center flex-1 bg-blue-50 dark:bg-slate-950">
                <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                <Text className="mt-4 text-base text-sky-900 dark:text-slate-200">
                    Loading profile...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-blue-50 dark:bg-slate-950">
            <StatusBar hidden={false} />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
                <TouchableOpacity
                    onPress={() => {
                        navigation.goBack();
                        setShowImageOptions(false);
                    }}
                    className="p-2 -ml-2"
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
                    My Profile
                </Text>
                {!isEditing ? (
                    <TouchableOpacity
                        onPress={() => setIsEditing(true)}
                        className="p-2 -mr-2"
                    >
                        <Ionicons name="create-outline" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </TouchableOpacity>
                ) : (
                    <View className="w-8" />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center py-5 bg-white dark:bg-slate-900">
                    <TouchableOpacity
                        onPress={() => isEditing && setShowImageOptions(true)}
                        disabled={!isEditing}
                    >
                        <View className="relative">
                            <Image
                                source={{ uri: profileImage }}
                                className="w-32 h-32 border-4 rounded-full border-sky-500 dark:border-blue-500"
                            />
                            {isEditing && (
                                <View className="absolute bottom-0 right-0 items-center justify-center w-10 h-10 rounded-full bg-sky-500 dark:bg-blue-500">
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    {isEditing && (
                        <Text className="mt-3 text-sm text-sky-600 dark:text-slate-400">
                            Tap to change photo
                        </Text>
                    )}

                </View>

                <View className="px-4 py-6">

                    <Text className="mb-4 text-base font-bold text-sky-900 dark:text-slate-200">
                        Personal Information
                    </Text>

                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                            First Name
                        </Text>
                        {isEditing ? (
                            <View className="flex-row items-center px-4 py-1 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-300 dark:border-slate-700">
                                <Ionicons name="person-outline" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                                <TextInput
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholder="Enter first name"
                                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                    maxLength={45}
                                    className="flex-1 ml-3 text-base text-sky-900 dark:text-slate-200"
                                />
                            </View>
                        ) : (
                            <View className="px-4 py-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                                <Text className="text-base font-medium text-sky-900 dark:text-slate-200">
                                    {firstName || 'Not set'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                            Last Name
                        </Text>
                        {isEditing ? (
                            <View className="flex-row items-center px-4 py-1 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-300 dark:border-slate-700">
                                <Ionicons name="person-outline" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                                <TextInput
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholder="Enter last name"
                                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                    maxLength={45}
                                    className="flex-1 ml-3 text-base text-sky-900 dark:text-slate-200"
                                />
                            </View>
                        ) : (
                            <View className="px-4 py-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                                <Text className="text-base font-medium text-sky-900 dark:text-slate-200">
                                    {lastName || 'Not set'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mb-6">
                        <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                            About Me
                        </Text>
                        {isEditing ? (
                            <View className="px-4 py-3 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-300 dark:border-slate-700">
                                <TextInput
                                    value={aboutMe}
                                    onChangeText={setAboutMe}
                                    placeholder="Tell us about yourself"
                                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={350}
                                    className="text-base text-sky-900 dark:text-slate-200"
                                    style={{ minHeight: 100, textAlignVertical: 'top' }}
                                />
                                <Text className="mt-2 text-xs text-right text-sky-600 dark:text-slate-500">
                                    {aboutMe.length}/350
                                </Text>
                            </View>
                        ) : (
                            <View className="px-4 py-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                                <Text className="text-base text-sky-900 dark:text-slate-200">
                                    {aboutMe || 'No bio yet'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="mb-4 text-base font-bold text-sky-900 dark:text-slate-200">
                        Contact Information
                    </Text>

                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                            Phone Number
                        </Text>
                        <View className="flex-row items-center px-4 py-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                            <Ionicons name="call" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                            <Text className="flex-1 ml-3 text-base font-medium text-sky-900 dark:text-slate-200">
                                {phoneNumber}
                            </Text>
                            <Text className="text-xs text-sky-600 dark:text-slate-500">Verified</Text>
                        </View>
                    </View>

                    <Text className="mb-4 text-base font-bold text-sky-900 dark:text-slate-200">
                        Additional Information
                    </Text>


                    <View className="mb-4">
                        <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                            Member Since
                        </Text>
                        <View className="flex-row items-center px-4 py-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                            <Ionicons name="calendar" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                            <Text className="ml-3 text-base font-medium text-sky-900 dark:text-slate-200">
                                {formatMemberSince(joined)}
                            </Text>
                        </View>
                    </View>

                    {isEditing && (
                        <View className="mt-6">
                            <TouchableOpacity
                                onPress={validateAndSave}
                                disabled={isLoading}
                                className="flex-row items-center justify-center w-full py-4 rounded-xl bg-sky-500 dark:bg-blue-500"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="white" />
                                        <Text className="ml-2 text-lg font-bold text-white">
                                            Save Changes
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={cancelEdit}
                                disabled={isLoading}
                                className="flex-row items-center justify-center w-full py-4 mt-3 border-2 rounded-xl border-sky-300 dark:border-slate-700"
                            >
                                <Text className="text-base font-semibold text-sky-700 dark:text-slate-300">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            </ScrollView>

            <Modal
                visible={showImageOptions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowImageOptions(false)}
            >
                <View className="items-center justify-end flex-1 bg-black/50">
                    <View className="w-full bg-white rounded-t-3xl dark:bg-slate-900">
                        <View className="items-center py-3 border-b border-sky-100 dark:border-slate-800">
                            <View className="w-12 h-1 rounded-full bg-sky-300 dark:bg-slate-600" />
                        </View>

                        <Text className="px-6 py-4 text-lg font-bold text-sky-900 dark:text-slate-200">
                            Change Profile Photo
                        </Text>

                        <TouchableOpacity
                            onPress={pickImageFromGallery}
                            className="flex-row items-center px-6 py-4 border-b border-sky-100 dark:border-slate-800"
                        >
                            <Ionicons name="images" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            <Text className="ml-4 text-base font-medium text-sky-900 dark:text-slate-200">
                                Choose from Gallery
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={takePhoto}
                            className="flex-row items-center px-6 py-4 border-b border-sky-100 dark:border-slate-800"
                        >
                            <Ionicons name="camera" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            <Text className="ml-4 text-base font-medium text-sky-900 dark:text-slate-200">
                                Take Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={removePhoto}
                            className="flex-row items-center px-6 py-4 border-b border-sky-100 dark:border-slate-800"
                        >
                            <Ionicons name="trash" size={24} color="#ef4444" />
                            <Text className="ml-4 text-base font-medium text-red-500">
                                Remove Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowImageOptions(false)}
                            className="px-6 py-4"
                        >
                            <Text className="text-base font-semibold text-center text-sky-600 dark:text-slate-400">
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <View className="pb-8" />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}