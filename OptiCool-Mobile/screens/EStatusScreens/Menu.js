import React, { useCallback, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import dmt3API from "../../services/dmt3API";
import logActivity from "../../assets/common/logActivity";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

const statuses = [
  "Overheating",
  "Producing Unusual Noises",
  "Weak Air",
  "Turning Off Unexpectedly",
  "Not Responding to Commands",
  "Physical Damage",
];

const Menu = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState("AC");
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportedAppliance, setReportedAppliance] = useState("");

  const [applianceStatus, setApplianceStatus] = useState({
    AC: { AC: false },
    Fan: { "Fan 1": true },
    Exhaust: { "Exhaust 1": true },
    Blower: { "Blower 1": true },
  });

  const [isConnected, setIsConnected] = useState(true);
  const pan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => false,
  });

  const menuItems = [
    { name: "AC", icon: "air-conditioner" },
    { name: "Fan", icon: "fan" },
    { name: "Exhaust", icon: "fan-off" },
    { name: "Blower", icon: "air-filter" },
  ];

  const appliances = {
    AC: [{ name: "AC", status: "Active" }],
    Fan: [{ name: "Fan", status: "Active" }],
    Exhaust: [{ name: "Exhaust", status: "Active" }],
    Blower: [{ name: "Blower", status: "Active" }],
  };

  const toggleAppliance = (category, appliance) => {
    if (!isConnected) {
      Alert.alert("Warning", "Not connected to the system");
      return;
    }
    setApplianceStatus((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [appliance]: !prev[category][appliance],
      },
    }));
    setStatusToDevice(appliance, applianceStatus);
  };

  const setStatusToDevice = async (device, applianceStatus) => {
    try {
      await dmt3API.turnOffDevice(device, applianceStatus);
    } catch (err) {
      Alert.alert("No running system", "System not responding.");
    }
  };

  const openReportModal = (appliance) => {
    setReportedAppliance(appliance);
    setSelectedStatus("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedStatus) {
      Alert.alert("Warning", "Please select a status.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User information is missing.");
      return;
    }

    setSubmitting(true);
    try {
      const timeReported = moment().tz("Asia/Manila").format("hh:mm:ss A");
      const reportPayload = {
        appliance: reportedAppliance,
        status: selectedStatus,
        reportDate: new Date(),
        timeReported,
        user: user._id ? user._id : "Missing ID",
      };

      const response = await axios.post(
        `${baseURL}/ereports/ereport`,
        reportPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Report submitted successfully.");

        // 🔥 Log activity here
        await logActivity({
          userId: user._id,
          action: `Reported issue "${selectedStatus}" on ${reportedAppliance}`,
          token,
        });

        setShowReportModal(false);
      } else {
        Alert.alert(
          "Error",
          "Failed to submit report: " + response.data.message
        );
      }
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Error", "Could not submit the report.");
    } finally {
      setSubmitting(false);
    }
  };

  // const getComponentsStatus = async () => {
  //   try {
  //     const data = await dmt3API.getComponentsStatusAPI();
  //     setIsConnected(true);
  //     if (Boolean(data.ac1) !== applianceStatus.AC.AC)
  //       toggleAppliance("AC", "AC");
  //     if (Boolean(data.blower) !== applianceStatus.Blower["Blower 1"])
  //       toggleAppliance("Blower", "Blower 1");
  //     if (Boolean(data.efan) !== applianceStatus.Fan["Fan 1"])
  //       toggleAppliance("Fan", "Fan 1");
  //     if (Boolean(data.exhaust) !== applianceStatus.Exhaust["Exhaust 1"])
  //       toggleAppliance("Exhaust", "Exhaust 1");
  //   } catch {
  //     setIsConnected(false);
  //   }
  // };

  const getComponentsStatus = async () => {
    try {
      const data = await dmt3API.getComponentsStatusAPI();
      setIsConnected(true);

      setApplianceStatus({
        AC: { AC: Boolean(data.ac1) },
        Fan: { "Fan 1": Boolean(data.efan) },
        Exhaust: { "Exhaust 1": Boolean(data.exhaust) },
        Blower: { "Blower 1": Boolean(data.blower) },
      });
    } catch {
      setIsConnected(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getComponentsStatus();
    }, [])
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.container}>
        {/* REPORT MODAL */}
        <Modal visible={showReportModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Report Issue for {reportedAppliance}
              </Text>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.radioOption}
                  onPress={() => setSelectedStatus(status)}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedStatus === status
                        ? "radiobox-marked"
                        : "radiobox-blank"
                    }
                    size={20}
                    color="#2F80ED"
                  />
                  <Text style={styles.statusLabel}>{status}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleSubmitReport}
                  style={[styles.modalButton, { backgroundColor: "#2F80ED" }]}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  style={[styles.modalButton, { backgroundColor: "gray" }]}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Animated.View style={styles.appliancesContainer}>
          <View style={styles.divider} />
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  selected === item.name && styles.selectedItem,
                ]}
                onPress={() => setSelected(item.name)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={24}
                  color={selected === item.name ? "#ffffff" : "#9eaab8"}
                />
                <Text
                  style={[
                    styles.menuText,
                    selected === item.name && styles.selectedText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {appliances[selected].map((appliance, index) => (
            <View key={index} style={styles.applianceRow}>
              <MaterialCommunityIcons
                name="fan"
                size={30}
                color="#6C9AB2"
                style={styles.contentIconStyle}
              />
              <View style={styles.textContainer}>
                <Text style={styles.contentCardText}>{appliance.name}</Text>
                <Text
                  style={[
                    styles.contentCardStatus,
                    {
                      color: applianceStatus[selected][appliance.name]
                        ? "green"
                        : "red",
                    },
                  ]}
                >
                  {applianceStatus[selected][appliance.name] ? "On" : "Off"}
                </Text>
              </View>
              <View style={styles.cardbuttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.powerButton,
                    {
                      backgroundColor: applianceStatus[selected][appliance.name]
                        ? "#4CAF50"
                        : "#FF5252",
                    },
                  ]}
                  onPress={() => toggleAppliance(selected, appliance.name)}
                >
                  <MaterialCommunityIcons
                    name={
                      applianceStatus[selected][appliance.name]
                        ? "power"
                        : "power-off"
                    }
                    size={25}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => openReportModal(appliance.name)}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1 },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ebedf0",
    borderRadius: 10,
    width: 70,
  },
  selectedItem: { backgroundColor: "#2F80ED" },
  menuText: { marginTop: 5, fontSize: 12, color: "#9eaab8" },
  selectedText: { color: "#ffffff" },
  appliancesContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: "100%",
    paddingBottom: 120,
  },
  applianceRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  divider: {
    height: 4,
    width: 80,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 5,
    marginBottom: -10,
  },
  contentCardText: { fontSize: 14, fontWeight: "bold", color: "black" },
  contentCardStatus: { fontSize: 14, fontWeight: "bold" },
  contentIconStyle: { marginRight: 20 },
  cardbuttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: "auto",
  },
  powerButton: {
    borderRadius: 6,
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  reportButton: {
    backgroundColor: "red",
    borderRadius: 6,
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  statusLabel: { marginLeft: 10, fontSize: 14 },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default Menu;
