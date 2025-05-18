import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { removeAuth } from "../../states/authSlice";

const MockupDashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(removeAuth());
    navigation.replace("Login"); // Adjust route name if needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mockup Dashboard</Text>
      <Text>This is a mock-up dashboard for regular users of the mobile app.</Text>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={{ marginTop: 30, backgroundColor: "#000" }}
        icon="logout"
      >
        Log out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default MockupDashboard;
