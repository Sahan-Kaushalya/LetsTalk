import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Platform, StyleSheet } from 'react-native';
import { useTheme } from './src/theme/ThemeProvider';
import ChatsStack from './src/screens/ChatsStack';
import MyProfileScreen from './src/screens/MyProfileScreen';
import StatusScreen from './src/screens/StatusScreen';
import SettingScreen from './src/screens/SettingScreen';


const Tabs = createBottomTabNavigator();

export default function HomeTabs() {
  const { applied } = useTheme();
  const isDark = applied === "dark";

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          let IconComponent = Ionicons;

          if (route.name === "Chats") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          } else if (route.name === "Status") {
            iconName = focused ? "ellipse" : "ellipse-outline";
          } else if (route.name === "Calls") {
            iconName = focused ? "call" : "call-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          if (focused) {
            return (
              <View style={[
                styles.activeIconContainer,
                { backgroundColor: isDark ? '#1e40af' : '#0ea5e9' }
              ]}>
                <IconComponent name={iconName} size={size - 2} color="white" />
              </View>
            );
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? "#3b82f6" : "#0ea5e9",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: Platform.OS === 'android' ? 0 : 8,
        },
        tabBarStyle: {
          height: Platform.OS === 'android' ? 88 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'android' ? 24 : 8,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
          elevation: 8,
          shadowColor: isDark ? '#000000' : '#0ea5e9',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: Platform.OS === 'android',
      })}
    >
      <Tabs.Screen
        name="Chats"
        component={ChatsStack}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadgeStyle: {
            backgroundColor: isDark ? '#ef4444' : '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />
       <Tabs.Screen
        name="Status"
        component={StatusScreen}
        options={{
          tabBarLabel: 'Status',
          tabBarBadgeStyle: {
            backgroundColor: isDark ? '#ef4444' : '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={MyProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarBadgeStyle: {
            backgroundColor: isDark ? '#ef4444' : '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarBadgeStyle: {
            backgroundColor: isDark ? '#ef4444' : '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />

    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    width: 52,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});