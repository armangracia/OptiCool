import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";

// Helper functions
function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10);
    if (!daily[key]) daily[key] = [];
    daily[key].push(Number(row.humidity));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, hums]) => {
      const label = new Date(key).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      const avg = hums.reduce((a, b) => a + b, 0) / hums.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.humidity));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, hums]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", {
        month: "short",
      })} ${year}`;
      return {
        key,
        label,
        avg: Number((hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(2)),
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

const HumidityCharts = () => {
  const [insideHumidity, setInsideHumidity] = useState([]);
  const [outsideHumidity, setOutsideHumidity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchHumidities = async () => {
      try {
        const insideRes = await axios.get(`${process.env.REACT_APP_API}/insidehumidities`);
        const outsideRes = await axios.get(`${process.env.REACT_APP_API}/outsidehumidities`);
        const getHumidityRes = await axios.get(`${process.env.REACT_APP_API}/gethumidity`);

        const insideData = Array.isArray(insideRes.data) ? insideRes.data : [];
        const outsideData = Array.isArray(outsideRes.data) ? outsideRes.data : [];
        const getHumidityData = Array.isArray(getHumidityRes.data) ? getHumidityRes.data : [];

        const sorted = [...getHumidityData].sort((a, b) => a.humidity - b.humidity);
        const mid = Math.floor(sorted.length / 2);
        const getHumidityInside = sorted.slice(0, mid);
        const getHumidityOutside = sorted.slice(mid);

        setInsideHumidity([...insideData, ...getHumidityInside]);
        setOutsideHumidity([...outsideData, ...getHumidityOutside]);
      } catch (err) {
        console.error("Error fetching humidity data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHumidities();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  const groupedOutside = viewMode === "daily" ? groupByDayAverage(outsideHumidity) : groupByMonthAverage(outsideHumidity);
  const groupedInside = viewMode === "daily" ? groupByDayAverage(insideHumidity) : groupByMonthAverage(insideHumidity);

  const aligned = alignGroupedData(groupedOutside, groupedInside);
  const labels = aligned.map(row => row.label);

  const chartData = {
    labels,
    datasets: [
      {
        data: aligned.map(row => row.avg1),
        color: () => "rgba(255, 193, 7, 0.8)",
      },
      {
        data: aligned.map(row => row.avg2),
        color: () => "rgba(33, 150, 243, 0.8)",
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {viewMode === "daily" ? "Daily Average Humidity" : "Monthly Average Humidity"}
      </Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>View Mode:</Text>
        <Picker
          selectedValue={viewMode}
          style={styles.picker}
          onValueChange={(itemValue) => setViewMode(itemValue)}
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
                color: () => "rgba(255, 193, 7, 0.8)",
              },
              {
                data: aligned.map(row => row.avg2),
                color: () => "rgba(33, 150, 243, 0.8)",
              },
            ],
            legend: ["Outside", "Inside"],
          }}
          width={Math.max(labels.length * 50, Dimensions.get("window").width)}
          height={250}
          yAxisSuffix="%"
          fromZero
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 8,
            },
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

export default HumidityCharts;
