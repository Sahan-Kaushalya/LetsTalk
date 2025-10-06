import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext, AuthProvider } from "./src/components/AuthProvider";
import { WebSocketProvider } from "./src/socket/WebSocketProvider";
import { useContext } from "react";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "./src/screens/SplashScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { UserRegistrationProvider } from "./src/components/UserContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import AvatarScreen from "./src/screens/AvatarScreen";
import MobileScreen from "./src/screens/MobileScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ContactListScreen from "./src/screens/ContactListScreen";

export type RootStackParamList = {
  SplashScreen: undefined;
  WelcomeScreen: undefined;
  SignUpScreen: undefined;
  AvatarScreen: undefined;
  MobileScreen: undefined;
  HomeScreen: undefined;
  ChatScreen: {
    chatId: number,
    name: string,
    isOnline: string,
    avatar: string,
  };
  ContactListScreen: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainApp() {
  const auth = useContext(AuthContext);

  return (
    <WebSocketProvider userId={auth ? Number(auth.userId) : 0}>
      <ThemeProvider>
        <UserRegistrationProvider>
          <AlertNotificationRoot>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="ContactListScreen">
                <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AvatarScreen" component={AvatarScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MobileScreen" component={MobileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ContactListScreen" component={ContactListScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            </NavigationContainer>
          </AlertNotificationRoot>
        </UserRegistrationProvider>
      </ThemeProvider>
    </WebSocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

