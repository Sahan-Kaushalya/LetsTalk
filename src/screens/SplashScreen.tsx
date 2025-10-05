import { Image, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MessageBubbleShape from "../components/MessageBubbleShape";
import { RootStackParamList } from "../../App";
import { useTheme } from "../theme/ThemeProvider";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

export default function SplashScreen() {
    const navigation = useNavigation<NavigationProps>();
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 3500 });
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const { applied } = useTheme();
    const logo =
        applied === "dark"
            ? require("../../assets/icons/logo.png")
            : require("../../assets/icons/logo.png");

    const isDark = applied === "dark";

    return (
        <SafeAreaView className="relative items-center justify-center flex-1 bg-blue-100 dark:bg-slate-900">
            <StatusBar hidden={true} />

            <MessageBubbleShape
                width={220}
                height={220}
                borderRadius={110}
                iconName="chatbubbles"
                iconColor={isDark ? "#60A5FA" : "#1976D2"}
                iconSize={70}
                backgroundColor={isDark ? "#1E3A5F" : "#BBDEFB"}
                topValue={-30}
                leftValue={-50}
                opacity={0.9}
            />

            <MessageBubbleShape
                width={140}
                height={140}
                borderRadius={70}
                iconName="chatbubble-ellipses"
                iconColor={isDark ? "#3B82F6" : "#42A5F5"}
                iconSize={32}
                backgroundColor={isDark ? "#1E40AF" : "#BBDEFB"}
                topValue={10}
                rightValue={-35}
                opacity={0.8}
            />

            <MessageBubbleShape
                width={90}
                height={90}
                borderRadius={45}
                borderColor={isDark ? "#2563EB" : "#1565C0"}
                borderWidth={1}
                iconName="chatbox"
                iconColor={isDark ? "#60A5FA" : "#1565C0"}
                iconSize={28}
                backgroundColor={isDark ? "#172554" : "#E3F2FD"}
                topValue={160}
                leftValue={-25}
                opacity={0.7}
            />

            <MessageBubbleShape
                width={120}
                height={120}
                borderRadius={60}
                iconName="chatbubble"
                iconColor={isDark ? "#3B82F6" : "#2196F3"}
                iconSize={28}
                backgroundColor={isDark ? "#1E3A8A" : "#BBDEFB"}
                topValue={200}
                rightValue={-40}
                opacity={0.75}
            />

            <MessageBubbleShape
                width={70}
                height={70}
                borderRadius={35}
                borderColor={isDark ? "#3B82F6" : "#1E88E5"}
                borderWidth={1}
                iconName="chatbubbles-outline"
                iconColor={isDark ? "#60A5FA" : "#1E88E5"}
                iconSize={24}
                backgroundColor={isDark ? "#1E293B" : "#E3F2FD"}
                bottomValue={120}
                leftValue={-15}
                opacity={0.65}
            />

            <MessageBubbleShape
                width={170}
                height={170}
                borderRadius={100}
                iconName="document-text"
                iconColor={isDark ? "#3B82F6" : "#1E88E5"}
                iconSize={50}
                backgroundColor={isDark ? "#1E3A8A" : "#BBDEFB"}
                bottomValue={-90}
                leftValue={-45}
                opacity={0.65}
            />

            <MessageBubbleShape
                width={110}
                height={110}
                borderRadius={55}
                iconName="chatbox-ellipses"
                iconColor={isDark ? "#60A5FA" : "#1565C0"}
                iconSize={22}
                backgroundColor={isDark ? "#1E40AF" : "#BBDEFB"}
                bottomValue={80}
                rightValue={-20}
                opacity={0.7}
            />

            <MessageBubbleShape
                width={60}
                height={60}
                borderRadius={30}
                iconName="chatbubble-outline"
                iconColor={isDark ? "#3B82F6" : "#42A5F5"}
                iconSize={14}
                backgroundColor={isDark ? "#172554" : "#E3F2FD"}
                bottomValue={30}
                rightValue={15}
                opacity={0.6}
            />

            <MessageBubbleShape
                width={60}
                height={60}
                borderRadius={50}
                iconName="chatbubble-ellipses-outline"
                iconColor={isDark ? "#93C5FD" : "#90CAF9"}
                borderWidth={1}
                borderColor={isDark ? "#93C5FD" : "#90CAF9"}
                iconSize={27}
                backgroundColor={isDark ? "#1E293B" : "#E3F2FD"}
                topValue={250}
                leftValue={80}
                opacity={0.5}
            />

            <MessageBubbleShape
                width={35}
                height={35}
                borderRadius={17.5}
                iconName="chatbox-outline"
                iconColor={isDark ? "#3B82F6" : "#2196F3"}
                iconSize={10}
                backgroundColor={isDark ? "#172554" : "#E3F2FD"}
                topValue={180}
                rightValue={40}
                opacity={0.5}
            />

            <MessageBubbleShape
                width={70}
                height={70}
                borderRadius={50}
                iconName="chatbubbles"
                borderWidth={1}
                borderColor={isDark ? "#93C5FD" : "#90CAF9"}
                iconColor={isDark ? "#2563EB" : "#1565C0"}
                iconSize={25}
                backgroundColor={isDark ? "#1E40AF" : "#90CAF9"}
                bottomValue={200}
                leftValue={160}
                opacity={0.45}
            />

            <Animated.View style={animatedStyle}>
                <Image
                    source={logo}
                    style={{ width: 250, height: 250 }}
                />
            </Animated.View>

            <Animated.View className="absolute bottom-1" style={animatedStyle}>
                <View className="flex flex-col items-center mb-10 align-middle">
                    <Text className="mb-2 text-base font-bold text-center text-gray-600 dark:text-gray-200">
                        DEVELOPED BY : {process.env.EXPO_PUBLIC_APP_DEVELOPER}
                    </Text>
                    <Text className="text-base font-extrabold text-center text-sky-600 dark:text-sky-400">
                        VERSION : {process.env.EXPO_PUBLIC_APP_VERSION}
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}