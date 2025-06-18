import { WATER_SOURCES } from '@/assets/waterSources';
import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { AntDesign } from '@expo/vector-icons';
import { CameraCapturedPicture, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import { useIsFocused } from '@react-navigation/native';

// Haversine formula to calculate distance between two coordinates (in meters)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if user is near a water source (within its specific radius)
const isNearWaterSource = (latitude: number, longitude: number): { isNear: boolean; sourceName?: string } => {
  for (const source of WATER_SOURCES) {
    const distance = calculateDistance(latitude, longitude, source.latitude, source.longitude);
    if (distance <= source.radius) {
      console.log(`Near ${source.name}: ${distance.toFixed(2)} meters (within ${source.radius}m radius)`);
      return { isNear: true, sourceName: source.name };
    }
  }
  console.log('Not near any water source');
  return { isNear: false };
};

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [tmpQuality, setTmpQuality] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  const { user } = useAuth();
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const router = useRouter();
  const isFocused = useIsFocused();

  // Fetch location when the component mounts
  useEffect(() => {
    getCurrentLocation();
    return () => {
      setIsMounted(false); // Cleanup on unmount
    };
  }, []);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in settings.');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      if (isMounted) {
        setLongitude(location.coords.longitude);
        setLatitude(location.coords.latitude);
        console.log('Current Location:', location.coords.latitude, location.coords.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not retrieve your location.');
    }
  };

  // Handle camera ready event
  const handleCameraReady = () => {
    console.log('Camera is ready');
    if (isMounted) {
      setCameraReady(true);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const confirmSubmission = (sourceName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Confirm Submission',
        `You are near ${sourceName}. Confirm submission?`,
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'OK', onPress: () => resolve(true) },
        ]
      );
    });
  };

  const handleSubmit = async (quality: number) => {
    if (!user) {
      console.error('User is not authenticated.');
      throw new Error('User not authenticated');
    }

    try {
      await databases.createDocument(
        '6839e760003b3099528a',
        '6839e96e001331fdd3c7',
        ID.unique(),
        {
          droplet_id: ID.unique(),
          user_id: user.$id,
          longitude: longitude,
          latitude: latitude,
          quality: quality,
          upload_time: new Date().toISOString(),
        }
      );
      console.log('Data submitted successfully.');
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Submission Failed', 'Could not submit data. Try again.');
      throw error;
    }
  };

  const handleTakePhoto = async () => {
    console.log('Attempting to take photo...');
    if (!cameraRef.current || !cameraReady) {
      console.error('Camera is not ready or reference is missing.');
      Alert.alert('Camera Error', 'Camera is not ready. Please try again.');
      return;
    }
    try {
      console.log('Camera ref exists, capturing photo...');
      const takenPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        exif: false,
      });
      console.log('Photo captured successfully');
      if (isMounted) {
        setPhoto(takenPhoto);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.');
    }
  };

  const handleRetakePhoto = () => {
    console.log('Retaking photo, returning to camera view...');
    if (isMounted) {
      setPhoto(null);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (isNaN(longitude) || isNaN(latitude)) {
      console.error('Invalid data:', { longitude, latitude });
      Alert.alert('Invalid Data', 'Location or quality data is missing.');
      return;
    }

    // Check if user is near a water source
    const { isNear, sourceName } = isNearWaterSource(latitude, longitude);
    if (!isNear) {
      Alert.alert('Submission Rejected', 'You must be near a lake or river to submit data.');
      return;
    }

    // Confirm submission
    const confirmed = await confirmSubmission(sourceName!);
    if (!confirmed) {
      console.log('Submission cancelled by user');
      return;
    }

    if (!photo || !photo.base64) {
      console.error('Photo or base64 data is missing.');
      Alert.alert('Error', 'Photo data is missing.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('photo', photo.base64);

    try {
      console.log('Sending request to API...');
      const response = await fetch('https://waqu.azurewebsites.net/api/predict', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      console.log('Response received.');

      if (response.ok) {
        const data = await response.json();
        const quality = Math.round(data.confidence);
        setTmpQuality(quality);
        console.log(`Confidence: ${data.confidence}, Rounded Quality: ${quality}`);

        await handleSubmit(quality);
        setLoading(false);
        Alert.alert(
          'Submission Successful',
          `Quality Score: ${quality}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        setLoading(false);
        console.error(`API error: ${response.status}`);
        Alert.alert('Analysis Failed', 'Could not analyze the photo.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Analysis error:', error);
      Alert.alert('Error', 'An error occurred during analysis. Please try again.');
    }
    handleRetakePhoto()
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Analyzing and Submitting...</Text>
      </View>
    );
  }

  if (photo) {
    return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} handleAnalyzePhoto={handleAnalyzePhoto} />;
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container} key={cameraReady ? 'camera-ready' : 'camera-not-ready'}>
      {isFocused && (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          onCameraReady={handleCameraReady}
          enableTorch={false}
        >
          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <AntDesign name="retweet" size={44} color="black" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={handleTakePhoto} disabled={!cameraReady}>
              <AntDesign name="camera" size={44} color={cameraReady ? 'black' : 'gray'} />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'gray',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});