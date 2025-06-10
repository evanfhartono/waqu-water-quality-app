import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { AntDesign } from '@expo/vector-icons';
import { CameraCapturedPicture, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ID } from 'react-native-appwrite';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [tmpQuality, setTmpQuality] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state
  const cameraRef = useRef<CameraView | null>(null);

  const { user } = useAuth();
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const router = useRouter();

  // Fetch location when the component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in settings.');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLongitude(location.coords.longitude);
      setLatitude(location.coords.latitude);
      console.log('Current Location:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not retrieve your location.');
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

  const handleSubmit = async (quality: number) => {
    if (!user) {
      console.error('User is not authenticated.');
      throw new Error('User not authenticated');
    }

    if (isNaN(longitude) || isNaN(latitude) || isNaN(quality)) {
      console.error('Invalid data:', { longitude, latitude, quality });
      Alert.alert('Invalid Data', 'Location or quality data is missing.');
      throw new Error('Invalid data');
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

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      const takenPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(takenPhoto);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  const handleAnalyzePhoto = async () => {
    if (!photo || !photo.base64) {
      console.error('Photo or base64 data is missing.');
      return;
    }

    setLoading(true); // Show loading screen

    const formData = new FormData();
    formData.append('photo', photo.base64);

    try {
      console.log('Sending request...');
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
        const quality = Math.round(data.confidence); // Convert to integer
        setTmpQuality(quality);
        console.log(`Confidence: ${data.confidence}, Rounded Quality: ${quality}`);

        // Submit data to database
        await handleSubmit(quality);

        setLoading(false); // Hide loading screen

        // Show success alert and navigate back on OK
        Alert.alert(
          'Submission Successful',
          `Quality Score: ${quality}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        setLoading(false); // Hide loading screen
        console.error(`API error: ${response.status}`);
        Alert.alert('Analysis Failed', 'Could not analyze the photo.');
      }
    } catch (error) {
      setLoading(false); // Hide loading screen
      console.error('Analysis error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
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

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name="camera" size={44} color="black" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});