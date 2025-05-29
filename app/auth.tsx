import { KeyboardAvoidingView, Platform, View, Text, TextInput } from "react-native";

export default function AuthScreen() {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Text>
            Create Account
          </Text>
          <TextInput 
            // label='Email' 
            autoCapitalize="none" 
            keyboardType="email-address"
            placeholder="example@gmail.com"
          />
        </View>
      </KeyboardAvoidingView>
    )
}