import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";
import baseUrl from "../../assets/common/baseUrl";

const HumidityUsage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [humidityData, setHumidityData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = humidityData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(humidityData.length / itemsPerPage);

  // DUMMY DATA for the chart
  const chartLabels = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
  ];
  const humidityValues = [65, 67, 68, 70, 72, 71, 69, 66, 64, 62];

  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchHumidityData();
  }, []);

  const fetchHumidityData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/inside-humidity/getinsideHumidity`
      );
      setHumidityData(response.data);
      setCurrentPage(1);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch humidity data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchByRange = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/inside-humidity/range`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      setHumidityData(response.data);
      setCurrentPage(1);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch range data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchByRange();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <>
          <Text style={styles.header}>Humidity Report</Text>

          <BarChart
            data={{
              labels: chartLabels,
              datasets: [{ data: humidityValues }],
              legend: ["Humidity"],
            }}
            width={Dimensions.get("window").width - 20}
            height={250}
            yAxisSuffix="%"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => "#333",
              decimalPlaces: 1,
            }}
            verticalLabelRotation={45}
            fromZero
            style={styles.chart}
          />

          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              onPress={() => setOpenStartPicker(true)}
              style={styles.dateBox}
            >
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            <Text style={styles.dateRangeDivider}>To</Text>
            <TouchableOpacity
              onPress={() => setOpenEndPicker(true)}
              style={styles.dateBox}
            >
              <Text>{endDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          {openStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setOpenStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}

          {openEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setOpenEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Humidity Logs</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Humidity</Text>
              <Text style={styles.tableHeaderText}>Timestamp</Text>
            </View>
            {currentData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.humidity}%</Text>
                <Text style={styles.tableCell}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={[
                  styles.arrowButton,
                  currentPage === 1 && styles.disabledArrowButton,
                ]}
              >
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfoText}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={[
                  styles.arrowButton,
                  currentPage === totalPages && styles.disabledArrowButton,
                ]}
              >
                <Text style={styles.arrowText}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

// styles object remains unchanged (same as your previous one)
const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#f5f5f5" },
  header: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  chart: { marginVertical: 10, borderRadius: 16 },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    width: "45%",
    alignItems: "center",
  },
  dateRangeDivider: { alignSelf: "center", marginHorizontal: 10 },
  searchButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  searchButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 40,
  },
  tableTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
  },
  tableHeaderText: { fontWeight: "bold", fontSize: 14 },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  tableCell: { fontSize: 13 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 10,
  },
  arrowButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#000",
    borderRadius: 6,
  },
  disabledArrowButton: { backgroundColor: "#ccc" },
  arrowText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  pageInfoText: { fontSize: 14, fontWeight: "bold", color: "#333" },
});

export default HumidityUsage;
