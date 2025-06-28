import React from "react";
import { Button, Alert } from "react-native";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl"; // your custom base URL helper

const SeedButton = () => {
  const handlePress = async () => {
    try {
      await axios.post(`${baseURL}/api/seed-data`);
      Alert.alert("Success", "All data uploaded to MongoDB ✅");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.error || err.message);
    }
  };

  return <Button title="Upload All Data" onPress={handlePress} />;
};

export default SeedButton;
