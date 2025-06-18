import { databases, client, RealtimeResponse } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Droplet } from '@/types/database.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View, Alert, Modal, TouchableOpacity } from 'react-native';
import { Query } from 'react-native-appwrite';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getColor } from '@/components/getColor';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { WATER_SOURCES } from '@/assets/waterSources';

const INITIAL_REGION = {
  latitude: -6,
  longitude: 106,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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

const getAverageQuality = (
  droplets: Droplet[] | undefined,
  sourceLat: number,
  sourceLon: number,
  radius: number
): number | null => {
  if (!droplets || droplets.length === 0) return null;

  const nearbyDroplets = droplets.filter((droplet) => {
    const distance = calculateDistance(droplet.latitude, droplet.longitude, sourceLat, sourceLon);
    return distance <= radius;
  });

  if (nearbyDroplets.length === 0) return null;

  const totalQuality = nearbyDroplets.reduce((sum, droplet) => sum + droplet.quality, 0);
  const averageQuality = Math.round(totalQuality / nearbyDroplets.length);
  console.log(`Average quality for ${sourceLat}, ${sourceLon}: ${averageQuality}`);
  return averageQuality;
};

const getCircleFillColor = (quality: number | null): string => {
  if (quality === null) {
    return 'rgba(0, 0, 255, 0.05)';
  }
  const color = getColor(quality);
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  } else if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  }
  return 'rgba(0, 0, 255, 0.01)';
};

const GradientScoreBar = () => {
  return (
    <View style={styles.scoreBarContainer}>
      <LinearGradient
        colors={['#00FF00', '#FFFF00', '#FF0000']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={styles.scoreLabels}>
        <Text style={styles.scoreLabel}>- 100</Text>
        <Text style={styles.scoreLabel}>- 75</Text>
        <Text style={styles.scoreLabel}>- 50</Text>
        <Text style={styles.scoreLabel}>- 25</Text>
        <Text style={styles.scoreLabel}>- 0</Text>
      </View>
    </View>
  );
};

export default function App() {
  const { user } = useAuth();
  const [droplet, setDroplet] = useState<Droplet[]>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  const { lat, lng } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [lowQualityDroplet, setLowQualityDroplet] = useState<Droplet | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const fetchDroplet = async () => {
    try {
      const response = await databases.listDocuments(
        '6839e760003b3099528a',
        '6839e96e001331fdd3c7'
      );
      setDroplet(response.documents as Droplet[]);
      console.log('Fetched droplets:', response.documents);
    } catch (error) {
      console.error('Error fetching droplets:', error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied. Using default location.');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5, 
        longitudeDelta: 0.5,
      };
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRegion(userRegion); // Set map to user's location
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert('Location Error', 'Could not retrieve your current location. Using default location.');
    }
  };

  const handleViewOnMap = () => {
    if (lowQualityDroplet) {
      setRegion({
        latitude: lowQualityDroplet.latitude,
        longitude: lowQualityDroplet.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: lowQualityDroplet.latitude,
          longitude: lowQualityDroplet.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
      setModalVisible(false);
    }
  };

  useEffect(() => {
    if (user) {
      const channel = `databases.6839e760003b3099528a.collections.6839e96e001331fdd3c7.documents`;
      const dropletSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes('databases.*.collections.*.documents.*.create') ||
            response.events.includes('databases.*.collections.*.documents.*.update')
          ) {
            const payload = response.payload as Droplet;
            console.log('Received droplet payload:', payload);
            if (payload.quality < 30 && payload.latitude && payload.longitude) {
              setLowQualityDroplet(payload);
              setModalVisible(true);
            }
            fetchDroplet();
          } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
            fetchDroplet();
          }
        }
      );
      fetchDroplet();
      getCurrentLocation(); // Fetch user location on mount
      return () => {
        dropletSubscription();
      };
    }
  }, [user]);

  useEffect(() => {
    if (lat && lng) {
      setRegion({
        latitude: parseFloat(lat as string),
        longitude: parseFloat(lng as string),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [lat, lng]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {WATER_SOURCES.map((source, index) => {
          const averageQuality = getAverageQuality(
            droplet,
            source.latitude,
            source.longitude,
            source.radius
          );
          return (
            <>
              <Circle
                key={`circle-${index}`}
                center={{
                  latitude: source.latitude,
                  longitude: source.longitude,
                }}
                radius={source.radius}
                strokeWidth={0}
                fillColor={getCircleFillColor(averageQuality)}
                zIndex={1}
              />
              <Marker
                key={`marker-${index}`}
                coordinate={{
                  latitude: source.latitude,
                  longitude: source.longitude,
                }}
                title={source.name}
                zIndex={2}
                opacity={0}
              />
            </>
          );
        })}

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
              title={`Quality: ${droplet.quality}`}
              description={formatDate(droplet.upload_time)}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={2}
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

      <View style={styles.testBarContainer}>
        <GradientScoreBar />
      </View>

      {lowQualityDroplet && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Low Water Quality Alert</Text>
              <Text style={styles.modalText}>
                A water source at {lowQualityDroplet.latitude.toFixed(4)},{' '}
                {lowQualityDroplet.longitude.toFixed(4)} has a quality score of{' '}
                {lowQualityDroplet.quality}.
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.dismissButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.viewButton]}
                  onPress={handleViewOnMap}
                >
                  <Text style={styles.modalButtonText}>View on Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

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
  testBarContainer: {
    position: 'absolute',
    right: -5,
    top: '50%',
    transform: [{ translateY: -150 }],
    width: 60,
    height: 300,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: '#ff4444',
  },
  viewButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingVertical: 10,
  },
  gradientBar: {
    width: 20,
    height: 300,
    borderWidth: 1,
    borderColor: '#000',
  },
  scoreLabels: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 200,
    marginLeft: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'left',
    left: -11,
    marginBottom: 57.5,
    top: -59.6,
  },
});