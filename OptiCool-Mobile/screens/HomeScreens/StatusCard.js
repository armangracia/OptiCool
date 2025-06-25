import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import dmt3API from "../../services/dmt3API";

const StatusCard = () => {
  const currentDate = moment().format("MMM Do YYYY");

  const [wattUsed, setWattUsed] = useState("--");
  const [wattSaved, setWattSaved] = useState("--");

  useEffect(() => {
    const fetchEnergyStats = async () => {
      try {
        const res = await dmt3API.getDevicesDataAPI();
        const used = res?.power_consumption || 0;

        const currentHour = new Date().getHours();

        let dynamicBaseline;

        if (currentHour >= 6 && currentHour <= 10) {
          dynamicBaseline = 120 + Math.random() * 30;
        } else if (currentHour > 10 && currentHour <= 17) {
          dynamicBaseline = 200 + Math.random() * 40;
        } else if (currentHour > 17 && currentHour <= 22) {
          dynamicBaseline = 150 + Math.random() * 25;
        } else {
          dynamicBaseline = 90 + Math.random() * 20;
        }

        dynamicBaseline = parseFloat(dynamicBaseline.toFixed(2));
        const saved = Math.max(0, dynamicBaseline - used).toFixed(2);

        setWattUsed(used);
        setWattSaved(saved);
      } catch (error) {
        console.error("Failed to fetch energy stats:", error.message);
        setWattUsed("--");
        setWattSaved("--");
      }
    };

    fetchEnergyStats();
  }, []);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.dateLocationContainer}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#4f5e70" />
          <Text style={styles.locationText}>Taguig, Philippines</Text>
        </View>
      </View>

      <View style={styles.weatherContainer}>
        <Text style={styles.weatherText}>
          It’s sunny today, make the most out of daylight.
        </Text>
        <Ionicons name="sunny-outline" size={24} color="#FFA500" />
      </View>

      <View style={styles.divider} />

      {/* Energy Stats - Horizontally aligned */}
      <View style={styles.energyContainer}>
        <Text style={styles.energySaved}>⚡ {wattSaved} watt saved</Text>
        <View style={styles.spacer} />
        <Text style={styles.energyUsed}>⚡ {wattUsed} watt used</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    width: "88%",
    alignSelf: "center",
    marginTop: 35,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  dateLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4f5e70",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4f5e70",
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
    color: "#4f5e70",
    textAlign: "left",
    flex: 1,
    flexWrap: "wrap",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e0e0e0",
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
    color: "#00AA00",
  },
  spacer: {
    width: 20,
  },
  energyUsed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D9534F",
  },
});

export default StatusCard;
