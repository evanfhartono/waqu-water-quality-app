import { useState } from "react";
import { View, StyleSheet, Alert, Modal } from "react-native";
import { Avatar, Menu, Button, Divider, TextInput, Text } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { account } from "@/lib/appwrite";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [changeEmailVisible, setChangeEmailVisible] = useState(false);
  const [changeUsernameVisible, setChangeUsernameVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert("Signed Out", "You have been signed out successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await account.updatePassword(newPassword, currentPassword);
      Alert.alert("Success", "Password changed successfully.");
      setChangePasswordVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
  if (!newEmail || !emailPassword) {
    Alert.alert("Error", "Please enter both your new email and current password.");
    return;
  }

  setIsChangingEmail(true);
  try {
    await account.updateEmail(newEmail, emailPassword);
    Alert.alert("Success", "Email updated successfully.");
    setChangeEmailVisible(false);
    setEmailPassword(""); // clear after success
  } catch (error: any) {
    Alert.alert("Error", error.message || "Failed to change email.");
  } finally {
    setIsChangingEmail(false);
  }
};


  const handleChangeUsername = async () => {
    if (!newUsername) {
      Alert.alert("Error", "Please enter a new username.");
      return;
    }

    setIsChangingUsername(true);
    try {
      await account.updateName(newUsername);
      Alert.alert("Success", "Username updated successfully.");
      setChangeUsernameVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change username.");
    } finally {
      setIsChangingUsername(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar.Icon size={100} icon="account-circle" style={styles.avatar} />
        <Text style={styles.username}>{user?.name || "Username"}</Text>
        <Text style={styles.email}>{user?.email || "Email"}</Text>
      </View>

      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button icon="menu" onPress={openMenu} style={styles.menuButton}>
              Menu
            </Button>
          }
          anchorPosition="bottom"
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              setChangeUsernameVisible(true);
            }}
            title="Change Username"
            titleStyle={{ color: "#494949" }}
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              setChangeEmailVisible(true);
            }}
            title="Change Email"
            titleStyle={{ color: "#494949" }}
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              setChangePasswordVisible(true);
            }}
            title="Change Password"
            titleStyle={{ color: "#494949" }}
          />
          <Divider />
          <Menu.Item onPress={handleSignOut} 
          title="Sign Out" 
          titleStyle={{ color: "#ff3333" }}
          />
        </Menu>
      </View>

      {/* Change Username Modal */}
      <Modal visible={changeUsernameVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              label="New Username"
              value={newUsername}
              onChangeText={setNewUsername}
              style={styles.input}
              textColor="#00000" // <- sets the input text color
              theme={{
              colors: {
                primary: "#3399ff", // ← change this to your desired color
                text: "#000000",     // text color inside field
                placeholder: "#888888", // label when not focused
              },
            }}
            />
            <Button
              mode="contained"
              onPress={handleChangeUsername}
              loading={isChangingUsername}
              disabled={isChangingUsername}
              style={styles.button}
            >
              Change Username
            </Button>
            <Button onPress={() => setChangeUsernameVisible(false)} 
            style={styles.cancelButton}
            labelStyle={{ color: "#ff0000" }}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Change Email Modal */}
      <Modal visible={changeEmailVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Email</Text>

            <TextInput
              label="New Email"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              style={styles.input}
              textColor="#00000" // <- sets the input text color
              theme={{
              colors: {
                primary: "#3399ff", // ← change this to your desired color
                text: "#000000",     // text color inside field
                placeholder: "#888888", // label when not focused
              },
            }}
            />
            <TextInput
              label="Current Password"
              value={emailPassword}
              onChangeText={setEmailPassword}
              secureTextEntry
              style={styles.input}
              textColor="#00000" // <- sets the input text color
              theme={{
              colors: {
                primary: "#3399ff", // ← change this to your desired color
                text: "#000000",     // text color inside field
                placeholder: "#888888", // label when not focused
              },
            }}
            />

            <Button
              mode="contained"
              onPress={handleChangeEmail}
              loading={isChangingEmail}
              disabled={isChangingEmail}
              style={styles.button}
            >
              Change Email
            </Button>

            <Button onPress={() => setChangeEmailVisible(false)} 
            style={styles.cancelButton}
            labelStyle={{ color: "#ff0000" }}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>


      {/* Change Password Modal */}
      <Modal visible={changePasswordVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              textColor="#00000" // <- sets the input text color
              theme={{
              colors: {
                primary: "#3399ff", // ← change this to your desired color
                text: "#000000",     // text color inside field
                placeholder: "#888888", // label when not focused
              },
            }}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              textColor="#00000" // <- sets the input text color
              theme={{
              colors: {
                primary: "#3399ff", // ← change this to your desired color
                text: "#000000",     // text color inside field
                placeholder: "#888888", // label when not focused
              },
            }}
            />
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
              style={styles.button}
            >
              Change Password
            </Button>
            <Button onPress={() => setChangePasswordVisible(false)} 
            style={styles.cancelButton}
            labelStyle={{ color: "#ff0000" }}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  profileContainer: { alignItems: "center", marginBottom: 32 },
  avatar: { backgroundColor: "#3399ff" },
  username: { fontSize: 20, fontWeight: "600", marginTop: 8, color: "#000000" },
  menuContainer: { position: "absolute", top: 16, right: 16 },
  menuButton: { backgroundColor: "#3399ff" },
  menuContent: { backgroundColor: "white" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { marginBottom: 16, backgroundColor: "#F5F5F5", color: "#3399ff" },
  button: { marginTop: 8, backgroundColor: "#3399ff" },
  cancelButton: { marginTop: 8 },
  email: { fontSize: 16, color: "#767676", marginTop: 4 },

});


