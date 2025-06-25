import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import { Dimensions } from "react-native";
import axios from "axios";
import baseUrl from "../../assets/common/baseUrl";

const HumidityUsage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [pageInput, setPageInput] = useState("1");
  const [outsideSelectedYear, setOutsideSelectedYear] = useState("All");
  const [outsideSelectedMonth, setOutsideSelectedMonth] = useState("All");
  const [outsidePageInput, setOutsidePageInput] = useState("1");
  const [filteredInsideData, setFilteredInsideData] = useState([]);
  const [filteredOutsideData, setFilteredOutsideData] = useState([]);

  const [humidityData, setHumidityData] = useState([]);
  const [outsideHumidityData, setOutsideHumidityData] = useState([]);

  const [chartDataInside, setChartDataInside] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [chartDataOutside, setChartDataOutside] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredInsideData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInsideData.length / itemsPerPage);

  const [outsidePage, setOutsidePage] = useState(1);
  const outsideItemsPerPage = 20;
  const outsideIndexOfLastItem = outsidePage * outsideItemsPerPage;
  const outsideIndexOfFirstItem = outsideIndexOfLastItem - outsideItemsPerPage;
  const currentOutsideData = filteredOutsideData.slice(
    outsideIndexOfFirstItem,
    outsideIndexOfLastItem
  );
  const outsideTotalPages = Math.ceil(
    filteredOutsideData.length / outsideItemsPerPage
  );

  useEffect(() => {
    fetchHumidityData();
    fetchOutsideHumidityData();
  }, []);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    setOutsidePageInput(outsidePage.toString());
  }, [outsidePage]);

  useEffect(() => {
    let filtered = humidityData;

    if (selectedYear !== "All") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date.getFullYear().toString() === selectedYear;
      });
    }

    if (selectedMonth !== "All") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date.getMonth().toString() === selectedMonth;
      });
    }

    setFilteredInsideData(filtered);
    setCurrentPage(1); // reset page on filter
  }, [selectedYear, selectedMonth, humidityData]);

  useEffect(() => {
    let filtered = outsideHumidityData;

    if (outsideSelectedYear !== "All") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date.getFullYear().toString() === outsideSelectedYear;
      });
    }

    if (outsideSelectedMonth !== "All") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date.getMonth().toString() === outsideSelectedMonth;
      });
    }

    setFilteredOutsideData(filtered);
    setOutsidePage(1); // reset page on filter
  }, [outsideSelectedYear, outsideSelectedMonth, outsideHumidityData]);

  const fetchHumidityData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/inside-humidity/getinsideHumidity`
      );
      setHumidityData(response.data);
      setCurrentPage(1);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch inside humidity data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutsideHumidityData = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/outside-humidity/getoutsideHumidity`
      );
      setOutsideHumidityData(response.data);
      setOutsidePage(1);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch outside humidity data");
      console.error(err);
    }
  };

  const fetchByRange = async () => {
    setLoading(true);
    try {
      const [insideRes, outsideRes] = await Promise.all([
        axios.get(`${baseUrl}/inside-humidity/range`, {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
        axios.get(`${baseUrl}/outside-humidity/range`, {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
      ]);

      const groupByDayAverage = (data) => {
        const grouped = {};
        data.forEach((entry) => {
          const dateKey = new Date(entry.timestamp).toISOString().slice(0, 10);
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(entry.humidity);
        });

        return Object.entries(grouped)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([dateKey, values]) => ({
            label: new Date(dateKey).toLocaleDateString("default", {
              month: "short",
              day: "numeric",
            }),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          }));
      };

      const insideGrouped = groupByDayAverage(insideRes.data);
      const outsideGrouped = groupByDayAverage(outsideRes.data);

      setChartDataInside({
        labels: insideGrouped.map((row) => row.label),
        datasets: [{ data: insideGrouped.map((row) => row.avg) }],
      });

      setChartDataOutside({
        labels: outsideGrouped.map((row) => row.label),
        datasets: [{ data: outsideGrouped.map((row) => row.avg) }],
      });
    } catch (err) {
      Alert.alert("Error", "Failed to fetch humidity data by range");
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <Text style={styles.header}>Humidity Report</Text>

          <Text style={styles.subHeader}>Inside Humidity</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartDataInside}
              width={Math.max(
                chartDataInside.labels.length * 60,
                Dimensions.get("window").width
              )}
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
          </ScrollView>

          <Text style={styles.subHeader}>Outside Humidity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartDataOutside}
              width={Math.max(
                chartDataOutside.labels.length * 60,
                Dimensions.get("window").width
              )}
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
          </ScrollView>

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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
              marginTop: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Picker
                selectedValue={selectedYear}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 110,
                  height: 44,
                }}
              >
                <Picker.Item label="All Years" value="All" />
                <Picker.Item label="2023" value="2023" />
                <Picker.Item label="2024" value="2024" />
                <Picker.Item label="2025" value="2025" />
              </Picker>

              <Picker
                selectedValue={selectedMonth}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 110,
                  height: 44,
                }}
              >
                <Picker.Item label="All Months" value="All" />
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item
                    key={i}
                    label={new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                    // value={i.toString()}
                    value={`${i}`}
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
            <Text style={styles.tableTitle}>Inside Humidity Logs</Text>
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
              marginTop: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Picker
                selectedValue={outsideSelectedYear}
                onValueChange={(itemValue) => setOutsideSelectedYear(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 110,
                  height: 44,
                }}
              >
                <Picker.Item label="All Years" value="All" />
                <Picker.Item label="2023" value="2023" />
                <Picker.Item label="2024" value="2024" />
                <Picker.Item label="2025" value="2025" />
              </Picker>

              <Picker
                selectedValue={outsideSelectedMonth}
                onValueChange={(itemValue) =>
                  setOutsideSelectedMonth(itemValue)
                }
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 110,
                  height: 44,
                }}
              >
                <Picker.Item label="All Months" value="All" />
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item
                    key={i}
                    label={new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                    // value={i.toString()}
                    value={`${i}`}
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
                value={outsidePageInput}
                onChangeText={(text) => setOutsidePageInput(text)}
              />
              <TouchableOpacity
                onPress={() => {
                  const page = parseInt(outsidePageInput);
                  if (!isNaN(page) && page >= 1 && page <= outsideTotalPages) {
                    setOutsidePage(page);
                  } else {
                    Alert.alert(
                      "Invalid Page",
                      `Please enter a number between 1 and ${outsideTotalPages}`
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
            <Text style={styles.tableTitle}>Outside Humidity Logs</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Humidity</Text>
              <Text style={styles.tableHeaderText}>Timestamp</Text>
            </View>
            {currentOutsideData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.humidity}%</Text>
                <Text style={styles.tableCell}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={() => setOutsidePage((p) => Math.max(p - 1, 1))}
                disabled={outsidePage === 1}
                style={[
                  styles.arrowButton,
                  outsidePage === 1 && styles.disabledArrowButton,
                ]}
              >
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfoText}>
                Page {outsidePage} of {outsideTotalPages}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setOutsidePage((p) => Math.min(p + 1, outsideTotalPages))
                }
                disabled={outsidePage === outsideTotalPages}
                style={[
                  styles.arrowButton,
                  outsidePage === outsideTotalPages &&
                    styles.disabledArrowButton,
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

const styles = StyleSheet.create({
  container: { padding: 10, marginTop: 25, backgroundColor: "#f5f5f5" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    marginBottom: -20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    color: "#000",
  },
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 680,
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
    marginTop: 10,
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
