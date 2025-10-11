import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { useTheme } from "../theme/ThemeProvider";
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";


type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'WelcomeScreen'>;
export default function WelcomeScreen() {
    const { applied } = useTheme();
    const isDark = applied === "dark";
    const navigation = useNavigation<NavigationProps>();
    const scale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 100 : 100}
            className="flex-1 bg-blue-100 dark:bg-slate-900"
        >
            <SafeAreaView className="items-center justify-between flex-1 p-6">
                <StatusBar hidden={false}/>
                <Animated.View entering={FadeInUp.duration(700)} className="items-center mt-8">
                    <Image
                        source={require("../../assets/icons/logo.png")}
                        className="w-40 h-40"
                        resizeMode="contain"
                    />
                </Animated.View>

                <View className="items-center justify-center flex-1">
                    <Animated.Image
                        entering={FadeInUp.delay(200).duration(800)}
                        source={require("../../assets/vectors/chat_01.png")}
                        className="w-96 h-96"
                        resizeMode="contain"
                    />

                    <Animated.View entering={FadeIn.delay(600).duration(600)} className="items-center mt-8">
                        <Text className="mb-3 text-4xl font-extrabold text-gray-800 dark:text-white">
                            Connect & Chat
                        </Text>
                        <Text className="px-8 text-base font-semibold text-center text-gray-60000 dark:text-gray-300">
                            Stay connected with friends and family. Start meaningful conversations anytime, anywhere.
                        </Text>
                    </Animated.View>
                </View>

                <View className="w-full mb-8">
                    <Animated.View style={animatedButtonStyle}>
                        <TouchableOpacity
                            onPressIn={() => (scale.value = withSpring(0.95))}
                            onPressOut={() => (scale.value = withSpring(1))}
                            onPress={() => navigation.replace("SignUpScreen")}
                            activeOpacity={0.8}
                            className="flex-row items-center justify-center py-4 shadow-lg bg-sky-500 dark:bg-blue-500 rounded-xl"
                        >
                            <Text className="text-xl font-semibold text-center text-white">
                                Get Started
                            </Text>
                            <MaterialIcons className="ms-2" name="keyboard-arrow-right" size={24} color="white" />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(900).duration(600)}>
                        <TouchableOpacity
                            onPress={() => navigation.replace("SignInScreen")}
                            activeOpacity={0.7}
                            className="mt-4"
                        >
                            <Text className="text-base font-semibold text-center text-blue-600 dark:text-blue-400">
                                Already have an account? Sign In
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
