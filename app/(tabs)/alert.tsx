import { client, databases, RealtimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Droplet } from "@/types/database.type";
import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Query } from "react-native-appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { getColor } from '@/components/getColor'; // Ensure this is correctly imported

export default function AlertScreen() {
  const { user } = useAuth();
  const [droplet, setDroplet] = useState<Droplet[]>();
  const router = useRouter();

  const fetchDroplet = async () => {
    try {
      const response = await databases.listDocuments(
        "6839e760003b3099528a",
        "6839e96e001331fdd3c7"
      );
      setDroplet(response.documents as Droplet[]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      const channel = `databases.6839e760003b3099528a.collections.6839e96e001331fdd3c7.documents`;
      const dropletSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes("databases.*.collections.*.documents.*.create") ||
            response.events.includes("databases.*.collections.*.documents.*.update") ||
            response.events.includes("databases.*.collections.*.documents.*.delete")
          ) {
            fetchDroplet();
          }
        }
      );
      fetchDroplet();
      return () => {
        dropletSubscription();
      };
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Prediction Arround You
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {droplet?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>You haven’t predicted any water yet</Text>
          </View>
        ) : (
          droplet?.map((droplet) => (
            <TouchableOpacity
              key={droplet.droplet_id}
              style={[styles.card, { borderLeftColor: getColor(droplet.quality) }]}
              onPress={() =>
                router.push({
                  pathname: "/",
                  params: { lat: droplet.latitude, lng: droplet.longitude },
                })
              }
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{droplet.droplet_id}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>User:</Text>
                  <Text style={styles.value}>{droplet.user_id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>{droplet.upload_time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Quality:</Text>
                  <Text style={[styles.value, { color: getColor(droplet.quality) }]}>
                    {droplet.quality}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={18}
                    color={getColor(droplet.quality)}
                  />
                </View>
              </View>
            </TouchableOpacity>
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
    borderLeftWidth: 10, // Thin vertical strip on the left
    // backgroundColor: "#c4f4ff"
  },
  cardContent: {
    padding: 20,
    
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#22223b",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#6c6c80",
  },
  value: {
    flex: 1,
    color: "#6c6c80",
  },
  iconContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
});