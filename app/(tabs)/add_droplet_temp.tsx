import { databases } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react"; // Ensure useState is imported

export default function UserLogScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // State for input fields
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [quality, setQuality] = useState(""); // New state for quality

  const handleSubmit = async () => {
    if (!user) return;

    // Convert input strings to numbers
    const parsedLongitude = parseFloat(longitude);
    const parsedLatitude = parseFloat(latitude);
    const parsedQuality = parseFloat(quality); // Parse quality

    // Basic validation
    if (isNaN(parsedLongitude) || isNaN(parsedLatitude) || isNaN(parsedQuality)) {
      console.log("Invalid input. Please enter numbers for longitude, latitude, and quality.");
      // You might want to show an alert to the user here
      return;
    }

    try {
      await databases.createDocument(
        "6839e760003b3099528a",
        "6839e96e001331fdd3c7",
        ID.unique(),
        {
          droplet_id: ID.unique(),
          user_id: user.$id,
          longitude: parsedLongitude,
          latitude: parsedLatitude,
          quality: parsedQuality, // Use the parsed quality value
          upload_time: new Date().toISOString(),
        }
      );
      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <Text>Login page</Text>
      {/* Title and Description inputs (unchanged, but can be managed with state too) */}
      <TextInput
        label="Title"
        mode="outlined"
      />
      <TextInput
        label="Description"
        mode="outlined"
      />
      
      {/* Longitude Input */}
      <TextInput
        label="Longitude"
        mode="outlined"
        keyboardType="numeric"
        value={longitude}
        onChangeText={setLongitude}
      />

      {/* Latitude Input */}
      <TextInput
        label="Latitude"
        mode="outlined"
        keyboardType="numeric"
        value={latitude}
        onChangeText={setLatitude}
      />

      {/* Quality Input */}
      <TextInput
        label="Quality"
        mode="outlined"
        keyboardType="numeric" // Quality is typically a number (e.g., 0-100)
        value={quality}
        onChangeText={setQuality}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        // You might want to enable/disable based on all required fields
        // disabled={!longitude || !latitude || !quality}
      >
        Add Coordinate
      </Button>
    </View>
  );
}