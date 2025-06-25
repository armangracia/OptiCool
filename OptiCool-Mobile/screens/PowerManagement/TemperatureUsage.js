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

const TemperatureUsage = () => {
  /* -----------------------------  STATE  ----------------------------- */
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Raw log arrays
  const [insideData, setInsideData] = useState([]);
  const [outsideData, setOutsideData] = useState([]);

  // Chart datasets (computed after each range search)
  const [chartDataInside, setChartDataInside] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [chartDataOutside, setChartDataOutside] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  // Pagination (inside)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInside = insideData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(insideData.length / itemsPerPage);

  // Pagination (outside)
  const [outsidePage, setOutsidePage] = useState(1);
  const outsideIndexOfLastItem = outsidePage * itemsPerPage;
  const outsideIndexOfFirstItem = outsideIndexOfLastItem - itemsPerPage;
  const currentOutside = outsideData.slice(
    outsideIndexOfFirstItem,
    outsideIndexOfLastItem
  );
  const outsideTotalPages = Math.ceil(outsideData.length / itemsPerPage);

  /* -------------------------  HELPERS  ------------------------- */
  const groupByDayAverage = (data) => {
    const grouped = {};
    data.forEach((entry) => {
      const dateKey = new Date(entry.timestamp).toISOString().slice(0, 10);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry.temperature);
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

  /* ------------------------  INITIAL FETCH  ------------------------ */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [insideRes, outsideRes] = await Promise.all([
          axios.get(`${baseUrl}/inside-temperature/getinsideTemperature`),
          axios.get(`${baseUrl}/outside-temperature/getoutsideTemperature`),
        ]);
        setInsideData(insideRes.data);
        setOutsideData(outsideRes.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch temperature data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -----------------------  RANGE SEARCH  ----------------------- */
  const fetchByRange = async () => {
    setLoading(true);
    try {
      const [insideRes, outsideRes] = await Promise.all([
        axios.get(`${baseUrl}/inside-temperature/range`, {
          params: { start: startDate.toISOString(), end: endDate.toISOString() },
        }),
        axios.get(`${baseUrl}/outside-temperature/range`, {
          params: { start: startDate.toISOString(), end: endDate.toISOString() },
        }),
      ]);

      // Raw logs (tables)
      setInsideData(insideRes.data);
      setOutsideData(outsideRes.data);
      setCurrentPage(1);
      setOutsidePage(1);

      // Charts
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
      console.error(err);
      Alert.alert("Error", "Failed to fetch temperature data by range");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------  RENDER  --------------------------- */
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <Text style={styles.header}>Temperature Report</Text>

          {/* ------------------- INSIDE CHART ------------------- */}
          <Text style={styles.subHeader}>Inside Temperature</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartDataInside}
              width={Math.max(
                chartDataInside.labels.length * 60,
                Dimensions.get("window").width
              )}
              height={250}
              yAxisSuffix="°C"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (o = 1) => `rgba(0, 123, 255, ${o})`,
                labelColor: () => "#333",
                decimalPlaces: 1,
                fillShadowGradientFrom: "#4facfe",
                fillShadowGradientTo: "#00f2fe",
                fillShadowGradientOpacity: 1,
                barPercentage: 0.6,
              }}
              fromZero
              style={styles.chart}
            />
          </ScrollView>

          {/* ------------------ OUTSIDE CHART ------------------ */}
          <Text style={styles.subHeader}>Outside Temperature</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartDataOutside}
              width={Math.max(
                chartDataOutside.labels.length * 60,
                Dimensions.get("window").width
              )}
              height={250}
              yAxisSuffix="°C"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (o = 1) => `rgba(255, 140, 0, ${o})`,
                labelColor: () => "#333",
                decimalPlaces: 1,
                fillShadowGradientFrom: "#f7971e",
                fillShadowGradientTo: "#ffd200",
                fillShadowGradientOpacity: 1,
                barPercentage: 0.6,
              }}
              fromZero
              style={styles.chart}
            />
          </ScrollView>

          {/* ------------------ DATE PICKERS ------------------ */}
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

          <TouchableOpacity style={styles.searchButton} onPress={fetchByRange}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          {/* ------------------ INSIDE TABLE ------------------ */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Inside Temperature Logs</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Temp (°C)</Text>
              <Text style={styles.tableHeaderText}>Timestamp</Text>
            </View>
            {currentInside.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.temperature}°C</Text>
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
                onPress={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

          {/* ----------------- OUTSIDE TABLE ----------------- */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Outside Temperature Logs</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Temp (°C)</Text>
              <Text style={styles.tableHeaderText}>Timestamp</Text>
            </View>
            {currentOutside.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.temperature}°C</Text>
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

/* --------------------------  STYLES  -------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 25,
    paddingBottom: 30,
    backgroundColor: "#f5f5f5",
  },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    color: "#000",
  },
  chart: { marginVertical: 10, borderRadius: 16 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 680,
  },
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
  pageInfoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 6,
  },
});

export default TemperatureUsage;
