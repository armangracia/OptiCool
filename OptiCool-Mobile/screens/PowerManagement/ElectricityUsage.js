import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import DeviceInfo from "./DeviceInfo";
import dmt3API from "../../services/dmt3API"; // Import the API

const ElectricityUsage = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  const [weeklyData, setWeeklyData] = useState({ labels: [], values: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], values: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const weeklyUsage = await dmt3API.getWeeklyUsageAPI();
      setWeeklyData(weeklyUsage);
      const monthlyUsage = await dmt3API.getMonthlyUsageAPI();
      setMonthlyData(monthlyUsage);
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
    <LineChart
      data={{
        labels: labels.length ? labels : ["No Data"],
        datasets: [{ data: data.length ? data : [0] }],
      }}
      width={Dimensions.get("window").width - 32}
      height={300}
      yAxisSuffix=" kWh"
      chartConfig={{
        backgroundColor: backgroundColor,
        backgroundGradientFrom: gradientFrom,
        backgroundGradientTo: gradientTo,
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      style={styles.chart}
    />
  );

  const menuItems = [
    {
      icon: "tachometer",
      title: "Usage Tracker",
      navigateTo: "UsageTracking",
    },
    {
      icon: "cloud",
      title: "Humidity Report",
    },
    {
      icon: "thermometer-half",
      title: "Temperature Report",
    },
  ];

  const handleCardPress = (item) => {
    setSelectedItem(item);
  };

  return (
    <FlatList
      data={menuItems}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
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
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.rectangle}>
            <View style={styles.menuItem}>
              <Icon name={item.icon} size={24} color="black" style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
              {item.navigateTo && (
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => navigation.navigate("UsageNavigations", { screen: "UsageTracking" })}
                >
                  <Text style={styles.detailText}>Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        selectedItem && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{selectedItem.title}</Text>
            <Text style={styles.cardContent}>Additional details about {selectedItem.title}...</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebedf0",
    padding: 16,
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
    alignSelf: "center", // Center horizontally within the parent container
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
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    margin: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ElectricityUsage;
