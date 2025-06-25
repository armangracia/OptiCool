import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import baseUrl from "../../assets/common/baseUrl";

const ElectricityUsage = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  const [weeklyData, setWeeklyData] = useState({ labels: [], values: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], values: [] });
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const res = await axios.get(`${baseUrl}/power-consumption/getpowerconsumption`);
      const rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      // Weekly: Last 7 days
      const last7Days = rawData.filter((entry) => {
        const date = new Date(entry.timestamp);
        return now - date <= 7 * oneDay;
      });

      const weeklyMap = {};
      last7Days.forEach((entry) => {
        const key = new Date(entry.timestamp).toISOString().slice(0, 10);
        if (!weeklyMap[key]) weeklyMap[key] = [];
        weeklyMap[key].push(Number(entry.consumption));
      });

      const weeklyLabels = [];
      const weeklyValues = [];
      Object.entries(weeklyMap)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .forEach(([key, values]) => {
          weeklyLabels.push(new Date(key).toLocaleDateString("default", { month: "short", day: "numeric" }));
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          weeklyValues.push(Number(avg.toFixed(2)));
        });

      // Monthly: Last 30 days
      const last30Days = rawData.filter((entry) => {
        const date = new Date(entry.timestamp);
        return now - date <= 30 * oneDay;
      });

      const monthlyMap = {};
      last30Days.forEach((entry) => {
        const key = new Date(entry.timestamp).toISOString().slice(0, 10);
        if (!monthlyMap[key]) monthlyMap[key] = [];
        monthlyMap[key].push(Number(entry.consumption));
      });

      const monthlyLabels = [];
      const monthlyValues = [];
      Object.entries(monthlyMap)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .forEach(([key, values]) => {
          monthlyLabels.push(new Date(key).toLocaleDateString("default", { month: "short", day: "numeric" }));
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          monthlyValues.push(Number(avg.toFixed(2)));
        });

      setWeeklyData({ labels: weeklyLabels, values: weeklyValues });
      setMonthlyData({ labels: monthlyLabels, values: monthlyValues });
    } catch (error) {
      console.error("Error fetching usage data:", error);
    }
  };

  const renderChart = (
    labels,
    data,
    backgroundColor,
    gradientFrom,
    gradientTo
  ) => (
    <View style={styles.chartContainer}>
      <LineChart
        data={{
          labels: labels.length ? labels : ["No Data"],
          datasets: [{ data: data.length ? data : [0] }],
        }}
        width={300}
        height={300}
        yAxisSuffix=" kWh"
        verticalLabelRotation={45}
        chartConfig={{
          backgroundColor,
          backgroundGradientFrom: gradientFrom,
          backgroundGradientTo: gradientTo,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForLabels: {
            textAnchor: "start",
            fontSize: 10,
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const menuItems = [
    {
      icon: "bar-chart",
      title: "Charts ",
      navigateTo: "Charts",
      from: "UsageNavigations",
    },
    {
      icon: "tachometer",
      title: "Power Consumption Tracker ",
      navigateTo: "UsageTracking",
      from: "UsageNavigations",
    },
    {
      icon: "cloud",
      title: "Humidity Report Tracker",
      navigateTo: "HumidityUsage",
      from: null,
    },
    {
      icon: "thermometer-half",
      title: "Temperature Report Tracker",
      navigateTo: "TemperatureUsage",
      from: null,
    },
  ];

  const handleNavigate = (item) => {
    if (item.from) {
      navigation.navigate(item.from, { screen: item.navigateTo });
    } else {
      navigation.navigate(item.navigateTo);
    }
  };

  return (
    <FlatList
      data={menuItems}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      ListHeaderComponent={
        <>
          <View style={styles.tabBox}>
            <TouchableOpacity
              onPress={() => setActiveTab("weekly")}
              style={[
                styles.tabButton,
                activeTab === "weekly" && styles.activeTabButton,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "weekly" && styles.activeTabButtonText,
                ]}
              >
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("monthly")}
              style={[
                styles.tabButton,
                activeTab === "monthly" && styles.activeTabButton,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "monthly" && styles.activeTabButtonText,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </View>
          {activeTab === "weekly"
            ? renderChart(
                weeklyData.labels,
                weeklyData.values,
                "#8b3204",
                "#cd591d",
                "#e2e93e"
              )
            : renderChart(
                monthlyData.labels,
                monthlyData.values,
                "#36048b",
                "#834be0",
                "#e93e91"
              )}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.rectangle}>
          <View style={styles.menuItem}>
            <Icon
              name={item.icon}
              size={24}
              color="black"
              style={styles.icon}
            />
            <Text style={styles.menuText}>{item.title}</Text>
            {item.navigateTo && (
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleNavigate(item)}
              >
                <Text style={styles.detailText}>Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
  },
  tabBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#000000",
    borderRadius: 20,
    marginBottom: 10,
    padding: 5,
    marginTop: 40,
    width: 300,
    alignSelf: "center",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 15,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
  },
  tabButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  activeTabButtonText: {
    color: "black",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 20,
  },
  rectangle: {
    backgroundColor: "#ffffff",
    height: 80,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: "center",
    alignItems: "center",
    width: 330,
    alignSelf: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 10,
  },
  menuText: {
    flex: 1,
  },
  detailButton: {
    backgroundColor: "#000000",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detailText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ElectricityUsage;
