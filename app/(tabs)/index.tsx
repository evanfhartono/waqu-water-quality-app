import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Button } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";

export default function MapScreen() {
  const {signOut} = useAuth();
  return (
    <View
      style={styles.view}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link 
        href="/loginScreen" 
        style={styles.navButton}>
          <Text>login</Text>
      </Link>

      <Button mode="text" onPress={signOut} icon={"logout"}>SignOut</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    width: 200, 
    height: 20, 
    backgroundColor: "coral", 
    borderRadius: 8, 
    textAlign: "center" 
  }
})