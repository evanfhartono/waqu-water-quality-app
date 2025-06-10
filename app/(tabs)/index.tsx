import { databases, client, RealtimeResponse } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Droplet } from '@/types/database.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import { Query } from 'react-native-appwrite';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getColor } from '@/components/getColor';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams

const INITIAL_REGION = {
  latitude: -6,
  longitude: 106,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

export default function App() {
  const { user } = useAuth();
  const [droplet, setDroplet] = useState<Droplet[]>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState(INITIAL_REGION); // State for dynamic region
  const { lat, lng } = useLocalSearchParams(); // Get navigation parameters

  const fetchDroplet = async () => {
    try {
      const response = await databases.listDocuments(
        '6839e760003b3099528a',
        '6839e96e001331fdd3c7'
      );
      setDroplet(response.documents as Droplet[]);
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert('Location Error', 'Could not retrieve your current location.');
    }
  };

  // Effect to fetch droplets and get initial location
  useEffect(() => {
    if (user) {
      const channel = `databases.6839e760003b3099528a.collections.6839e96e001331fdd3c7.documents`;
      const dropletSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes('databases.*.collections.*.documents.*.create') ||
            response.events.includes('databases.*.collections.*.documents.*.update') ||
            response.events.includes('databases.*.collections.*.documents.*.delete')
          ) {
            fetchDroplet();
          }
        }
      );
      fetchDroplet();
      getCurrentLocation();
      return () => {
        dropletSubscription();
      };
    }
  }, [user]);

  // Effect to update map region based on navigation parameters
  useEffect(() => {
    if (lat && lng) {
      setRegion({
        latitude: parseFloat(lat as string), // Convert string to number
        longitude: parseFloat(lng as string),
        latitudeDelta: 0.01, // Adjust zoom level
        longitudeDelta: 0.01,
      });
    }
  }, [lat, lng]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={region} // Use dynamic region instead of initialRegion
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {droplet?.length === 0 ? (
          <View>
            <Text>You haven’t predicted any water yet</Text>
          </View>
        ) : (
          droplet?.map((droplet) => (
            <Marker
              key={droplet.droplet_id}
              coordinate={{
                latitude: droplet.latitude,
                longitude: droplet.longitude,
              }}
              title={droplet.quality.toString()}
              description="test"
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons
                  name="circle"
                  size={40}
                  color={getColor(droplet.quality)}
                />
                <Text style={styles.markerText}>{droplet.quality}</Text>
              </View>
            </Marker>
          ))
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Get Current Location" onPress={getCurrentLocation} />
      </View>
    </View>
  );
}

// Styles remain the same (already provided in your code)

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  markerText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    width: 150,
  },
  name: {
    fontSize: 16,
    marginBottom: 5,
  },
  image: {
    width: 120,
    height: 80,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 1,
  },
});