import { useAuth } from "@/lib/auth-context";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card } from "react-native-paper";

export default function ProfileScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.profileRow}>
          <Avatar.Icon
            icon="account"
            size={84}
            color="#1e88e5"
            style={{
              backgroundColor: '#e3f2fd',
              marginRight: 30,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{user?.name || "User Name"}</Text>
            <Text style={styles.subtitle}>{user?.email || "user@example.com"}</Text>
          </View>
        </View>

        <Card.Content>
          <Text style={styles.text}>Welcome to your profile screen.</Text>
        </Card.Content>

        <View style={styles.buttonLeft}>
          <Link href="/" asChild>
            <Button
              icon="home"
              textColor="#1e88e5"
              buttonColor="#e3f2fd"
              mode="contained-tonal"
            >
              Home
            </Button>
          </Link>
        </View>

        <View style={styles.buttonRight}>
          <Button
            icon="logout"
            textColor="#ff0000"
            buttonColor="#ffa9a6"
            mode="contained"
            onPress={signOut}
          >
            Sign Out
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    height: "80%",
    maxWidth: 400,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
  },
  text: {
    fontSize: 16,
    marginVertical: 12,
    color: "#000000",
    paddingBottom: 600,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  button: {
    marginHorizontal: 4,
  },
  buttonLeft: {
  position: 'absolute',
  bottom: 16,
  left: 1,
},

buttonRight: {
  position: 'absolute',
  bottom: 16,
  right: 1,
},
});
