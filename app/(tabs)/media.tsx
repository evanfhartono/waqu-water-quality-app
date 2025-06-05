// import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { Alert, Image, StyleSheet, Text, View, Button } from "react-native";

// import { saveToLibraryAsync } from "expo-media-library";
// import React from "react";

// export default function MediaScreen() {
//   const { media, type } = useLocalSearchParams();
//   const router = useRouter();

//   console.log(media, type);

//   return (
//     <View style={styles.container}>
//       {
//         type === "photo" ? (
//           <Image
//             source={{ uri: `file://${media}` }}
//             style={{ width: "100%", height: "80%", resizeMode: "contain" }}
//           />
//         ) : null
//         // <Video source={{ uri: media }} style={{ width: "100%", height: "100%" }} />
//       }
//       <Button
//         title="Save to gallery"
//         // containerStyle={{ alignSelf: "center" }}
//         onPress={async () => {
//           saveToLibraryAsync(media as string);
//           Alert.alert("Saved to gallery!");
//           router.back();
//         }}
//       />
//       <Link href="/" style={styles.link}>
//         <Text>Delete and go back</Text>
//       </Link>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   link: {
//     marginTop: 15,
//     paddingVertical: 15,
//     alignSelf: "center",
//   },
// });