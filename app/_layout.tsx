import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { AuthProvider } from "../lib/auth-context";

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const isAuth = false;

  useEffect(() => {
    if (!isAuth) {
      router.replace("/auth");
    } else if (isAuth) {
      router.replace("/");
    }
  })
  return <>{children}</>
}

export default function RootLayout() {
  return (
    // <AuthProvider>
      // <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        </Stack>
      // </RouteGuard>
    // </AuthProvider>
  );
}
