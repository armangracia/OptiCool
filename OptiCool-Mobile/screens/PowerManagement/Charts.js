import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const Charts = () => {
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [0.3, 0.5, 0.6, 0.4, 0.7, 0.8, 0.6],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Electricity Usage Trend</Text>
      <Text style={styles.subtitle}>Last 7 Days (in kWh)</Text>

      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisSuffix=" kWh"
        chartConfig={{
          backgroundColor: "#000000",
          backgroundGradientFrom: "#222",
          backgroundGradientTo: "#444",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
});

export default Charts;
