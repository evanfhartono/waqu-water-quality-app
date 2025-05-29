import { useAuth } from "@/lib/auth-context";
import { parseAsync } from "@babel/core";
import { useState } from "react";
import { useRouter } from 'expo-router'
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
export default function AuthScreen() {
    const [isSignUp, setSignUp] = useState<boolean>(false);
    
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    
    const [emailError, setEmailError] = useState<string | null>("");
    const [passwordError, setPasswordError] = useState<string | null>("");
    const [error, setError] = useState<string | null>("");


    // setEmailError("input valid email")
    const router = useRouter();

    const { signIn, signUp } = useAuth()

    const handleAuth = async () => {
      if (!email || !password) {
          setError("Please Fill in All Fields")
          return;
      }
      if (password.length < 6) {
          setPasswordError("Password must be 6 char long")
          return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
          setEmailError("please input a valid email")
          return;
      }
      setError(null)
      setEmailError(null)
      setPasswordError(null)

      if (isSignUp) {
        const error = await signUp(email, password)
        if (error) {
          setError(error) 
          return;
        } else {
          const error = await signUp(email, password)
          setError(error) 
          return;
        }
        
        router.replace("/")
      } 
    };

    const handleSwitchMode = () => {
        setSignUp((prev) => !prev)
    };
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
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
            style={styles.input}
            onChangeText={setEmail}
          />
          (emailError && (
            <Text style={{ color: useTheme().colors.error }}> {emailError} </Text>
          ))
          <Text>test</Text>
          <TextInput
            label="Password" 
            autoCapitalize="none" 
            keyboardType="visible-password"
            // placeholder="example@gmail.com"
            mode="outlined"
            style={styles.input}
            onChangeText={setPassword}
          />
          (passwordError && (
            <Text style={{ color: useTheme().colors.error }}> {passwordError} </Text>
          ))

          (error && (
            <Text style={{ color: useTheme().colors.error }}> {error} </Text>
          ))

          <Button mode="contained" style={styles.button} onPress={handleAuth}>{isSignUp ? "Sign Up" : "SignIn"}</Button>
          <Button mode="text" onPress={handleSwitchMode} style={styles.switchModeButtom}>{isSignUp ? "Already have an account?" : "Dont have an account? SignUp"}</Button>
        </View>
      </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#f5f5f5"
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center"
    },
    title: {
        textAlign: "center",
        marginBottom: 24
    },
    input: {
        marginBottom: 16
    },
    button: {
        marginTop: 8
    },
    switchModeButtom: {
        marginTop: 16
    }
})