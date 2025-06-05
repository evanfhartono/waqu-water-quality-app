import { databases } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, TextInput } from "react-native-paper";

export default function UserLogScreen() {
  const {user} = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if(!user)return;
    try {
      await databases.createDocument(
        "6839e760003b3099528a",
        "6839e96e001331fdd3c7",
        ID.unique(),
        {
          droplet_id: ID.unique(),
          user_id: user.$id,
          longitude: 10.2,
          latitude: 3.2,
          quality: 50.5,
          upload_time: new Date().toISOString()
        }
      );
      router.back();
    }catch (error) {
      console.log(error)
    }

  }
    return (
        <View>
          <Text>Login page</Text>
          <TextInput label="Title" mode="outlined"/>
          <TextInput label="Description" mode="outlined"/>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            // disabled={!title || !description}
          >
            Add Coordinate
          </Button>
        </View>
    );
}
