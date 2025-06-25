import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

const ActivityLog = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/activity-log?userId=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setLogs(response.data.logs);
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
    fetchActivityLogs();
  }, []);

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
              {/* <Text style={styles.status}>✔ Good Status</Text> */}
              <Text style={styles.timestamp}>
                {moment(item.timestamp).tz("Asia/Manila").format("hh:mm A")}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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

status: {
  fontSize: 14,
  color: "#4CAF50",
  fontWeight: "600",
  marginBottom: 4,
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
});

export default ActivityLog;
