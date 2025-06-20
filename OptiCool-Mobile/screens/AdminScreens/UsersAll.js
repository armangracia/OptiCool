import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  BottomNavigation,
} from "react-native-paper";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3e50",
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    marginBottom: 6,
    color: "#222",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 6,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 10,
  },
});

const UsersRoute = ({
  users,
  page,
  itemsPerPage,
  onItemsPerPageChange,
  numberOfItemsPerPageList,
  handleUpdateRole,
  handleDelete,
  setPage,
}) => {
  const paginatedUsers = users.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Users</Text>
      {paginatedUsers.map((user) => (
        <Card key={user._id} style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.username}</Text>

            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{user.role}</Text>

            <View style={styles.actions}>
              <IconButton icon="account-edit" onPress={() => handleUpdateRole(user._id)} />
              <IconButton icon="delete" iconColor="red" onPress={() => handleDelete(user._id)} />
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Pagination Controls */}
      <View style={styles.pagination}>
        <Button
          disabled={page === 0}
          onPress={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Text>
          Page {page + 1} of {totalPages}
        </Text>
        <Button
          disabled={(page + 1) >= totalPages}
          onPress={() => setPage(page + 1)}
        >
          Next
        </Button>
      </View>
    </ScrollView>
  );
};

const PendingUsersRoute = ({ pendingUsers, approveUser }) => (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>Pending Users</Text>
    {pendingUsers.map((user) => (
      <Card key={user._id} style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.username}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>

          <View style={styles.actions}>
            <Button
              mode="contained"
              buttonColor="#4caf50"
              textColor="white"
              onPress={() => approveUser(user._id, true)}
            >
              Approve
            </Button>
            <Button
              mode="outlined"
              textColor="red"
              onPress={() => approveUser(user._id, false)}
            >
              Decline
            </Button>
          </View>
        </Card.Content>
      </Card>
    ))}
  </ScrollView>
);

export default function UsersAll() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15]);
  const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "users", title: "Users", icon: "account-group" },
    { key: "pending", title: "Pending", icon: "account-clock" },
  ]);

  const { token } = useSelector((state) => state.auth);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data.users.filter((u) => u.isApproved));
      setPendingUsers(data.users.filter((u) => !u.isApproved));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch users.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${baseURL}/users/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "User successfully deleted.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete user.");
    }
  };

  const updateRole = async (id, role) => {
    try {
      await axios.put(
        `${baseURL}/users/update/role/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Role updated successfully.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update role.");
    }
  };

  const approveUser = async (id, isApproved) => {
    try {
      await axios.put(
        `${baseURL}/users/approve/${id}`,
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", `User ${isApproved ? "approved" : "declined"} successfully.`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update user status.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => deleteUser(id) },
    ]);
  };

  const handleUpdateRole = (id) => {
    Alert.alert("Update Role", "Select the new role for this user:", [
      { text: "Cancel", style: "cancel" },
      { text: "Admin", onPress: () => updateRole(id, "admin") },
      { text: "User", onPress: () => updateRole(id, "user") },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const renderScene = BottomNavigation.SceneMap({
    users: () => (
      <UsersRoute
        users={users}
        page={page}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        handleUpdateRole={handleUpdateRole}
        handleDelete={handleDelete}
        setPage={setPage}
      />
    ),
    pending: () => <PendingUsersRoute pendingUsers={pendingUsers} approveUser={approveUser} />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{
        backgroundColor: "#2d3e50",
        height: 60,
        elevation: 8,
      }}
      activeColor="#00e4f9"
      inactiveColor="#aaa"
      shifting={false}
    />
  );
}
