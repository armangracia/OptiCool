import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BarChart } from "react-native-chart-kit";
import axios from "axios";
import baseUrl from "../../assets/common/baseUrl";

function groupByDayAverage(data) {
  const daily = {};
  data.forEach((row) => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10);
    if (!daily[key]) daily[key] = [];
    daily[key].push(Number(row.consumption));
  });

  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const label = new Date(key).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { label, avg: Number(avg.toFixed(2)) };
    });
}

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach((row) => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.consumption));
  });

  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", {
        month: "short",
      })} ${year}`;
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { label, avg: Number(avg.toFixed(2)) };
    });
}

const chartConfig = (barColor) => ({
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: {
    fontSize: 10,
  },
  barPercentage: 0.5,
  fillShadowGradient: barColor,
  fillShadowGradientOpacity: 1,
});

const PowerConsumptionCharts = () => {
  const [powerData, setPowerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/power-consumption/getpowerconsumption`
        );
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        console.log("Fetched power data:", data);
        setPowerData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setPowerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  const grouped =
    viewMode === "daily"
      ? groupByDayAverage(powerData)
      : groupByMonthAverage(powerData);

  console.log("Grouped chart data:", grouped);

  if (grouped.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No power consumption data available.
        </Text>
      </View>
    );
  }

  const chartLabels = grouped.map((row) => row.label);
  const chartWidth = Math.max(
    chartLabels.length * 60,
    Dimensions.get("window").width
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {viewMode === "daily"
          ? "Daily Average Power Consumption"
          : "Monthly Average Power Consumption"}
      </Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>View Mode:</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={viewMode}
            onValueChange={(value) => setViewMode(value)}
            style={styles.picker}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>
        </View>
      </View>

      <ScrollView horizontal>
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: grouped.map((row) => row.avg),
                color: () => "rgba(255, 159, 64, 0.8)",
              },
            ],
            legend: ["Actual"],
          }}
          width={chartWidth}
          height={250}
          yAxisSuffix="kWh"
          fromZero
          chartConfig={chartConfig("rgba(255, 159, 64, 0.8)")}
          horizontallLabelRotation={100}
          style={styles.chart}
        />
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 20,
    margin: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pickerWrapper: {
    marginBottom: 16,
    alignItems: "center",
  },
  pickerBox: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#d0f0c0",
    width: 260,
    borderColor: "#a5d6a7",
  },
  picker: {
    height: 40,
    width: "100%",
    color: "#1b5e20",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    marginRight: 185,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
});

export default PowerConsumptionCharts;
