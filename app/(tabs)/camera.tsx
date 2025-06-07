import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import { AntDesign } from '@expo/vector-icons';
import { CameraCapturedPicture, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [tmpQuality, setTmpQuality] = useState<number>(0);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto =  async () => {
    if (cameraRef.current) {
        const options = {
            quality: 1,
            base64: true,
            exif: false,
        };
        const takedPhoto = await cameraRef.current.takePictureAsync(options);

        setPhoto(takedPhoto);
    }
  }; 

  const handleRetakePhoto = () => setPhoto(null);

  const handleAnalyzePhoto = async () => {
    if (photo === null) {
      console.error('Photo is null.')
      return;
    }
    const b64 = photo.base64;
    if (b64 === undefined) {
      console.error('Photo base64 is undefined.');
      return;
    }
    const formData = new FormData();
    formData.append('photo', b64);
    
    try {
      console.log('Sending request...');
      const response = await fetch(process.env.EXPO_PUBLIC_API_PREDICT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      console.log('Response received.');
  
      if (response.ok) {
        const data = await response.json();
        setTmpQuality(data.confidence);
        console.log(`Confidence: ${data.confidence}`);
      } else {
        console.error(`API error with status code ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (photo) return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} handleAnalyzePhoto={handleAnalyzePhoto} />

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name='retweet' size={44} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name='camera' size={44} color='black' />
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});