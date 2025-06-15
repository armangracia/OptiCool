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
      const timeLabels = [
        "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
        "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
        "6 PM", "7 PM", "8 PM",
      ];

      setWeeklyData({
        labels: timeLabels,
        values: [],
      });

      setMonthlyData({
        labels: timeLabels,
        values: [],
      });
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
      icon: "tachometer",
      title: "Usage Tracker",
      navigateTo: "UsageTracking",
      from: "UsageNavigations",
    },
    {
      icon: "cloud",
      title: "Humidity Report",
      navigateTo: "HumidityUsage",
      from: null,
    },
    {
      icon: "thermometer-half",
      title: "Temperature Report",
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
                Weekly
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
                Monthly
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
