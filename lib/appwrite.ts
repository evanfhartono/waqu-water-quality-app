// npx expo install react-native-appwrite react-native-url-polyfill
// config with appwrite api
import {Account, Client, Databases} from 'react-native-appwrite';

export const client = new Client().setEndpoint("https://fra.cloud.appwrite.io/v1"!).setProject("68377c4b0036b576c9db"!).setPlatform("co.ricksen.habittracker"!)
  // .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  // .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  // .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!)

export const account = new Account(client) 