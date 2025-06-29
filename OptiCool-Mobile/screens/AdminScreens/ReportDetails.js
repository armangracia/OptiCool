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
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${baseUrl}/ereports/getreport`, {
        params: { populate: "user" },
      });
      const sorted = res.data.reports.sort(
        (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
      );
      setReports(sorted);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
      await axios.put(`${baseUrl}/ereports/${selectedReport._id}/resolve`);

      socket.emit("reportSolved", {
        userId: selectedReport.user._id,
        message: `Your report for ${selectedReport.appliance} has been marked as solved.`,
      });

      Alert.alert("Resolved", "Report marked as resolved.");
      fetchReports();
      closeModal();
    } catch (err) {
      console.error("Error solving report:", err);
      Alert.alert("Error", "Failed to resolve the report.");
    }
  };

  const handleRestoreReport = async () => {
    try {
      await axios.put(`${baseUrl}/ereports/${selectedReport._id}/restore`);
      Alert.alert("Restored", "Report status has been restored.");
      fetchReports();
    } catch (err) {
      console.error("Error restoring report:", err);
      Alert.alert("Error", "Failed to restore the report.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Reports</Text>
        <View style={styles.cardListContainer}>
          {paginatedReports.map((report, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{report.appliance}</Text>
                <View style={{ position: "relative" }}>
                  <TouchableOpacity onPress={() => setVisibleMenuIndex(index)}>
                    <MaterialIcons name="more-vert" size={20} color="#888" />
                  </TouchableOpacity>

                  {visibleMenuIndex === index && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        onPress={() => {
                          setVisibleMenuIndex(null);
                          handleMoreDetails(report);
                        }}
                      >
                        <Text style={styles.menuItem}>View Details</Text>
                      </TouchableOpacity>

                      {report.isResolved === "no" ? (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedReport(report);
                            setVisibleMenuIndex(null);
                            setModalVisible(true);
                          }}
                        >
                          <Text style={styles.menuItem}>Mark as Resolved</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedReport(report);
                            setVisibleMenuIndex(null);
                            handleRestoreReport();
                          }}
                        >
                          <Text style={styles.menuItem}>Restore Status</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Status:</Text>
                <Text style={styles.cardValue}>{report.status}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Description:</Text>
                <Text style={styles.cardValue}>{report.description}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Report Date:</Text>
                <Text style={styles.cardValue}>
                  {new Date(report.reportDate).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Time:</Text>
                <Text style={styles.cardValue}>{report.timeReported}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Reported By:</Text>
                <Text style={styles.cardValue}>
                  {report.user?.username || "Unknown"}
                </Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Resolved:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    report.isResolved === "yes"
                      ? styles.resolvedBadge
                      : styles.pendingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      report.isResolved === "yes"
                        ? { color: "#219653" }
                        : { color: "#2F80ED" },
                    ]}
                  >
                    {report.isResolved === "yes" ? "Resolved" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
          ))}

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
              onPress={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
            >
              <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {selectedReport && (
        <Modal transparent visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Resolve Report</Text>
              <Text style={styles.modalText}>
                Appliance: {selectedReport.appliance}
              </Text>
              <Text style={styles.modalText}>
                Are you sure you want to mark this report as resolved?
              </Text>

              <TouchableOpacity
                style={styles.solveButton}
                onPress={handleSolveReport}
              >
                <Text style={styles.solveButtonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Cancel</Text>
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
    alignItems: "center",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "flex-start",
    color: "#333",
  },
  cardListContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    width: 300,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    width: 110,
  },
  cardValue: {
    fontSize: 14,
    color: "#111",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  resolvedBadge: {
    backgroundColor: "#BBF7D0",
  },
  pendingBadge: {
    backgroundColor: "#E0ECFF",
  },
  statusBadgeText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 20,
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
    textAlign: "center",
  },
  solveButton: {
    marginTop: 10,
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
    backgroundColor: "gray",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  dropdownMenu: {
    position: "absolute",
    top: 25,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 5,
    paddingVertical: 6,
    width: 160,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
  },
});

export default ReportDetails;
