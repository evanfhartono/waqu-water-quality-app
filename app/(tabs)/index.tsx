import { databases, client, RealtimeResponse } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Droplet } from '@/types/database.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const INITIAL_REGION = {
  latitude: -6,
  longitude: 106,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

const getColor = (score: number) => {
  const t = Math.min(Math.max(score / 100, 0), 1);
  const hue = 120 * t;
  const saturation = 1;
  const lightness = 0.5;

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
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

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
};

export default function App() {
  const { user } = useAuth();
  const [droplet, setDroplet] = useState<Droplet[]>();
  const [userLocation, setUserLocation] = useState<Number>();

  const fetchDroplet = async () => {
    try {
      const response = await databases.listDocuments(
        '6839e760003b3099528a',
        '6839e96e001331fdd3c7'
      );
      console.log(response.documents);
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
          if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            fetchDroplet();
          } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
            fetchDroplet();
          } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
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
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        {droplet?.length === 0 ? (
          <View>
            <Text>You haven't predicted any water yet</Text>
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
              anchor={{ x: 0.5, y: 1 }} // Anchor bottom-center of the icon to the coordinate
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons
                  name="circle"
                  size={40} // Increased size to fit text
                  color={getColor(droplet.quality)}
                />
                <Text style={styles.markerText}>{droplet.quality}</Text>
              </View>
              {/* <Callout>
                <View style={styles.bubble}>
                  <Text style={styles.name}>Water Quality: {droplet.quality}</Text>
                  <Text>Description: test</Text>
                </View>
              </Callout> */}
            </Marker>
          ))
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Ensure text can be positioned absolutely
  },
  markerText: {
    position: 'absolute',
    color: '#fff', // White text for contrast
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
});