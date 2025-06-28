import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import PendingStatusCard from "../PendingScreens/PendingStatusCard";
import PendingRoomCarousel from "../PendingScreens/PendingRoomCarousel";
import PendingAppliancesScreen from "../PendingScreens/PendingAppliancesScreen";
import MainRow from "../HomeScreens/MainRow";
import { removeAuth } from "../../states/authSlice";

const MockupDashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

  const handleLogout = () => {
    dispatch(removeAuth());
    navigation.replace("Login");
  };

  const handleOptionSelect = (option) => {
    setDropdownVisible(false);
    if (option === "Logout") {
      handleLogout();
    } else {
      navigation.navigate(option);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      setDismissed(false);
    }, 6000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingBannerText}>
            ⚠️ Your account is pending approval. Contact the administrator for
            access.
          </Text>
        </View>

        <Text style={styles.intro}>Manage Room</Text>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.greeting}>
              Hey, <Text style={styles.name}>{user.username}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleDropdown}
            style={styles.avatarContainer}
          >
            <Avatar.Image
              source={{
                uri:
                  user.avatar?.url || "https://example.com/default-avatar.png",
              }}
              size={40}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {isDropdownVisible && (
          <Modal
            transparent
            animationType="none"
            visible={isDropdownVisible}
            onRequestClose={toggleDropdown}
          >
            <Pressable style={styles.overlay} onPress={toggleDropdown} />
            <View style={styles.dropdown}>
              <TouchableOpacity
                onPress={() => handleOptionSelect("Profile")}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect("Settings")}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect("Logout")}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}

        <PendingStatusCard />
        <PendingRoomCarousel />
        <PendingAppliancesScreen />
        <MainRow weatherData={null} />

        {!dismissed && (
          <View style={styles.pendingOverlay} pointerEvents="auto">
            <View style={styles.pendingMessageBox}>
              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.pendingText}>
                Your account is currently pending approval.
              </Text>
              <Text style={styles.pendingSubtext}>
                You will be notified once you're approved.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingBanner: {
    width: "100%",
    backgroundColor: "#fff3cd",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    elevation: 2,
  },
  pendingBannerText: {
    color: "#856404",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  intro: {
    fontSize: 11,
    fontWeight: "bold",
    color: "grey",
    marginTop: 20,
    marginBottom: -25,
    marginRight: 240,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "normal",
    color: "#050a20",
    alignSelf: "flex-start",
    marginLeft: 7,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4f5e70",
  },
  avatar: {
    marginTop: -10,
    marginLeft: 30,
    marginRight: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dropdownItem: {
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingMessageBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: Dimensions.get("window").width * 0.8,
    alignItems: "center",
    position: "relative",
  },
  pendingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f5e70",
    marginBottom: 10,
    textAlign: "center",
  },
  pendingSubtext: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  dismissButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
  },
  dismissText: {
    fontSize: 18,
    color: "#888",
  },
});

export default MockupDashboard;
