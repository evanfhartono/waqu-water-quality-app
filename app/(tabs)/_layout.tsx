import { Tabs } from "expo-router";
import { Text } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "coral" }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <FontAwesome name="home" size={24} color={color} /> 
            ) : ( 
              <AntDesign name="home" size={24} color="black" />
            );
          }
          
        }}
      />
      <Tabs.Screen name="loginScreen" options={{ title: "Login" }}/>
    </Tabs>
  );
}
