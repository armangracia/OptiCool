import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, Title } from "react-native-paper";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";

const ITEMS_PER_PAGE = 5;

const NotificationScreen = () => {
  const { token } = useSelector((state) => state.auth);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [page, setPage] = useState(0);

  const fetchPendingUsers = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = data.users.filter((u) => !u.isApproved && !u.isDeleted);
      setPendingUsers(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPendingUsers();
    }, [])
  );

  const paginated = pendingUsers.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(pendingUsers.length / ITEMS_PER_PAGE);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Title style={styles.title}>Notifications</Title>
        {paginated.length === 0 ? (
          <Text style={styles.empty}>No pending user notifications.</Text>
        ) : (
          paginated.map((user) => (
            <Card key={user._id} style={styles.card}>
              <View style={styles.textContainer}>
                <Text>
                  <Text style={styles.bold}>{user.username}</Text>{" "}
                  is requesting account approval.
                </Text>
                <Text style={styles.message}>Email: {user.email}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Pagination Arrows */}
      {pendingUsers.length > ITEMS_PER_PAGE && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            <Text style={[styles.arrow, page === 0 && styles.disabled]}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.pageText}>
            Page {page + 1} of {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page + 1 >= totalPages}
          >
            <Text
              style={[
                styles.arrow,
                page + 1 >= totalPages && styles.disabled,
              ]}
            >
              {'→'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3e50",
  },
  card: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f6f8ff",
    borderRadius: 12,
    elevation: 1,
  },
  textContainer: {
    flex: 1,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    marginTop: 4,
    color: "#444",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  arrow: {
    fontSize: 20,
    paddingHorizontal: 20,
    color: "#333",
  },
  disabled: {
    color: "#ccc",
  },
  pageText: {
    fontSize: 16,
    color: "#333",
  },
});

export default NotificationScreen;
