import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import baseUrl from "../../assets/common/baseUrl";
import io from "socket.io-client";

const socket = io(baseUrl);

const ReportDetails = () => {
  // ──────────────────────────────── state ────────────────────────────────
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ───────────────────────────── effect: fetch ────────────────────────────
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${baseUrl}/ereports/getreport`, {
          params: { populate: "user" },
        });
        const sorted = res.data.reports.sort(
          (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
        );
        setReports(sorted);
        setCurrentPage(1); // reset page on refresh
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  // ─────────────────────────── helpers ────────────────────────────
  const totalPages = Math.max(1, Math.ceil(reports.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);

  const handleMoreDetails = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const handleSolveReport = async () => {
    try {
      socket.emit("reportSolved", {
        userId: selectedReport.user._id,
        message: `Your report for ${selectedReport.appliance} has been marked as solved.`,
      });

      Alert.alert(
        "Report Solved",
        "The report has been marked as solved and the user has been notified."
      );
      closeModal();
    } catch (err) {
      console.error("Error solving report:", err);
      Alert.alert(
        "Error",
        "There was an error marking the report as solved. Please try again."
      );
    }
  };

  // ──────────────────────────────── ui ────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {/* column headers */}
          <View style={[styles.listItem, styles.headerRow]}>
            <Text style={[styles.listText, styles.headerColumn, { flex: 1 }]}>
              Appliance
            </Text>
            <Text style={[styles.listText, styles.headerColumn, { flex: 1 }]}>
              Status
            </Text>
            <Text style={[styles.listText, styles.headerColumn, { flex: 1 }]}>
              Details
            </Text>
          </View>

          {/* data rows */}
          {paginatedReports.map((report, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={[styles.listText, { flex: 1 }]}>
                {report.appliance}
              </Text>
              <Text style={[styles.listText, { flex: 1 }]}>
                {report.status}
              </Text>
              <TouchableOpacity
                style={styles.moreDetailsButton}
                onPress={() => handleMoreDetails(report)}
              >
                <MaterialIcons name="info" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          ))}

          {/* pagination controls */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === 1 && styles.disabledButton,
              ]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.pageNumber}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.disabledButton,
              ]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* modal */}
      {selectedReport && (
        <Modal transparent visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <Text style={styles.modalText}>
                Date Reported:{" "}
                {new Date(selectedReport.reportDate).toLocaleDateString()}
              </Text>
              <Text style={styles.modalText}>
                Time Reported: {selectedReport.timeReported}
              </Text>
              <Text style={styles.modalText}>
                Reported By:{" "}
                {selectedReport.user
                  ? `${selectedReport.user.username} - ${selectedReport.user.email}`
                  : "Unknown"}
              </Text>

              <TouchableOpacity
                style={styles.solveButton}
                onPress={handleSolveReport}
              >
                <Text style={styles.solveButtonText}>Mark as Solved</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebedf0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  listContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    minWidth: 300,
    maxWidth: 1000,
    elevation: 3,
    marginTop: -20,
    marginBottom: 100,
  },
  headerRow: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#B0BEC5",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: "#000",
  },
  headerColumn: {
    fontWeight: "bold",
    color: "#263238",
  },
  moreDetailsButton: {
    flex: 1,
    alignItems: "center",
  },
  // pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  pageButton: {
    backgroundColor: "#2F80ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  // modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  solveButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "green",
    borderRadius: 5,
  },
  solveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ReportDetails;
