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
import { Picker } from "@react-native-picker/picker";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";
import baseUrl from "../../assets/common/baseUrl";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const TemperatureUsage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [pageInput, setPageInput] = useState("");

  const [insideData, setInsideData] = useState([]);
  const [outsideData, setOutsideData] = useState([]);

  const [chartRangeInsideData, setChartRangeInsideData] = useState([]);
  const [chartRangeOutsideData, setChartRangeOutsideData] = useState([]);

  const filterByYearMonth = (data, year, month) => {
    return data.filter((item) => {
      const date = new Date(item.timestamp);
      const yearMatch =
        year === "All" || date.getFullYear().toString() === year;
      const monthMatch =
        month === "All" || date.getMonth().toString() === month;
      return yearMatch && monthMatch;
    });
  };

  const filteredOutsideData = filterByYearMonth(
    outsideData,
    selectedYearOutside,
    selectedMonthOutside
  );

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

  const filteredInside = filterByYearMonth(
    insideData,
    selectedYear,
    selectedMonth
  );
  const totalPages = Math.ceil(filteredInside.length / itemsPerPage);
  const currentInside = filteredInside.slice(indexOfFirstItem, indexOfLastItem);

  const [outsidePage, setOutsidePage] = useState(1);
  const [selectedYearOutside, setSelectedYearOutside] = useState("All");
  const [selectedMonthOutside, setSelectedMonthOutside] = useState("All");
  const [pageInputOutside, setPageInputOutside] = useState(" ");
  const outsideIndexOfLastItem = outsidePage * itemsPerPage;
  const outsideIndexOfFirstItem = outsideIndexOfLastItem - itemsPerPage;

  const filteredOutside = filterByYearMonth(
    outsideData,
    selectedYearOutside,
    selectedMonthOutside
  );
  const outsideTotalPages = Math.ceil(filteredOutside.length / itemsPerPage);
  const currentOutside = filteredOutside.slice(
    outsideIndexOfFirstItem,
    outsideIndexOfLastItem
  );

  const filteredInsideData = filterByYearMonth(
    insideData,
    selectedYear,
    selectedMonth
  );
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

        // Initial chart setup with all data (optional)
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
        Alert.alert("Error", "Failed to fetch temperature data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchByRange = async () => {
    setLoading(true);
    try {
      const [insideRes, outsideRes] = await Promise.all([
        axios.get(`${baseUrl}/inside-temperature/range`, {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
        axios.get(`${baseUrl}/outside-temperature/range`, {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
      ]);

      // Do not replace main data — keep them for the tables
      setChartRangeInsideData(insideRes.data);
      setChartRangeOutsideData(outsideRes.data);

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

  const downloadTemperaturePDF = async (
    insideData,
    outsideData,
    selectedYear,
    selectedMonth
  ) => {
    const monthLabel =
      selectedMonth !== "All"
        ? new Date(0, selectedMonth).toLocaleString("default", {
            month: "long",
          })
        : "All";

    const generateTableRows = (data) =>
      data
        .map(
          (item) => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">${
          item.temperature
        }</td>
        <td style="border: 1px solid #ccc; padding: 8px;">
          ${new Date(item.timestamp).toLocaleString()}
        </td>
      </tr>`
        )
        .join("");

    const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .section-title { margin-top: 30px; font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Temperature Usage Report</h1>
      <p><strong>Year:</strong> ${selectedYear} &nbsp;&nbsp; <strong>Month:</strong> ${monthLabel}</p>

      <div class="section-title">Inside Temperature</div>
      <table>
        <thead>
          <tr>
            <th>Temperature (°C)</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(insideData)}
        </tbody>
      </table>

      <div class="section-title">Outside Temperature</div>
      <table>
        <thead>
          <tr>
            <th>Temperature (°C)</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(outsideData)}
        </tbody>
      </table>
    </body>
  </html>
`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing not available on this device");
      }
    } catch (error) {
      console.error("PDF generation failed", error);
      Alert.alert("Error", "Failed to generate or share the PDF");
    }
  };

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
                  width: 120,
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
                  width: 120,
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
                  width: 50,
                  textAlign: "center",
                }}
                keyboardType="numeric"
                value={pageInput}
                onChangeText={(text) => setPageInput(text)}
                // onBlur={() => setPageInput("")} // optional: clear after use
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
                selectedValue={selectedYearOutside}
                onValueChange={(itemValue) => setSelectedYearOutside(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 120,
                  height: 44,
                }}
              >
                <Picker.Item label="All Years" value="All" />
                <Picker.Item label="2023" value="2023" />
                <Picker.Item label="2024" value="2024" />
                <Picker.Item label="2025" value="2025" />
              </Picker>

              <Picker
                selectedValue={selectedMonthOutside}
                onValueChange={(itemValue) =>
                  setSelectedMonthOutside(itemValue)
                }
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  width: 120,
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
                  width: 50,
                  textAlign: "center",
                }}
                keyboardType="numeric"
                value={pageInputOutside}
                onChangeText={(text) => setPageInputOutside(text)}
              />
              <TouchableOpacity
                onPress={() => {
                  const page = parseInt(pageInputOutside);
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
            <TouchableOpacity
              onPress={() =>
                downloadTemperaturePDF(
                  filteredInsideData,
                  filteredOutsideData,
                  selectedYear,
                  selectedMonth
                )
              }
              style={{
                backgroundColor: "#000",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Download PDF
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

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
