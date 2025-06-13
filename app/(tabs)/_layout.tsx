import { Tabs } from "expo-router";
import { Text } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerStyle: { 
          backgroundColor: "lightblue"},
        headerShadowVisible: false, 
        // headerShown: false,
        headerStatusBarHeight: 0.1,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "lightblue",
        tabBarActiveBackgroundColor: "blue", 
        tabBarInactiveTintColor: "black",
        }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="map" 
              size={size} 
              color={color}
              options={{ headerShown: false }}
              />
          )
        }}
      />
      <Tabs.Screen 
        name="alert" 
        options={{ 
          title: "alert",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="map-marker-alert" 
              size={size} 
              color={color}
              options={{ headerShown: false }}
              />
          )
        }}
      />
      <Tabs.Screen 
        name="camera" 
        options={{ 
          title: "camera",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="scan-helper" 
              size={size} 
              color={color}
              options={{ headerShown: false }}
              />
          )
        }}
      />
      <Tabs.Screen 
        name="userlog" 
        options={{ 
          title: "log",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="format-list-bulleted" 
              size={size} 
              color={color}
              options={{ headerShown: false }}
              />
          )
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="account" 
              size={size} 
              color={color}
              options={{ headerShown: false }}
              />
          )
        }}
      />
      {/* <Tabs.Screen
        name="loginScreen" 
        options={{ 
          title: "login",
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <FontAwesome name="home" size={24} color={color} /> 
            ) : ( 
              <AntDesign name="home" size={24} color="black" />
            );
          },
        }}
      /> */}
    </Tabs>
  );
}
