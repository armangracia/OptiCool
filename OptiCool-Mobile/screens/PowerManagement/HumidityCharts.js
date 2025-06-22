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
import baseUrl from "../../assets/common/baseUrl";

// Group data by day
function groupByDayAverage(data) {
  const daily = {};
  data.forEach((row) => {
    const date = new Date(row.timestamp).toISOString().slice(0, 10);
    if (!daily[date]) daily[date] = [];
    daily[date].push(Number(row.humidity));
  });

  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return {
        label: new Date(date).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
        avg: Number(avg.toFixed(2)),
      };
    });
}

// Group data by month
function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach((row) => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.humidity));
  });

  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, values]) => {
      const [year, month] = key.split("-");
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return {
        label: `${new Date(year, month - 1).toLocaleString("default", {
          month: "short",
        })} ${year}`,
        avg: Number(avg.toFixed(2)),
      };
    });
}

// Chart config
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

const HumidityCharts = () => {
  const [insideHumidity, setInsideHumidity] = useState([]);
  const [outsideHumidity, setOutsideHumidity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchHumidities = async () => {
      try {
        const [insideRes, outsideRes] = await Promise.all([
          axios.get(`${baseUrl}/inside-humidity/getinsideHumidity`),
          axios.get(`${baseUrl}/outside-humidity/getoutsideHumidity`),
        ]);
        setInsideHumidity(insideRes.data || []);
        setOutsideHumidity(outsideRes.data || []);
      } catch (err) {
        console.error("Error fetching humidity data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHumidities();
  }, []);

  const groupedInside =
    viewMode === "daily"
      ? groupByDayAverage(insideHumidity)
      : groupByMonthAverage(insideHumidity);

  const groupedOutside =
    viewMode === "daily"
      ? groupByDayAverage(outsideHumidity)
      : groupByMonthAverage(outsideHumidity);

  const labels = groupedOutside.map((d) => d.label);
  const insideData = groupedInside.map((d) => d.avg);
  const outsideData = groupedOutside.map((d) => d.avg);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {viewMode === "daily"
            ? "Daily Average Humidity"
            : "Monthly Average Humidity"}
        </Text>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>View Mode:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={viewMode}
              style={styles.picker}
              onValueChange={(itemValue) => setViewMode(itemValue)}
              dropdownIconColor="#388e3c"
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Monthly" value="monthly" />
            </Picker>
          </View>
        </View>

        {/* Outside Humidity Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartLabel}>Outside Humidity</Text>
          <ScrollView horizontal>
            <BarChart
              data={{
                labels,
                datasets: [{ data: outsideData }],
              }}
              width={Math.max(labels.length * 60, Dimensions.get("window").width)}
              height={250}
              yAxisSuffix="%"
              fromZero
              chartConfig={chartConfig("rgba(255, 193, 7, 1)")}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              withInnerLines
              style={styles.chart}
            />
          </ScrollView>
        </View>

        {/* Inside Humidity Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartLabel}>Inside Humidity</Text>
          <ScrollView horizontal>
            <BarChart
              data={{
                labels,
                datasets: [{ data: insideData }],
              }}
              width={Math.max(labels.length * 60, Dimensions.get("window").width)}
              height={250}
              yAxisSuffix="%"
              fromZero
              chartConfig={chartConfig("rgba(33, 150, 243, 1)")}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              withInnerLines
              style={styles.chart}
            />
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eafaf1",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    // elevation: 3,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#2e7d32",
  },
  pickerWrapper: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#d0f0c0",
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  picker: {
    height: 40,
    width: "100%",
    color: "#1b5e20",
  },
  chartSection: {
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#555",
    marginLeft: 4,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
});

export default HumidityCharts;
