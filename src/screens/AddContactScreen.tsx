import { View, Text, TouchableOpacity, Image, StatusBar, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useState, useEffect } from "react";
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { validateFirstName, validatePhoneByCountry, validateCountryCode } from "../util/Validation";
import { useSendNewContact } from "../hook/UseSendNewContact";


type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AddContactScreen'>;


export default function AddContactScreen() {
    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    const { sendNewContact, responseText } = useSendNewContact();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState<CountryCode>('LK');
    const [callingCode, setCallingCode] = useState('94');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
     

    useEffect(() => {
        if (responseText) {
            setIsLoading(false);

            if (responseText.responseStatus) {
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            }
        }
    }, [responseText]);

    const onSelectCountry = (selectedCountry: Country) => {
        setCountryCode(selectedCountry.cca2);
        setCallingCode(selectedCountry.callingCode[0]);
        setPhoneNumber('');
    };

    const formatPhoneNumber = (text: string) => {
        let cleaned = text.replace(/[^0-9]/g, '');
        return cleaned;
    };

    const validateForm = (): boolean => {

        const firstNameError = validateFirstName(firstName);
        if (firstNameError) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid First Name",
                textBody: firstNameError,
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return false;
        }

        const countryCodeError = validateCountryCode(`+${callingCode}`);
        if (countryCodeError) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid Country Code",
                textBody: countryCodeError,
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return false;
        }

        const phoneError = validatePhoneByCountry(phoneNumber, callingCode);
        if (phoneError) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid Phone Number",
                textBody: phoneError,
                autoClose: 2500,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return false;
        }

        return true;
    };

    const saveContact = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        const newContact = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            countryCode: `+${callingCode}`,
            contactNo: phoneNumber,
        };

        sendNewContact(newContact);
    };

    const getPlaceholder = () => {
        if (callingCode === '94') return '0712345678';
        if (callingCode === '1') return '2025551234';
        if (callingCode === '44') return '7911123456';
        return '1234567890';
    };

    const getMaxLength = () => {
        if (callingCode === '94') return 10;
        if (callingCode === '1') return 10;
        if (callingCode === '44') return 10;
        return 15;
    };

    return (
        <SafeAreaView className="flex-1 bg-blue-50 dark:bg-slate-950">
            <StatusBar hidden={false} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "android" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="p-2 -ml-2"
                        >
                            <Ionicons name="close" size={28} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
                            Add New Contact
                        </Text>
                        <View className="w-10" />
                    </View>

                    <View className="px-4 py-6 mt-4">

                        <Text className="mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
                            Personal Information
                        </Text>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                                First Name *
                            </Text>
                            <View className="flex-row items-center px-4 py-2 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-200 dark:border-slate-700">
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
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                                Last Name
                            </Text>
                            <View className="flex-row items-center px-4 py-2 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-200 dark:border-slate-700">
                                <Ionicons name="person-outline" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                                <TextInput
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholder="Enter last name (optional)"
                                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                    maxLength={45}
                                    className="flex-1 ml-3 text-base text-sky-900 dark:text-slate-200"
                                />
                            </View>
                        </View>

                        <Text className="mt-6 mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
                            Contact Details
                        </Text>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                                Phone Number *
                            </Text>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => setShowCountryPicker(true)}
                                    className="flex-row items-center px-4 py-4 mr-2 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-200 dark:border-slate-700"
                                >
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        withEmoji
                                        onSelect={onSelectCountry}
                                        visible={showCountryPicker}
                                        onClose={() => setShowCountryPicker(false)}
                                        theme={isDark ? {
                                            backgroundColor: '#1e293b',
                                            onBackgroundTextColor: '#e2e8f0',
                                            fontSize: 16,
                                            filterPlaceholderTextColor: '#94a3b8',
                                        } : undefined}
                                    />
                                    <Text className="ml-2 text-base font-semibold text-sky-900 dark:text-slate-200">
                                        +{callingCode}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                                </TouchableOpacity>

                                <View className="flex-row items-center flex-1 px-4 py-3 bg-white border-2 rounded-xl dark:bg-slate-900 border-sky-200 dark:border-slate-700">
                                    <Ionicons name="call-outline" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                                    <TextInput
                                        value={phoneNumber}
                                        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                        placeholder={getPlaceholder()}
                                        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                        keyboardType="phone-pad"
                                        maxLength={getMaxLength()}
                                        className="flex-1 ml-3 text-base text-sky-900 dark:text-slate-200"
                                    />
                                </View>
                            </View>
                            {phoneNumber && (
                                <Text className="mt-2 text-xs text-sky-600 dark:text-slate-500">
                                    Full number: {callingCode === '94'
                                        ? `+${callingCode} ${phoneNumber}`
                                        : `+${callingCode}${phoneNumber}`
                                    }
                                </Text>
                            )}
                        </View>

                        <View className="flex-row p-4 mb-4 rounded-xl bg-sky-50 dark:bg-slate-800">
                            <Ionicons name="information-circle" size={24} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-sky-900 dark:text-slate-200">
                                    Note
                                </Text>
                                <Text className="mt-1 text-xs text-sky-700 dark:text-slate-400">
                                    If this number is not registered, you can invite them to join the app.
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={saveContact}
                            disabled={isLoading}
                            className="flex-row items-center justify-center w-full py-4 mt-4 rounded-xl bg-sky-500 dark:bg-blue-500"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={24} color="white" />
                                    <Text className="ml-2 text-lg font-bold text-white">
                                        Save Contact
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                            className="flex-row items-center justify-center w-full py-4 mt-3 border-2 rounded-xl border-sky-300 dark:border-slate-700"
                        >
                            <Text className="text-base font-semibold text-sky-700 dark:text-slate-300">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}