import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>Data Extraction</Text>

      <TouchableOpacity style={styles.button} onPress={handleInsideHumidity}>
        <Text style={styles.buttonText}>Extract Inside Humidity Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleOutsideHumidity}>
        <Text style={styles.buttonText}>Extract Outside Humidity Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleInsideTemperature}>
        <Text style={styles.buttonText}>Extract Inside Temperature Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleOutsideTemperature}>
        <Text style={styles.buttonText}>Extract Outside Temperature Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePowerData}>
        <Text style={styles.buttonText}>Extract Power Consumption</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#4682B4",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DataExtraction;
