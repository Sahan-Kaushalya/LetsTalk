import { Text, TouchableOpacity, View, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeOption, useTheme } from "../theme/ThemeProvider";
import { StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState, useEffect } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../components/AuthProvider";
import * as LocalAuthentication from "expo-local-authentication";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

const options: ThemeOption[] = ["light", "dark", "system"];
type SettingScreenProp = NativeStackNavigationProp<RootStackParamList, "SettingScreen">;

export default function SettingScreen() {
  const { preference, applied, setPreference } = useTheme();
  const navigation = useNavigation<SettingScreenProp>();
  const auth = useContext(AuthContext);
  const isDark = applied === "dark";
  
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
//   const [fingerprintEnabled, setFingerprintEnabled] = useState(auth?.isFingerprintEnabled || false);

//   useEffect(() => {
//     checkBiometricSupport();
//     setFingerprintEnabled(auth?.isFingerprintEnabled || false);
//   }, [auth?.isFingerprintEnabled]);

//   // Check if device supports biometric
//   const checkBiometricSupport = async () => {
//     try {
//       const compatible = await LocalAuthentication.hasHardwareAsync();
//       const enrolled = await LocalAuthentication.isEnrolledAsync();
//       setIsBiometricSupported(compatible && enrolled);
      
//       if (compatible && !enrolled) {
//         // Device has hardware but no fingerprint enrolled
//         setIsBiometricSupported(false);
//       }
//     } catch (error) {
//       console.error("Error checking biometric support:", error);
//       setIsBiometricSupported(false);
//     }
//   };

//   // Handle fingerprint toggle
//   const handleFingerprintToggle = async (value: boolean) => {
//     if (!isBiometricSupported) {
//       Alert.alert(
//         "Not Available",
//         "Biometric authentication is not available on this device. Please set up fingerprint or face ID in your device settings.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     if (value) {
//       // Enabling fingerprint - verify first
//       try {
//         const result = await LocalAuthentication.authenticateAsync({
//           promptMessage: "Verify your identity to enable fingerprint login",
//           fallbackLabel: "Use Passcode",
//           cancelLabel: "Cancel",
//         });

//         if (result.success) {
//           setFingerprintEnabled(true);
//           await auth?.setFingerprintEnabled(true);
//           Alert.alert("Success", "Fingerprint login has been enabled");
//         } else {
//           Alert.alert("Failed", "Authentication failed. Fingerprint not enabled.");
//         }
//       } catch (error) {
//         console.error("Authentication error:", error);
//         Alert.alert("Error", "Failed to enable fingerprint login");
//       }
//     } else {
//       // Disabling fingerprint
//       Alert.alert(
//         "Disable Fingerprint",
//         "Are you sure you want to disable fingerprint login?",
//         [
//           {
//             text: "Cancel",
//             style: "cancel"
//           },
//           {
//             text: "Disable",
//             style: "destructive",
//             onPress: async () => {
//               setFingerprintEnabled(false);
//               await auth?.setFingerprintEnabled(false);
//             }
//           }
//         ]
//       );
//     }
//   };

const handleLogout = () => {
  Dialog.show({
    type: ALERT_TYPE.WARNING,
    title: 'Logout',
    textBody: 'Are you sure you want to logout?',
    button: 'Cancel',
    autoClose: false,
    onPressButton: () => {
      Dialog.hide();
    },
  });

  setTimeout(() => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Confirm Logout',
      textBody: 'Please confirm to logout.',
      button: 'Logout',
      onPressButton: async () => {
        Dialog.hide();
        await auth?.signOut();
        navigation.reset({
          index: 0,
          routes: [{ name: 'WelcomeScreen' }],
        });
      },
    });
  }, 100);
};

  return (
    <SafeAreaView className="flex-1 bg-blue-50 dark:bg-slate-950">
      <StatusBar hidden={false} />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "#e2e8f0" : "#0c4a6e"} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-sky-900 dark:text-slate-200">
          Settings
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">

          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
              Appearance
            </Text>
            
            <View className="px-4 py-4 bg-white rounded-xl dark:bg-slate-900">
              <Text className="mb-3 text-sm font-semibold text-sky-900 dark:text-slate-300">
                Theme
              </Text>
              <View className="flex-row gap-x-3">
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={`flex-1 py-3 px-4 rounded-xl ${
                      preference === option 
                        ? "bg-sky-500 dark:bg-blue-500" 
                        : "bg-sky-50 dark:bg-slate-800"
                    }`}
                    onPress={() => setPreference(option)}
                  >
                    <View className="items-center">
                      <Ionicons 
                        name={
                          option === "light" ? "sunny" : 
                          option === "dark" ? "moon" : 
                          "phone-portrait"
                        } 
                        size={20} 
                        color={
                          preference === option 
                            ? "#ffffff" 
                            : isDark ? "#64748b" : "#0ea5e9"
                        } 
                      />
                      <Text
                        className={`text-center font-semibold mt-1 text-xs ${
                          preference === option 
                            ? "text-white" 
                            : "text-sky-900 dark:text-slate-300"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
              Security
            </Text>

          
            <View className="px-4 py-4 mb-2 bg-white rounded-xl dark:bg-slate-900">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-slate-800">
                    <Ionicons 
                      name="finger-print" 
                      size={20} 
                      color={isDark ? "#3b82f6" : "#0ea5e9"} 
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                      Fingerprint Login
                    </Text>
                    <Text className="text-xs text-sky-600 dark:text-slate-400">
                      {isBiometricSupported 
                        ? "Use fingerprint to unlock app" 
                        : "Not available on this device"}
                    </Text>
                  </View>
                </View>
                {/* <Switch
                  value={fingerprintEnabled}
                  onValueChange={handleFingerprintToggle}
                  disabled={!isBiometricSupported}
                  trackColor={{ 
                    false: isDark ? "#334155" : "#cbd5e1", 
                    true: isDark ? "#3b82f6" : "#0ea5e9" 
                  }}
                  thumbColor={fingerprintEnabled ? "#ffffff" : "#f1f5f9"}
                /> */}
              </View>
            </View>
          </View>

          {/* App Preferences Section */}
          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
              App Preferences
            </Text>

            {/* Loading Screen Toggle */}
            <View className="px-4 py-4 bg-white rounded-xl dark:bg-slate-900">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-slate-800">
                    <Ionicons 
                      name="hourglass-outline" 
                      size={20} 
                      color={isDark ? "#3b82f6" : "#0ea5e9"} 
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-sky-900 dark:text-slate-200">
                      Show Loading Screen
                    </Text>
                    <Text className="text-xs text-sky-600 dark:text-slate-400">
                      Display splash screen on app start
                    </Text>
                  </View>
                </View>
                <Switch
                  value={showLoadingScreen}
                  onValueChange={setShowLoadingScreen}
                  trackColor={{ 
                    false: isDark ? "#334155" : "#cbd5e1", 
                    true: isDark ? "#3b82f6" : "#0ea5e9" 
                  }}
                  thumbColor={showLoadingScreen ? "#ffffff" : "#f1f5f9"}
                />
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-sky-900 dark:text-slate-200">
              Account
            </Text>

            {/* My Profile */}
            <TouchableOpacity 
              className="flex-row items-center justify-between px-4 py-4 mb-2 bg-white rounded-xl dark:bg-slate-900"
              onPress={() => navigation.navigate('MyProfileScreen')}
            >
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-slate-800">
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={isDark ? "#3b82f6" : "#0ea5e9"} 
                  />
                </View>
                <Text className="ml-3 text-base font-semibold text-sky-900 dark:text-slate-200">
                  My Profile
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? "#64748b" : "#94a3b8"} 
              />
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity 
              className="flex-row items-center justify-between px-4 py-4 bg-white rounded-xl dark:bg-slate-900"
            >
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-slate-800">
                  <Ionicons 
                    name="shield-checkmark-outline" 
                    size={20} 
                    color={isDark ? "#3b82f6" : "#0ea5e9"} 
                  />
                </View>
                <Text className="ml-3 text-base font-semibold text-sky-900 dark:text-slate-200">
                  Privacy & Security
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? "#64748b" : "#94a3b8"} 
              />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-red-600 dark:text-red-400">
              Danger Zone
            </Text>

            {/* Logout Button */}
            <TouchableOpacity 
              className="flex-row items-center justify-between px-4 py-4 bg-white border-2 border-red-200 rounded-xl dark:bg-slate-900 dark:border-red-900"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 bg-red-100 rounded-full dark:bg-red-900/30">
                  <Ionicons 
                    name="log-out-outline" 
                    size={20} 
                    color="#ef4444" 
                  />
                </View>
                <Text className="ml-3 text-base font-semibold text-red-600 dark:text-red-400">
                  Logout
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#ef4444" 
              />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="items-center py-6">
            <Text className="text-xs font-semibold text-sky-600 dark:text-slate-500">
              Version {process.env.EXPO_PUBLIC_APP_VERSION}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-sky-600 dark:text-slate-500">
              © 2025 {process.env.EXPO_PUBLIC_APP_NAME}
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}