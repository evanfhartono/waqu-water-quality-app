import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

// Import your background image
import bgImage from "../assets/images/SignIn_Wallpaper.jpg";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }

      router.replace("/");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={bgImage}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title} variant="headlineMedium">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>

            <TextInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="example@gmail.com"
              mode="outlined"
              style={[styles.input, { backgroundColor: '#F5F5F5' }]}
              textColor="#000000"
              outlineColor="#767b81"
              activeOutlineColor="#3399ff"
              onChangeText={setEmail}
            />

            <TextInput
              label="Password"
              autoCapitalize="none"
              mode="outlined"
              secureTextEntry
              style={[styles.input, { backgroundColor: '#F5F5F5' }]}
              textColor="#000000"
              outlineColor="#767b81"
              activeOutlineColor="#3399ff"
              onChangeText={setPassword}
            />

            {error && (
              <Text style={{ color: theme.colors.error }}>{error}</Text>
            )}

            <Button mode="contained" style={styles.button} 
            labelStyle={{ color: '#FFFFFF' }} // Set text color to white
            onPress={handleAuth}>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <TouchableOpacity onPress={handleSwitchMode} style={styles.switchModeButton}>
              <Text style={{ textAlign: 'center' }}>
                <Text style={{ color: '#767b81' }}>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                </Text>
                <Text style={{ color: '#3399ff' }}>
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // White overlay for readability
    padding: 16,
    justifyContent: "center",
  },
  content: {
    padding: 16,
    justifyContent: "center",
    backgroundColor: "white", // White background for the box
    borderRadius: 12, // Rounded corners
    marginHorizontal: 16, // Margin to avoid touching screen edges
    shadowColor: "#000", // Shadow for depth (optional)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    color: "black",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#3399ff",
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center', // Center children (Text) horizontally
    justifyContent: 'center', // Center children vertically
    paddingVertical: 8, // Mimic Button padding
  },
});
