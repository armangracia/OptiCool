import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import baseUrl from "../../assets/common/baseUrl";

const UsageTracking = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [chartData, setChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
  });
  const [todayUsage, setTodayUsage] = useState(50);
  const [monthlyUsage, setMonthlyUsage] = useState(300);
  const [loading, setLoading] = useState(false);
  const [powerData, setPowerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [pageInput, setPageInput] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchPowerData();
  }, []);

  useEffect(() => {
    let filtered = powerData;

    if (selectedYear !== "All") {
      filtered = filtered.filter(
        (item) =>
          new Date(item.timestamp).getFullYear().toString() === selectedYear
      );
    }

    if (selectedMonth !== "All") {
      filtered = filtered.filter(
        (item) =>
          new Date(item.timestamp).getMonth().toString() === selectedMonth
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, powerData]);

  const fetchPowerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/power-consumption/getpowerconsumption`
      );
      const data = response.data;
      setPowerData(data);
      setFilteredData(data);
      setCurrentPage(1);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch power data");
      console.error("Error fetching power data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPowerDataByDate = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/powerconsumption/range`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      const data = response.data;
      setPowerData(data);
      setFilteredData(data);
      setCurrentPage(1);

      const labels = data.map((item) =>
        new Date(item.timestamp).toLocaleDateString()
      );
      const consumptionData = data.map((item) => item.consumption);
      setChartData({
        labels,
        datasets: [{ data: consumptionData }],
      });

      const totalConsumption = consumptionData.reduce(
        (acc, value) => acc + value,
        0
      );
      setTodayUsage(consumptionData[consumptionData.length - 1] || 0);
      setMonthlyUsage(totalConsumption);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch power data by date range");
      console.error("Error fetching power data by date range:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log("Search button pressed, fetching data for new date range...");
    fetchPowerDataByDate();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.icon}>🔌</Text>
              <Text style={styles.label}>Today</Text>
              <Text style={styles.value}>
                {todayUsage ? `${todayUsage} kWh` : "N/A"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.icon}>⚡</Text>
              <Text style={styles.label}>This Month</Text>
              <Text style={styles.value}>
                {monthlyUsage ? `${monthlyUsage.toFixed(2)} kWh` : "N/A"}
              </Text>
            </View>
          </View>

          <BarChart
            data={chartData}
            width={Dimensions.get("window").width - 20}
            height={220}
            yAxisLabel="kW"
            chartConfig={{
              backgroundGradientFrom: "#1E2923",
              backgroundGradientTo: "#08130D",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            style={styles.chart}
          />

          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              onPress={() => setOpenStartPicker(true)}
              style={styles.dateBox}
            >
              <Text style={styles.dateText}>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            <Text style={styles.dateRangeDivider}>To</Text>
            <TouchableOpacity
              onPress={() => setOpenEndPicker(true)}
              style={styles.dateBox}
            >
              <Text style={styles.dateText}>{endDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          {openStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setOpenStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
                console.log("Start date selected:", selectedDate);
              }}
            />
          )}

          {openEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setOpenEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
                console.log("End date selected:", selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Picker
                selectedValue={selectedYear}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="All Years" value="All" />
                <Picker.Item label="2023" value="2023" />
                <Picker.Item label="2024" value="2024" />
                <Picker.Item label="2025" value="2025" />
              </Picker>

              <Picker
                selectedValue={selectedMonth}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="All Months" value="All" />
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item
                    key={i}
                    label={new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })} // Use 'long' for full month names
                    value={i.toString()}
                  />
                ))}
              </Picker>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  padding: 6,
                  width: 40,
                  textAlign: "center",
                }}
                placeholder={`${currentPage}`}
                keyboardType="numeric"
                value={pageInput}
                onChangeText={(text) => setPageInput(text)}
              />
              <TouchableOpacity
                onPress={() => {
                  const page = parseInt(pageInput);
                  if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  } else {
                    Alert.alert(
                      "Invalid Page",
                      `Please enter a number between 1 and ${totalPages}`
                    );
                  }
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  backgroundColor: "#000",
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff" }}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Power Consumption Data</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Consumption (kWh)</Text>
              <Text style={styles.tableHeaderText}>Timestamp</Text>
            </View>
            {currentData.map((powerconsumption, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {powerconsumption.consumption}
                </Text>
                <Text style={styles.tableCell}>
                  {new Date(powerconsumption.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={[
                  styles.arrowButton,
                  currentPage === 1 && styles.disabledArrowButton,
                ]}
              >
                <Text style={styles.arrowText}>«</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfoText}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={[
                  styles.arrowButton,
                  currentPage === totalPages && styles.disabledArrowButton,
                ]}
              >
                <Text style={styles.arrowText}>»</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: Dimensions.get("window").height,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
  },
  picker: {
    width: 120, // Increased from 100 or 120 to fit full text like "September" or "2025"
    height: 44,
    color: "#000",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#000000",
  },
  dateRangeDivider: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
    marginTop: 30,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 0.5,
    backgroundColor: "#ccc",
    height: "60%",
    marginHorizontal: 5,
  },
  icon: {
    fontSize: 18,
    marginBottom: 3,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  tableCell: {
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  arrowButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#000",
    borderRadius: 6,
  },
  disabledArrowButton: {
    backgroundColor: "#ccc",
  },
  arrowText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  pageInfoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});

export default UsageTracking;
