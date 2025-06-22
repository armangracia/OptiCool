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
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import baseUrl from "../../assets/common/baseUrl";

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp).toISOString().slice(0, 10);
    if (!daily[date]) daily[date] = [];
    daily[date].push(Number(row.temperature));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, temps]) => {
      const label = new Date(key).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.temperature));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, temps]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", {
        month: "short",
      })} ${year}`;
      return {
        key,
        label,
        avg: Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2)),
      };
    });
}

function alignGroupedData(grouped1, grouped2) {
  const allKeys = Array.from(new Set([...grouped1.map(d => d.key), ...grouped2.map(d => d.key)])).sort();
  const map1 = Object.fromEntries(grouped1.map(d => [d.key, d]));
  const map2 = Object.fromEntries(grouped2.map(d => [d.key, d]));
  return allKeys.map(key => ({
    key,
    label: map1[key]?.label || map2[key]?.label || key,
    avg1: map1[key]?.avg ?? null,
    avg2: map2[key]?.avg ?? null,
  }));
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

const TempCharts = () => {
  const [insideTemperature, setInsideTemperature] = useState([]);
  const [outsideTemperature, setOutsideTemperature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const [insideRes, outsideRes] = await Promise.all([
          axios.get(`${baseUrl}/inside-temperature/getinsideTemperature`),
          axios.get(`${baseUrl}/outside-temperature/getoutsideTemperature`),
        ]);
        setInsideTemperature(insideRes.data || []);
        setOutsideTemperature(outsideRes.data || []);
      } catch (err) {
        console.error("Error fetching temperature data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatures();
  }, []);

  const groupedInside = viewMode === "daily" ? groupByDayAverage(insideTemperature) : groupByMonthAverage(insideTemperature);
  const groupedOutside = viewMode === "daily" ? groupByDayAverage(outsideTemperature) : groupByMonthAverage(outsideTemperature);
  const aligned = alignGroupedData(groupedOutside, groupedInside);

  const labels = aligned.map(row => row.label);
  const chartWidth = Math.max(labels.length * 60, Dimensions.get("window").width);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {viewMode === "daily" ? "Daily Average Temperature" : "Monthly Average Temperature"}
      </Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>View Mode:</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={viewMode}
            style={styles.picker}
            onValueChange={(value) => setViewMode(value)}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>
        </View>
      </View>

      {/* Outside Temp Chart */}
      <View style={{ marginBottom: 24 }}>
        <Text style={styles.chartLabel}>Outside Temperature</Text>
        <ScrollView horizontal>
          <BarChart
            data={{
              labels,
              datasets: [{ data: aligned.map(row => row.avg1) }],
            }}
            width={chartWidth}
            height={250}
            yAxisSuffix="°C"
            fromZero
            chartConfig={chartConfig("rgba(255, 99, 132, 1)")}
            verticalLabelRotation={0}
            showValuesOnTopOfBars
            withInnerLines
            style={styles.chart}
          />
        </ScrollView>
      </View>

      {/* Inside Temp Chart */}
      <View style={{ marginBottom: 24 }}>
        <Text style={styles.chartLabel}>Inside Temperature</Text>
        <ScrollView horizontal>
          <BarChart
            data={{
              labels,
              datasets: [{ data: aligned.map(row => row.avg2) }],
            }}
            width={chartWidth}
            height={250}
            yAxisSuffix="°C"
            fromZero
            chartConfig={chartConfig("rgba(54, 162, 235, 1)")}
            verticalLabelRotation={0}
            showValuesOnTopOfBars
            withInnerLines
            style={styles.chart}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 20,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  pickerWrapper: {
    marginVertical: 10,
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    marginRight: 185,
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
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 8,
  },
});

export default TempCharts;
