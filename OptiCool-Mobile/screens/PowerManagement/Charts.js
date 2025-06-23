import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import HumidityCharts from "../PowerManagement/HumidityCharts";
import TempCharts from "../PowerManagement/TempCharts";
import PowerConsumptionCharts from "../PowerManagement/PowerConsumptionCharts";
// import ExportPDF from "../PowerManagement/ExportPDF";

const Charts = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a unified loading state
  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 8500); // Adjust this based on real loading time or use callbacks from children

    return () => clearTimeout(loadTimeout);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <>
          {/* <ExportPDF /> */}
          <HumidityCharts />
          <TempCharts />
          <PowerConsumptionCharts />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#eafaf1",
    minHeight: "100%",
  },
  loader: {
    marginTop: 50,
  },
});

export default Charts;
