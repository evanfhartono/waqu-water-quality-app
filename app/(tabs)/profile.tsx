import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Modal, TouchableOpacity } from "react-native";
import { Avatar, Menu, Button, Divider, TextInput, Text } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { account, functions, databases } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { Query } from "react-native-appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

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
  const [streakCount, setStreakCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchStreakCount = async () => {
      try {
        const response = await databases.listDocuments(
          '6839e760003b3099528a',
          '6839e96e001331fdd3c7',
          [Query.equal("user_id", user?.$id ?? "")]
        );
        setStreakCount(response.total);
      } catch (error) {
        console.error("Error fetching streak count:", error);
      }
    };

    if (user) {
      fetchStreakCount();
    }
  }, [user]);

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
      await account.updatePassword(confirmPassword, confirmPassword);
      const userData = await account.get();
      const userId = userData.$id;
      const response = await functions.createExecution(
        'deleteUser',
        JSON.stringify({ userId }),
        false
      );
      console.log("Function response:", response);
      const result = JSON.parse(response.responseBody);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete account.");
      }
      await account.deleteSession('current');
      Alert.alert("Success", "Account deleted successfully.");
      setConfirmPassword("");
      setDeleteAccountModalVisible(false);
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
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Animatable.View animation="fadeInUp" duration={800} style={styles.profileCard}>
        <Avatar.Icon size={120} icon="account-circle" style={styles.avatar} />
        <Text style={styles.username}>{user?.email || "User"}</Text>
        <View style={styles.streakContainer}>
          <MaterialCommunityIcons
            name="water"
            size={Math.min(40 + Math.log(streakCount + 1) * 10, 800)}
            color="lightblue"
          />
          <Text style={styles.streakText}>{streakCount}</Text>
        </View>
      </Animatable.View>

      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
            </TouchableOpacity>
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
            leadingIcon="lock"
          />
          <Divider />
          <Menu.Item
            onPress={handleSignOut}
            title="Sign Out"
            leadingIcon="logout"
          />
        </Menu>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: '#3399ff', background: '#fff' } }}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: '#3399ff', background: '#fff' } }}
            />
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Change Password
            </Button>
            <Button
              mode="text"
              onPress={() => setChangePasswordModalVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
          </Animatable.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    backgroundColor: '#3399ff',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  streakContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  streakText: {
    position: 'absolute',
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#3399ff',
    borderRadius: 12,
    paddingVertical: 4,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  cancelButtonLabel: {
    color: '#3399ff',
    fontSize: 16,
    fontWeight: '600',
  },
});