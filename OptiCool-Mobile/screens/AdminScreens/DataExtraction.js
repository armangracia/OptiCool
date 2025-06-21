import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

const DataExtraction = () => {
  const handleExtract = (type) => {
    Alert.alert(`${type} Extraction`, `Simulating download for ${type.toLowerCase()}...`);
    // TODO: Replace with actual extraction logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Extraction</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleExtract("Temperature Data")}
      >
        <Text style={styles.buttonText}>Extract Temperature Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleExtract("Humidity Data")}
      >
        <Text style={styles.buttonText}>Extract Humidity Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleExtract("Power Consumption")}
      >
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
