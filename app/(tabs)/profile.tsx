import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView } from "react-native";
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
  const [changeUsernameModalVisible, setChangeUsernameModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
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

  const handleChangeUsername = async () => {
    if (!newUsername) {
      Alert.alert("Error", "Please enter a new username.");
      return;
    }

    setIsChangingUsername(true);
    try {
      await account.updateName(newUsername);
      Alert.alert("Success", "Username updated successfully.");
      setChangeUsernameModalVisible(false);
      setNewUsername("");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to change username.");
      }
    } finally {
      setIsChangingUsername(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <Animatable.View animation="fadeIn" duration={800}>
            <Avatar.Icon size={120} icon="account-circle" style={styles.profileImage} />
          </Animatable.View>
          <Text style={styles.name}>{user?.name || user?.email || "User"}</Text>
          <Text style={styles.title}>App User</Text>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity style={styles.editButton} onPress={openMenu}>
                <Text style={styles.editButtonText}>Profile Menu</Text>
              </TouchableOpacity>
            }
            anchorPosition="bottom"
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                closeMenu();
                setChangeUsernameModalVisible(true);
              }}
              title="Change Username"
              leadingIcon="account"
            />
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

        <Animatable.View animation="fadeInUp" duration={800} style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="water" size={24} color="#1976d2" />
              <Text style={styles.statNumber}>{streakCount}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </Animatable.View>

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
                theme={{ colors: { primary: '#4a6ea9', background: '#fff' } }}
              />
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
                theme={{ colors: { primary: '#4a6ea9', background: '#fff' } }}
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

        <Modal
          animationType="fade"
          transparent={true}
          visible={changeUsernameModalVisible}
          onRequestClose={() => setChangeUsernameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Username</Text>
              <TextInput
                label="New Username"
                value={newUsername}
                onChangeText={setNewUsername}
                style={styles.input}
                theme={{ colors: { primary: '#4a6ea9', background: '#fff' } }}
              />
              <Button
                mode="contained"
                onPress={handleChangeUsername}
                loading={isChangingUsername}
                disabled={isChangingUsername}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Change Username
              </Button>
              <Button
                mode="text"
                onPress={() => setChangeUsernameModalVisible(false)}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
            </Animatable.View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
    marginTop: 20,
    borderRadius: 20,
    width: 400,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#4a6ea9',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#4a6ea9',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
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
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: 400,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    fontWeight: 'bold',
    color: '#2c3e50',
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
    backgroundColor: '#4a6ea9',
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
    color: '#4a6ea9',
    fontSize: 16,
    fontWeight: '600',
  },
});