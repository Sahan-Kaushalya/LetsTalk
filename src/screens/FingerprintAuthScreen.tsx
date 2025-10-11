// import React, { useEffect, useContext } from 'react';
// import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import * as LocalAuthentication from 'expo-local-authentication';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../App';
// import { AuthContext } from '../components/AuthProvider';
// import { useTheme } from '../theme/ThemeProvider';

// type FingerprintAuthScreenProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'FingerprintAuthScreen'
// >;

// export default function FingerprintAuthScreen() {
//   const navigation = useNavigation<FingerprintAuthScreenProp>();
//   const auth = useContext(AuthContext);
//   const { applied } = useTheme();
//   const isDark = applied === 'dark';

//   useEffect(() => {
//     // Auto-trigger authentication when screen loads
//     handleAuthentication();
//   }, []);

//   const handleAuthentication = async () => {
//     try {
//       const result = await LocalAuthentication.authenticateAsync({
//         promptMessage: 'ඔබගේ අනන්‍යතාවය තහවුරු කරන්න',
//         fallbackLabel: 'Use Passcode',
//         disableDeviceFallback: false,
//         cancelLabel: 'Cancel',
//       });

//       if (result.success) {
//         // Authentication successful - update context
//         if (auth?.setFingerprintVerified) {
//           await auth.setFingerprintVerified(true);
//         }
        
//         // Navigate to Home screen
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'HomeScreen' }],
//         });
//       } else {
//         // Authentication failed
//         handleAuthenticationError(result.error);
//       }
//     } catch (error) {
//       console.error('Authentication error:', error);
//       Alert.alert('Error', 'An error occurred during authentication');
//     }
//   };

//   const handleAuthenticationError = (error: string) => {
//     if (error === 'user_cancel') {
//       Alert.alert(
//         'Authentication Cancelled',
//         'You need to authenticate to continue',
//         [
//           {
//             text: 'Try Again',
//             onPress: handleAuthentication,
//           },
//           {
//             text: 'Logout',
//             style: 'destructive',
//             onPress: handleLogout,
//           },
//         ]
//       );
//     } else if (error === 'lockout') {
//       Alert.alert(
//         'Too Many Attempts',
//         'Too many failed attempts. Please try again later or logout.',
//         [
//           {
//             text: 'Try Again',
//             onPress: handleAuthentication,
//           },
//           {
//             text: 'Logout',
//             style: 'destructive',
//             onPress: handleLogout,
//           },
//         ]
//       );
//     } else {
//       Alert.alert(
//         'Authentication Failed',
//         'Please try again',
//         [
//           {
//             text: 'Try Again',
//             onPress: handleAuthentication,
//           },
//           {
//             text: 'Logout',
//             style: 'destructive',
//             onPress: handleLogout,
//           },
//         ]
//       );
//     }
//   };

//   const handleLogout = async () => {
//     await auth?.signOut();
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'WelcomeScreen' }],
//     });
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-blue-50 dark:bg-slate-950">
//       <View className="items-center justify-center flex-1 px-5">
        
//         {/* Icon Container */}
//         <View className="items-center justify-center w-40 h-40 mb-8 rounded-full bg-sky-100 dark:bg-slate-800">
//           <Ionicons 
//             name="finger-print" 
//             size={100} 
//             color={isDark ? "#3b82f6" : "#0ea5e9"} 
//           />
//         </View>

//         {/* Title & Subtitle */}
//         <Text className="mb-2 text-3xl font-bold text-sky-900 dark:text-slate-200">
//           Fingerprint Required
//         </Text>
//         <Text className="px-5 mb-12 text-base text-center text-sky-600 dark:text-slate-400">
//           Please authenticate to access your account
//         </Text>

//         {/* Authenticate Button */}
//         <TouchableOpacity 
//           className="flex-row items-center px-8 py-4 mb-4 shadow-lg bg-sky-500 dark:bg-blue-500 rounded-xl"
//           onPress={handleAuthentication}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="finger-print" size={24} color="#ffffff" />
//           <Text className="ml-2 text-lg font-semibold text-white">
//             Authenticate
//           </Text>
//         </TouchableOpacity>

//         {/* Logout Button */}
//         <TouchableOpacity 
//           className="px-8 py-3"
//           onPress={handleLogout}
//           activeOpacity={0.7}
//         >
//           <Text className="text-base font-semibold text-red-600 dark:text-red-400">
//             Logout
//           </Text>
//         </TouchableOpacity>

//         {/* Info Text */}
//         <View className="absolute items-center bottom-10">
//           <Text className="text-xs text-sky-600 dark:text-slate-500">
//             Your data is protected with biometric security
//           </Text>
//         </View>

//       </View>
//     </SafeAreaView>
//   );
// }