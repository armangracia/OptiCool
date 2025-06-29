import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

const ActivityLog = () => {
  const { token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivityLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/activity-log?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setLogs(response.data.logs);
        setPage(response.data.currentPage || pageNum);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error("Failed to fetch logs:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs(1);
  }, []);

  const handlePrevious = () => {
    if (page > 1) {
      fetchActivityLogs(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      fetchActivityLogs(page + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading activity logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Log</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <View style={styles.leftSection}>
              <Text style={styles.username}>
                {item.userId?.username || "Unknown User"}
              </Text>
              <Text style={styles.action}>{item.action}</Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.timestamp}>
                {moment(item.timestamp).tz("Asia/Manila").format("hh:mm A")}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={page === 1}
          style={[
            styles.pageButton,
            page === 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageNumber}>
          Page {page} of {totalPages}
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          disabled={page === totalPages}
          style={[
            styles.pageButton,
            page === totalPages && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f7",
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
    flexDirection: "column",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  action: {
    fontSize: 14,
    color: "#555",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3f7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  pageText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageNumber: {
    fontSize: 16,
    color: "#333",
  },
});

export default ActivityLog;
