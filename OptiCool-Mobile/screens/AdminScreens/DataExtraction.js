import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import dmt3API from "../../services/dmt3API";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";

const DataExtraction = () => {
  const startDate = "2024-08-01";
  const today = new Date().toISOString().split("T")[0];

  const handlePowerData = async () => {
    try {
      const data = await dmt3API.getPowerConsumptionAPI(startDate, today);
      const formattedData = data.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        consumption: entry.consumption,
      }));
      await axios.post(`${baseURL}/save/data`, { power: formattedData });
      Alert.alert("Success", "Power data fetched and saved.");
    } catch (error) {
      console.error("Power data error:", error.message);
      Alert.alert("Error", "Failed to fetch power data.");
    }
  };

  const handleInsideHumidity = async () => {
    try {
      const data = await dmt3API.getInsideHumidityAPI(startDate, today);
      const formattedData = data.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        humidity: entry.humidity,
      }));
      await axios.post(`${baseURL}/save/inside-humidity`, {
        insideHumidity: formattedData,
      });
      Alert.alert("Success", "Inside humidity data saved.");
    } catch (error) {
      console.error("Inside humidity error:", error.message);
      Alert.alert("Error", "Failed to fetch inside humidity data.");
    }
  };

  const handleOutsideHumidity = async () => {
    try {
      const data = await dmt3API.getOutsideHumidityAPI(startDate, today);
      const formattedData = data.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        humidity: entry.humidity,
      }));
      await axios.post(`${baseURL}/save/outside-humidity`, {
        outsideHumidity: formattedData,
      });
      Alert.alert("Success", "Outside humidity data saved.");
    } catch (error) {
      console.error("Outside humidity error:", error.message);
      Alert.alert("Error", "Failed to fetch outside humidity data.");
    }
  };

  const handleInsideTemperature = async () => {
    try {
      const data = await dmt3API.getInsideTemperatureAPI(startDate, today);
      const formattedData = data.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        temperature: entry.temperature,
      }));
      await axios.post(`${baseURL}/save/inside-temperature`, {
        insideTemperature: formattedData,
      });
      Alert.alert("Success", "Inside temperature data saved.");
    } catch (error) {
      console.error("Inside temperature error:", error.message);
      Alert.alert("Error", "Failed to fetch inside temperature data.");
    }
  };

  const handleOutsideTemperature = async () => {
    try {
      const data = await dmt3API.getOutsideTemperatureAPI(startDate, today);
      const formattedData = data.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        temperature: entry.temperature,
      }));
      await axios.post(`${baseURL}/save/outside-temperature`, {
        outsideTemperature: formattedData,
      });
      Alert.alert("Success", "Outside temperature data saved.");
    } catch (error) {
      console.error("Outside temperature error:", error.message);
      Alert.alert("Error", "Failed to fetch outside temperature data.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Data Extraction</Text>

        <Card
          label="Inside Humidity"
          description="Get and save real-time humidity inside the room."
          onPress={handleInsideHumidity}
          image={require("../../assets/humidityextract.png")}
        />
        <Card
          label="Outside Humidity"
          description="Get and save real-time humidity outside the room."
          onPress={handleOutsideHumidity}
          image={require("../../assets/humidityextract.png")}
        />
        <Card
          label="Inside Temperature"
          description="Log inside temperature readings."
          onPress={handleInsideTemperature}
          image={require("../../assets/tempextract.png")}
        />
        <Card
          label="Outside Temperature"
          description="Log outside temperature readings."
          onPress={handleOutsideTemperature}
          image={require("../../assets/tempextract.png")}
        />
        <Card
          label="Power Consumption"
          description="Track energy usage from devices."
          onPress={handlePowerData}
          image={require("../../assets/powerextract.png")}
        />
      </ScrollView>
    </View>
  );
};

const Card = ({ label, description, onPress, image }) => (
  <View style={styles.card}>
    <View style={styles.leftSection}>
      <View style={styles.imageBox}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.cardButton} onPress={onPress}>
      <Text style={styles.buttonText}>Extract</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f4f9fc",
  },
  scrollContainer: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#2c3e50",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  imageBox: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  image: {
    width: 50,
    height: 50,
  },
  cardContent: {
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1f6f78",
  },
  cardDesc: {
    fontSize: 13,
    color: "#555",
  },
  cardButton: {
    backgroundColor: "#50c4b6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default DataExtraction;
