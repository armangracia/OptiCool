import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import HumidityCharts from "../PowerManagement/HumidityCharts";
import TempCharts from "../PowerManagement/TempCharts";
import PowerConsumptionCharts from "../PowerManagement/PowerConsumptionCharts";
import ExportPDF from "../PowerManagement/ExportPDF";

const Charts = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {/* <ExportPDF /> */}
      <HumidityCharts />
      <TempCharts />
      <PowerConsumptionCharts />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#eafaf1",
  },
});

export default Charts;
