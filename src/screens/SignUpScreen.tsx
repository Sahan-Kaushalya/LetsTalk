import { Image, KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useUserRegistration } from "../components/UserContext";
import "../../global.css";
import { FloatingLabelInput } from "react-native-floating-label-input";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { validateAboutMe, validateFirstName, validateLastName } from "../util/Validation";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

export default function SignUpScreen() {
    const { applied } = useTheme();
    const { userData, setUserData } = useUserRegistration();
    const navigation = useNavigation<NavigationProps>();
    const isDark = applied === "dark";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 100 : 100}
            className="items-center flex-1 bg-blue-100 dark:bg-slate-900"
        >
            <SafeAreaView className="items-center justify-center p-5">
                <StatusBar hidden={false} />
                <Image source={require("../../assets/icons/logo.png")} className="mt-2 w-44 h-44" />

                <View className="items-center mt-4">
                    <Text className="mt-2 text-3xl font-bold text-center text-sky-900 dark:text-slate-200">
                        Create Your Account & Strat Chatting
                    </Text>
                    <Text className="mt-2 text-base font-semibold text-center text-sky-600 dark:text-slate-400">
                        Let's get you started in just a few steps
                    </Text>
                </View>
                <View className="w-screen px-6 mt-6">
                    <View className="w-full my-4">
                        <FloatingLabelInput className="h-10"
                            maxLength={45}
                            value={userData.firstName}
                            onChangeText={(text) => {
                                setUserData((previous) => ({
                                    ...previous,
                                    firstName: text,
                                }));
                            }}
                            label={"Enter Your First Name"}
                            leftComponent={
                                <Ionicons className="me-2" name="person-add" size={22}
                                    color={isDark ? "#38bdf8" : "#0369a1"} />
                            }
                            inputStyles={{
                                color: isDark ? "#dbeafe" : "#1f2937",
                            }}

                            labelStyles={{
                                color: isDark ? "#9ca3af" : "#6b7280",
                            }}

                            customLabelStyles={{
                                colorFocused: isDark ? "#E5E7EB" : "#111827",
                                colorBlurred: isDark ? "#9CA3AF" : "#6B7280",

                            }}

                        />
                    </View>
                    <View className="w-full my-4">
                        <FloatingLabelInput className="h-10"
                            maxLength={45}
                            value={userData.lastName}
                            onChangeText={(text) => {
                                setUserData((previous) => ({
                                    ...previous,
                                    lastName: text,
                                }));
                            }}
                            label={"Enter Your Last Name"}
                            leftComponent={
                                <Ionicons className="me-2" name="person-add" size={22}
                                    color={isDark ? "#38bdf8" : "#0369a1"} />
                            }
                            inputStyles={{
                                color: isDark ? "#dbeafe" : "#1f2937",
                            }}

                            labelStyles={{
                                color: isDark ? "#9ca3af" : "#6b7280",
                            }}

                            customLabelStyles={{
                                colorFocused: isDark ? "#E5E7EB" : "#111827",
                                colorBlurred: isDark ? "#9CA3AF" : "#6B7280",
                            }}

                        />
                    </View>

                    <View className="w-full my-4 ">
                        <FloatingLabelInput
                            value={userData.aboutMe}
                            multiline
                            maxLength={350}
                            numberOfLines={4}
                            onChangeText={(text) => {
                                setUserData((previous) => ({
                                    ...previous,
                                    aboutMe: text,
                                }));
                            }}
                            label={"Tell us about yourself"}
                            leftComponent={
                                <MaterialCommunityIcons name="text-box-edit" size={24}
                                    color={isDark ? "#38bdf8" : "#0369a1"} />
                            }
                            inputStyles={{
                                color: isDark ? "#dbeafe" : "#1f2937",
                                textAlignVertical: "top",
                                minHeight: 100,
                                fontSize: 15,
                            }}

                            labelStyles={{
                                color: isDark ? "#9ca3af" : "#6b7280",
                            }}

                            customLabelStyles={{
                                colorFocused: isDark ? "#E5E7EB" : "#111827",
                                colorBlurred: isDark ? "#9CA3AF" : "#6B7280",
                            }}

                        />
                    </View>
                </View>
                <View className="w-screen px-6 pb-4 mt-20">
                    <TouchableOpacity
                        className="flex-row items-center justify-center w-full py-4 rounded-xl bg-sky-500 dark:bg-blue-500"
                        onPress={() => {
                            let validFName = validateFirstName(userData.firstName);
                            let validLName = validateLastName(userData.lastName);
                            let validAbout = validateAboutMe(userData.aboutMe);

                            if (validFName) {
                                Toast.show({
                                    type: ALERT_TYPE.WARNING,
                                    title: "WARNING - EMPTY FIELD",
                                    textBody: validFName,
                                    autoClose: 2000,
                                     textBodyStyle: { fontSize: 17,fontWeight:'semibold'},
                                });
                            }else if(validLName){
                                 Toast.show({
                                    type: ALERT_TYPE.WARNING,
                                    title: "WARNING - EMPTY FIELD",
                                    textBody: validLName,
                                    autoClose: 2000,
                                      textBodyStyle: { fontSize: 17,fontWeight:'semibold'},
                                });
                            }else if(validAbout){
                                 Toast.show({
                                    type: ALERT_TYPE.WARNING,
                                    title: "WARNING - EMPTY FIELD",
                                    textBody: validAbout,
                                    autoClose: 2500,
                                      textBodyStyle: { fontSize: 17,fontWeight:'semibold'},

                                });
                            }else{
                                navigation.replace("AvatarScreen");
                            }
                        }}>
                        <Text className="text-lg font-bold text-center text-white">
                            Continue
                        </Text>
                        <MaterialIcons className="ms-2" name="keyboard-arrow-right" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-4">
                        <Text className="text-sm text-sky-800 dark:text-slate-400">
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => { navigation.replace("WelcomeScreen") }}>
                            <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}