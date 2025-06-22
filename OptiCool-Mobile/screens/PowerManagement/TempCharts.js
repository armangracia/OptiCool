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

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10);
    if (!daily[key]) daily[key] = [];
    daily[key].push(Number(row.temperature));
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

const TempCharts = () => {
  const [insideTemperature, setInsideTemperature] = useState([]);
  const [outsideTemperature, setOutsideTemperature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const [insideRes, outsideRes, getTemperatureRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/insidetemperatures`),
          axios.get(`${process.env.REACT_APP_API}/outsidetemperatures`),
          axios.get(`${process.env.REACT_APP_API}/gettemperature`)
        ]);

        const insideData = Array.isArray(insideRes.data) ? insideRes.data : [];
        const outsideData = Array.isArray(outsideRes.data) ? outsideRes.data : [];
        const getTemperatureData = Array.isArray(getTemperatureRes.data) ? getTemperatureRes.data : [];

        const sorted = [...getTemperatureData].sort((a, b) => a.temperature - b.temperature);
        const mid = Math.floor(sorted.length / 2);
        const getTemperatureInside = sorted.slice(0, mid);
        const getTemperatureOutside = sorted.slice(mid);

        setInsideTemperature([...insideData, ...getTemperatureInside]);
        setOutsideTemperature([...outsideData, ...getTemperatureOutside]);
      } catch (error) {
        console.error("Error fetching temperature data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatures();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  const groupedOutside = viewMode === "daily" ? groupByDayAverage(outsideTemperature) : groupByMonthAverage(outsideTemperature);
  const groupedInside = viewMode === "daily" ? groupByDayAverage(insideTemperature) : groupByMonthAverage(insideTemperature);
  const aligned = alignGroupedData(groupedOutside, groupedInside);

  const labels = aligned.map(row => row.label);
  const chartWidth = Math.max(labels.length * 50, Dimensions.get("window").width);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {viewMode === "daily" ? "Daily Average Inside & Outside Temperature" : "Monthly Average Inside & Outside Temperature"}
      </Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>View Mode:</Text>
        <Picker
          selectedValue={viewMode}
          style={styles.picker}
          onValueChange={value => setViewMode(value)}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>
      </View>

      <ScrollView horizontal contentContainerStyle={{ paddingBottom: 20 }}>
        <BarChart
          data={{
            labels,
            datasets: [
              {
                data: aligned.map(row => row.avg1),
                color: () => "rgba(255, 99, 132, 0.8)",
              },
              {
                data: aligned.map(row => row.avg2),
                color: () => "rgba(54, 162, 235, 0.8)",
              },
            ],
            legend: ["Outside", "Inside"],
          }}
          width={chartWidth}
          height={250}
          yAxisSuffix="°C"
          fromZero
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#fff",
            },
          }}
          verticalLabelRotation={60}
          style={{ borderRadius: 8 }}
        />
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  pickerWrapper: {
    marginVertical: 10,
  },
  picker: {
    height: 40,
    width: 180,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
  },
});

export default TempCharts;
