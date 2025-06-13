import { useState } from "react";
import { View, StyleSheet, Alert, Modal } from "react-native";
import { Avatar, Menu, Button, Divider, TextInput, Text } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { account, functions } from "@/lib/appwrite";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
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
      setCurrentPassword("");
      setNewPassword("");
      setChangePasswordModalVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      Alert.alert("Error", "Please enter your password to confirm.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      // Verify password
      await account.updatePassword(confirmPassword, confirmPassword);
      // Get user ID
      const userData = await account.get();
      const userId = userData.$id;
      // Call server-side function to delete account
      const response = await functions.createExecution(
        'deleteUser', // Double-check this matches the Function ID in the console
        JSON.stringify({ userId }),
        false
      );
      console.log("Function response:", response); // Debug log
      const result = JSON.parse(response.responseBody);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete account.");
      }
      // Clear client-side session
      await account.deleteSession('current');
      Alert.alert("Success", "Account deleted successfully.");
      setConfirmPassword("");
      setDeleteAccountModalVisible(false);
      // Redirect to sign-in screen
      router.replace("/auth");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Function with the requested ID could not be found")) {
          Alert.alert("Error", "Delete function not found. Please ensure the function is deployed correctly.");
        } else {
          Alert.alert("Error", error.message);
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar.Icon size={100} icon="account-circle" style={styles.avatar} />
        <Text style={styles.username}>{user?.email || "User"}</Text>
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
              setChangePasswordModalVisible(true);
            }}
            title="Change Password"
          />
          {/* <Menu.Item
            onPress={() => {
              closeMenu();
              setDeleteAccountModalVisible(true);
            }}
            title="Delete Account"
          /> */}
          <Divider />
          <Menu.Item onPress={handleSignOut} title="Sign Out" />
        </Menu>
      </View>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#767b81"
              activeOutlineColor="#3399ff"
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#767b81"
              activeOutlineColor="#3399ff"
            />
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
              style={styles.button}
              labelStyle={{ color: "#FFFFFF" }}
            >
              Change Password
            </Button>
            <Button
              mode="outlined"
              onPress={() => setChangePasswordModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteAccountModalVisible}
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#767b81"
              activeOutlineColor="#3399ff"
            />
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              loading={isDeletingAccount}
              disabled={isDeletingAccount}
              style={styles.button}
              labelStyle={{ color: "#FFFFFF" }}
            >
              Delete Account
            </Button>
            <Button
              mode="outlined"
              onPress={() => setDeleteAccountModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: "#3399ff",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    color: "#000000",
  },
  menuContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  menuButton: {
    backgroundColor: "#3399ff",
  },
  menuContent: {
    backgroundColor: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#3399ff",
  },
  cancelButton: {
    marginTop: 8,
  },
});