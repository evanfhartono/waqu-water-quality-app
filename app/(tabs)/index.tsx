import { databases, client, RealtimeResponse } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { Droplet } from '@/types/database.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const INITIAL_REGION = {
    latitude: -6,
    longitude: 106,
    latitudeDelta: 2,
    longitudeDelta: 2
}

const getColor = (score: number) => {
  const t = Math.min(Math.max(score / 100, 0), 1); // Clamp score to 0-100 range
  const r = Math.round(255 * (1 - t)); // Red decreases from 255 to 0
  const b = Math.round(255 * t);      // Blue increases from 0 to 255
  return `rgb(${r}, 0, ${b})`;        // Green stays 0, creating red-to-blue gradient
};

const [userLocation, setUserLocation] = useState<Number>()

export default function App() {

  const { user } = useAuth()

  const [droplet, setDroplet] = useState<Droplet[]>()

  const fetchDroplet = async () => {
    try {
        const response = await databases.listDocuments(
            "6839e760003b3099528a",
            "6839e96e001331fdd3c7"
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
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFill} 
      provider={PROVIDER_GOOGLE} 
      initialRegion={INITIAL_REGION}
      showsMyLocationButton={true}
      showsUserLocation={true}
      >
        {droplet?.length === 0 ? (
          <View><Text>You havent predict any water yet</Text></View>
        ) : (
          droplet?.map((droplet, key) => (
            <Marker 
              // key={}
              coordinate={{ 
                latitude: droplet.latitude,
                longitude: droplet.longitude
              }}
              title={droplet.quality.toString()}
              description='test'
              pinColor='#fff'
            >
            </Marker>
          ))
        )}

      </MapView>
    </View>
  );
}

// export default ExploreScreen;

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    width: 150
  },
  name: {
    fontSize: 16,
    marginBottom: 5
  },
  image: {
    width: 120,
    height: 80
  },
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5
  }
})