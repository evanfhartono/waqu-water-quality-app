import { client, databases, RealtimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Droplet } from "@/types/database.type";
import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { Query } from "react-native-appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { getColor } from '@/components/getColor';
import { LinearGradient } from "expo-linear-gradient";
import { WATER_SOURCES } from "@/assets/waterSources";

export default function AlertScreen() {
  const { user } = useAuth();
  const [droplet, setDroplet] = useState<Droplet[]>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDroplet = async () => {
    try {
      const response = await databases.listDocuments(
        "6839e760003b3099528a",
        "6839e96e001331fdd3c7",
        [Query.equal("user_id", user?.$id ?? ""), Query.orderDesc('upload_time')]
      );
      setDroplet(response.documents as Droplet[]);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getLocationName = (latitude: number, longitude: number): string => {
    if (!WATER_SOURCES || WATER_SOURCES.length === 0) return "Unknown Location";
    
    let closestSource = WATER_SOURCES[0];
    let minDistance = calculateDistance(latitude, longitude, closestSource.latitude, closestSource.longitude);

    for (const source of WATER_SOURCES) {
      const distance = calculateDistance(latitude, longitude, source.latitude, source.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closestSource = source;
      }
    }

    // Consider the droplet to be at the source's location if within its radius
    return minDistance <= closestSource.radius ? closestSource.name : "Unknown Location";
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
      fetchDroplet().then(() => setLoading(false));
      return () => dropletSubscription();
    }
  }, [user]);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="history" size={24} color="#fff" />
          <Text variant="headlineSmall" style={styles.title}>
            Your Log
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : droplet?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>You haven’t predicted any water yet</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/camera")}
              >
                <Text style={styles.ctaButtonText}>Make a Prediction</Text>
              </TouchableOpacity>
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
                activeOpacity={0.9}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{droplet.droplet_id}</Text>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account" size={16} color="#555" />
                    <Text style={styles.label}>User:</Text>
                    <Text style={styles.value}>{user?.name || user?.email || "User"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock" size={16} color="#555" />
                    <Text style={styles.label}>Time:</Text>
                    <Text style={styles.value}>{formatDate(droplet.upload_time)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#555" />
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>{getLocationName(droplet.latitude, droplet.longitude)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="water"
                      size={16}
                      color={getColor(droplet.quality)}
                    />
                    <Text style={styles.label}>Quality:</Text>
                    <Text style={[styles.value, { color: getColor(droplet.quality) }]}>
                      {droplet.quality}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  card: {
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 6,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    marginRight: 8,
    color: "#555",
    marginLeft: 4,
  },
  value: {
    flex: 1,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});