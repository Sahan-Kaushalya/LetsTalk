import { KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View, TextInput, Modal, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import "../../global.css";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useState, useRef, useContext } from "react";
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { validatePhoneByCountry, validateCountryCode } from "../util/Validation";
import { AuthContext } from "../components/AuthProvider";
import { verifyUserMobile } from "../api/UserLoginService";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'SignInScreen'>;

export default function SignInScreen() {
    const [countryCode, setCountryCode] = useState<CountryCode>('LK');
    const [country, setCountry] = useState<Country | null>(null);
    const [callingCode, setCallingCode] = useState('94');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [serverVCode, setServerVCode] = useState('');
    const [userId, setUserId] = useState('');

    const { applied } = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";
    const auth = useContext(AuthContext);

    const otpRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const onSelectCountry = (selectedCountry: Country) => {
        setCountryCode(selectedCountry.cca2);
        setCountry(selectedCountry);
        setCallingCode(selectedCountry.callingCode[0]);
        setPhoneNumber('');
    };

    const validatePhoneNumber = () => {
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
                title: callingCode === '94' ? "Invalid Sri Lankan Number" : "Invalid Phone Number",
                textBody: phoneError,
                autoClose: 2500,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return false;
        }

        return true;
    };

    const sendVerificationCode = async () => {
        if (!validatePhoneNumber()) return;

        setIsLoading(true);

        try {

            const response = await verifyUserMobile(phoneNumber, callingCode);

            if (response.status) {
                setServerVCode(response.vcode);
                setUserId(response.userId);

                setShowVerificationModal(true);

                const displayNumber = callingCode === '94'
                    ? `+${callingCode} ${phoneNumber}`
                    : `+${callingCode}${phoneNumber}`;

                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Code Sent",
                    textBody: `Verification code sent to ${displayNumber}`,
                    autoClose: 3000,
                    textBodyStyle: { fontSize: 15 },
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "WARNING",
                    textBody: response.message,
                    autoClose: 3000,
                    textBodyStyle: { fontSize: 15 },
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Error",
                textBody: "Something went wrong. Try again later.",
                autoClose: 3000,
                textBodyStyle: { fontSize: 15 },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        if (value && index < 5) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !verificationCode[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const verifyCode = async () => {
        const enteredCode = verificationCode.join('');

        if (enteredCode.length !== 6) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid Code",
                textBody: "Please enter the 6-digit verification code",
                autoClose: 2000,
                textBodyStyle: { fontSize: 17, fontWeight: 'semibold' },
            });
            return;
        }

        if (enteredCode === serverVCode) {
            setShowVerificationModal(false);
            setIsSigningIn(true);

            try {
        
                const response = {
                    status: true,
                    userId: userId,
                    message: 'Sign in successful'
                };

                if (response.status) {
                    const userId = response.userId;
                    
                    if (auth) {
                        await auth.signUp(String(userId));
                    }
                    
                    navigation.replace("HomeScreen");
                } else {
                    Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: "WARNING",
                        textBody: response.message,
                        autoClose: 2000,
                        textBodyStyle: { fontSize: 15 },
                    });
                }
            } catch (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: "Failed to sign in. Please try again.",
                    autoClose: 3000,
                    textBodyStyle: { fontSize: 15 },
                });
            } finally {
                setIsSigningIn(false);
            }
        } else {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Wrong Code",
                textBody: "The verification code you entered is incorrect.",
                autoClose: 2000,
                textBodyStyle: { fontSize: 15 },
            });
        }
    };

    const resendCode = async () => {
        setVerificationCode(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();

        await sendVerificationCode();

        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Code Sent",
            textBody: "New verification code has been sent",
            autoClose: 2000,
            textBodyStyle: { fontSize: 15 },
        });
    };

    const getPlaceholder = () => {
        if (callingCode === '94') return '712345678';
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

    const getHintText = () => {
        if (callingCode === '94') return 'Enter 9 digits starting with 7X (e.g., 712345678)';
        return 'Enter your phone number';
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={100}
            className="flex-1 bg-blue-100 dark:bg-slate-900"
        >
            <SafeAreaView className="flex-1 px-6">
                <StatusBar hidden={false} />

                <View className="items-center mt-6 mb-6">
                    <Image source={require("../../assets/icons/logo.png")} className="w-32 h-32" />
                </View>

                <View className="items-center mt-8">
                    <View className="items-center justify-center w-24 h-24 rounded-full bg-sky-200 dark:bg-slate-800">
                        <Ionicons name="log-in" size={48} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                    </View>
                    <Text className="mt-6 text-3xl font-bold text-center text-sky-900 dark:text-slate-200">
                        Welcome Back
                    </Text>
                    <Text className="mt-3 text-base text-center text-sky-600 dark:text-slate-400">
                        Sign in with your phone number
                    </Text>
                </View>

                <View className="mt-12">
                    <Text className="mb-2 text-sm font-semibold text-sky-900 dark:text-slate-300">
                        Phone Number
                    </Text>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => setShowCountryPicker(true)}
                            className="flex-row items-center px-4 py-3 mr-2 bg-white border-2 rounded-xl dark:bg-slate-800 border-sky-300 dark:border-slate-700"
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
                            <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
                        </TouchableOpacity>

                        <View className="flex-1">
                            <TextInput
                                value={phoneNumber}
                                onChangeText={(text) => setPhoneNumber(text)}
                                placeholder={getPlaceholder()}
                                placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                                keyboardType="phone-pad"
                                maxLength={getMaxLength()}
                                className="px-4 py-4 text-base font-semibold bg-white border-2 rounded-xl dark:bg-slate-800 border-sky-300 dark:border-slate-700 text-sky-900 dark:text-slate-200"
                            />
                        </View>
                    </View>

                    <Text className="mt-2 text-xs text-sky-600 dark:text-slate-500">
                        {getHintText()}
                    </Text>

                    {phoneNumber && (
                        <View className="p-3 mt-3 rounded-lg bg-sky-50 dark:bg-slate-800">
                            <Text className="text-xs font-medium text-sky-700 dark:text-slate-400">
                                Full Number:
                            </Text>
                            <Text className="text-sm font-bold text-sky-900 dark:text-slate-200">
                                {callingCode === '94'
                                    ? `+${callingCode} ${phoneNumber}`
                                    : `+${callingCode}${phoneNumber}`
                                }
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-center w-full py-4 mt-8 rounded-xl bg-sky-500 dark:bg-blue-500"
                    onPress={sendVerificationCode}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-lg font-bold text-center text-white">
                                Send Verification Code
                            </Text>
                            <MaterialIcons className="ml-2" name="keyboard-arrow-right" size={24} color="white" />
                        </>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-sm text-sky-800 dark:text-slate-400">
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.replace("WelcomeScreen")}>
                        <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Modal
                visible={showVerificationModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVerificationModal(false)}
            >
                <View className="items-center justify-center flex-1 bg-black/50">
                    <View className="w-11/12 p-6 bg-white rounded-3xl dark:bg-slate-800">
                        <TouchableOpacity
                            onPress={() => setShowVerificationModal(false)}
                            className="absolute z-10 top-4 right-4"
                        >
                            <Ionicons name="close-circle" size={32} color={isDark ? "#94a3b8" : "#64748b"} />
                        </TouchableOpacity>

                        <View className="items-center mt-4">
                            <View className="items-center justify-center w-20 h-20 rounded-full bg-sky-100 dark:bg-slate-700">
                                <Ionicons name="mail-open" size={40} color={isDark ? "#3b82f6" : "#0ea5e9"} />
                            </View>
                            <Text className="mt-4 text-2xl font-bold text-center text-sky-900 dark:text-slate-200">
                                Enter Verification Code
                            </Text>
                            <Text className="mt-2 text-sm text-center text-sky-600 dark:text-slate-400">
                                Code sent to {callingCode === '94'
                                    ? `+${callingCode} ${phoneNumber}`
                                    : `+${callingCode}${phoneNumber}`
                                }
                            </Text>
                        </View>

                        <View className="flex-row justify-between mt-8">
                            {verificationCode.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={otpRefs[index]}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(key, index)}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    className="items-center justify-center w-12 text-2xl font-bold text-center border-2 h-14 rounded-xl bg-sky-50 dark:bg-slate-700 border-sky-300 dark:border-slate-600 text-sky-900 dark:text-slate-200"
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={verifyCode}
                            disabled={isLoading}
                            className="w-full py-4 mt-8 rounded-xl bg-sky-500 dark:bg-blue-500"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-lg font-bold text-center text-white">
                                    Verify & Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-center mt-4">
                            <Text className="text-sm text-sky-800 dark:text-slate-400">
                                Didn't receive code?{' '}
                            </Text>
                            <TouchableOpacity onPress={resendCode}>
                                <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                                    Resend
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isSigningIn}
                animationType="fade"
                transparent={true}
            >
                <View className="items-center justify-center flex-1 bg-black/70">
                    <View className="items-center p-12 py-12 bg-white rounded-3xl dark:bg-slate-800">
                        <View className="items-center mt-1 mb-1">
                            <Image source={require("../../assets/icons/logo.png")} className="w-32 h-32" />
                        </View>
                        <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
                        <Text className="mt-4 text-lg font-semibold text-sky-900 dark:text-slate-200">
                            Signing You In
                        </Text>
                        <Text className="mt-2 text-sm text-center text-sky-600 dark:text-slate-400">
                            Please wait a moment...
                        </Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}