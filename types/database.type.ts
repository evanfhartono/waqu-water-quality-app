import { Models } from "react-native-appwrite";

export interface Droplet extends Models.Document {
    droplet_id: string,
    user_id: string,
    longitude: number,
    latitude: number,
    quality: number,
    upload_time: string,
}