import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../lib/auth-context";

SplashScreen.preventAutoHideAsync();

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = false; // Replace with your auth logic
      setIsAuth(authStatus);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuth === null) return;
    if (!isAuth) {
      router.replace("/auth");
    } else {
      router.replace("/");
    }
    SplashScreen.hideAsync();
  }, [isAuth, router]);

  if (isAuth === null) {
    return null; // Or render a <Text>Loading...</Text> in a View
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}