
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";

const Stack = createNativeStackNavigator();

export default function ChatsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>

  );
}
