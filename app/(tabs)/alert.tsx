import { client, databases, RealtimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Droplet } from "@/types/database.type";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Query } from "react-native-appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const getColor = (score: number) => {
  const t = Math.min(Math.max(score / 100, 0), 1); // Clamp score to 0-100 range

  // Map score to hue: 0 (red) to 120 (green) in HSL
  const hue = 120 * t; // Hue from 0° (red) to 120° (green)
  const saturation = 1; // Full saturation (100%)
  const lightness = 0.5; // 50% lightness for vibrant colors

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation; // Chroma
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r, g, b;
  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else {
    r = 0;
    g = c;
    b = x;
  }

  // Scale to 0-255 and adjust with m
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
};

export default function AlertScreen() {
  const { user } = useAuth()

  const [droplet, setDroplet] = useState<Droplet[]>()

  const fetchDroplet = async () => {
    try {
        const response = await databases.listDocuments(
            "6839e760003b3099528a",
            "6839e96e001331fdd3c7"
            // ,[Query.equal("user_id", user?.$id ?? "")]
          );
          console.log(response.documents)
          setDroplet(response.documents as Droplet[]);
      } catch (error) {
          console.error(error)
      }
  }

  useEffect(() => {
    if (user) {
      const channel = `databases.${'6839e760003b3099528a'}.collections.${"6839e96e001331fdd3c7"}.documents`
      const dropletSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            fetchDroplet();
          } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
            fetchDroplet();
          } else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
            fetchDroplet();
          }
        }
      ); 
      fetchDroplet();
      return () => {
        dropletSubscription();
      }
    }
  }, [user])

  return (
    <View style={styles.container}>
      <Text>Login page</Text>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
            Your Log
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {droplet?.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>You havent predict any water yet</Text></View>
        ) : (
          droplet?.map((droplet) => (
              <View style={styles.cardContent} key={droplet.droplet_id}>
                  <Text style={[styles.cardTitle, { color: getColor(droplet.quality) }]}>{droplet.droplet_id}</Text>
                  <Text>{droplet.user_id}</Text>
                  <Text>{droplet.upload_time}</Text>
                  <Text>{droplet.quality}</Text>
                  <View>
                      <MaterialCommunityIcons name="fire" size={18} color={"#ff9800"}/>
                  </View>
              </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardCompleted: {
    opacity: 0.6,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});