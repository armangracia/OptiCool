import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

const PendingStatusCard = () => {
  const currentDate = moment().format("MMM Do YYYY");

  return (
    <View style={styles.cardContainer}>
      <View style={styles.dateLocationContainer}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#a0a0a0" />
          <Text style={styles.locationText}>Taguig, Philippines</Text>
        </View>
      </View>

      <View style={styles.weatherContainer}>
        <Text style={styles.weatherText}>
          Weather info temporarily unavailable.
        </Text>
        <Ionicons name="cloud-outline" size={24} color="#a0a0a0" />
      </View>

      <View style={styles.divider} />

      <View style={styles.energyContainer}>
        <Text style={styles.energySaved}>⚡ -- watt saved</Text>
        <View style={styles.spacer} />
        <Text style={styles.energyUsed}>⚡ -- watt used</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    width: "88%",
    alignSelf: "center",
    marginTop: 45,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  dateLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#a0a0a0",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#a0a0a0",
    marginLeft: 5,
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
    width: "100%",
  },
  weatherText: {
    fontSize: 12,
    color: "#a0a0a0",
    textAlign: "left",
    flex: 1,
    flexWrap: "wrap",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#d0d0d0",
    marginVertical: 15,
  },
  energyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  energySaved: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b0b0b0",
  },
  spacer: {
    width: 20,
  },
  energyUsed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b0b0b0",
  },
});

export default PendingStatusCard;
