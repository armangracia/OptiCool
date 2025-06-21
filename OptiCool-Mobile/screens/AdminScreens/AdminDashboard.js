import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchPosts();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${baseURL}/ereports/getreport`);
      if (response.status === 200) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts/getAllPosts`);
      if (response.status === 200) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const settingsSections = [
    {
      title: "Admin tools",
      data: [
        {
          icon: <Ionicons name="download-outline" size={24} color="#555" />,
          name: "Data Extraction",
          sub: "Export temperature, humidity, and power consumption data",
          action: () => navigation.navigate("DataExtraction"),
        },
        {
          icon: <Ionicons name="bar-chart-outline" size={24} color="#555" />,
          name: "Activity Logs",
          sub: "Review recent actions and usage history",
          action: () => navigation.navigate("ActivityLog"),
        },
        {
          icon: (
            <Ionicons name="document-text-outline" size={24} color="#555" />
          ),
          name: "Reports",
          sub: "View submitted reports and their details",
          action: () => navigation.navigate("ReportDetails", { reports }),
        },
        {
          icon: <Ionicons name="help-circle-outline" size={24} color="#555" />,
          name: "FAQs",
          sub: "Access and manage frequently asked questions",
          action: () => navigation.navigate("HelpCenter"),
        },
        {
          icon: <Ionicons name="people-outline" size={24} color="#555" />,
          name: "Users",
          sub: "View and manage all registered users",
          action: () => navigation.navigate("UsersAll"),
        },
        {
          icon: (
            <Ionicons name="person-circle-outline" size={24} color="#555" />
          ),
          name: "Active Users",
          sub: "Monitor users currently active in the system",
          action: () => navigation.navigate("ActiveUsers"),
        },
        {
          icon: <Ionicons name="create-outline" size={24} color="#555" />,
          name: "Edit Post",
          sub: "Modify or update existing help center posts",
          action: () => navigation.navigate("PostList"),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {settingsSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.data.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.action}
              style={styles.itemRow}
            >
              <View style={styles.textContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.icon}
                  <Text style={[styles.itemTitle, { marginLeft: 10 }]}>
                    {item.name}
                  </Text>
                </View>
                {item.sub && <Text style={styles.itemSub}>{item.sub}</Text>}
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6e6e6e",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: "#111",
  },
  itemSub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});

export default AdminDashboard;
