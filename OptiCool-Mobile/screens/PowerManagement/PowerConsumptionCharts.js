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

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
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
        day: "numeric"
      });
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
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
        month: "short"
      })} ${year}`;
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

const PowerConsumptionCharts = () => {
  const [powerData, setPowerData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPowerData(data);

        const predictPayload = data.map(item => ({
          timestamp: typeof item.timestamp === "object" && item.timestamp.$date
            ? item.timestamp.$date
            : item.timestamp,
          consumption: item.consumption
        }));

        const mode = viewMode === "daily" ? "daily" : "monthly";

        if (predictPayload.length > 0) {
          axios.post(
            `${process.env.REACT_APP_FLASK_API}/predictpower?mode=${mode}`,
            predictPayload,
            { headers: { "Content-Type": "application/json" } }
          )
            .then(res => {
              if (Array.isArray(res.data)) {
                setPredictedData(res.data);
              }
            })
            .catch(err => {
              console.error("Prediction API error:", err);
              setPredictedData([]);
            })
            .finally(() => setLoading(false));
        } else {
          setPredictedData([]);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setPowerData([]);
        setPredictedData([]);
        setLoading(false);
      });
  }, [viewMode]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  let grouped = viewMode === "daily"
    ? groupByDayAverage(powerData)
    : groupByMonthAverage(powerData);

  let predicted = [];
  if (viewMode === "monthly" && predictedData.length > 0) {
    predicted = predictedData.map(entry => {
      const d = new Date(entry.timestamp || entry.month);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      return {
        label,
        avg: Number(entry.consumption ? entry.consumption.toFixed(2) : entry.prediction.toFixed(2)),
        predicted: true
      };
    });
    grouped = [...grouped, ...predicted];
  }

  const realData = grouped.filter(item => !item.predicted);
  const chartLabels = grouped.map(row => row.label);
  const chartWidth = Math.max(chartLabels.length * 50, Dimensions.get("window").width);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {viewMode === "daily" ? "Daily Average Power Consumption" : "Monthly Average Power Consumption"}
      </Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>View Mode:</Text>
        <Picker
          selectedValue={viewMode}
          onValueChange={value => setViewMode(value)}
          style={styles.picker}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>
      </View>

      <ScrollView horizontal>
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: realData.map(row => row.avg),
                color: () => "rgba(255, 159, 64, 0.8)",
              },
              ...(predicted.length > 0
                ? [{
                    data: [
                      ...Array(realData.length).fill(null),
                      ...predicted.map(row => row.avg)
                    ],
                    color: () => "rgba(75, 192, 192, 0.6)",
                  }]
                : [])
            ],
            legend: ["Actual", ...(predicted.length > 0 ? ["Predicted"] : [])]
          }}
          width={chartWidth}
          height={250}
          yAxisSuffix="kWh"
          fromZero
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          verticalLabelRotation={60}
          style={{ borderRadius: 8 }}
        />
      </ScrollView>

      {viewMode === "monthly" && predicted.length > 0 && (
        <Text style={styles.note}>
          *Predicted values for the next 3 months based on historical data
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fafafa",
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
  },
  picker: {
    height: 44,
    width: 180,
  },
  label: {
    marginBottom: 4,
    fontWeight: "600",
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    color: "#555",
  },
});

export default PowerConsumptionCharts;
