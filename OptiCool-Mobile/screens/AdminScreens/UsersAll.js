import React, { useCallback, useState } from "react";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  BottomNavigation,
} from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import baseURL from "../../assets/common/baseUrl";
import logActivity from "../../assets/common/logActivity";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3e50",
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
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
  paginationFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});

const UsersRoute = ({
  users,
  page,
  itemsPerPage,
  handleUpdateRole,
  handleDelete,
  setPage,
}) => {
  const paginatedUsers = users.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                <IconButton
                  icon="pencil"
                  iconColor="#000"
                  onPress={() => handleUpdateRole(user._id)}
                />
                <IconButton
                  icon="trash-can"
                  iconColor="red"
                  onPress={() => handleDelete(user._id)}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Pagination always visible */}
      <View style={styles.paginationFixed}>
        <Button disabled={page === 0} onPress={() => setPage(page - 1)}>
          Previous
        </Button>
        <Text>
          Page {page + 1} of {totalPages}
        </Text>
        <Button
          disabled={page + 1 >= totalPages}
          onPress={() => setPage(page + 1)}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const TrashUsersRoute = ({
  trashUsers,
  page,
  itemsPerPage,
  setPage,
  restoreUser,
}) => {
  const paginatedTrash = trashUsers.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(trashUsers.length / itemsPerPage);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Trash</Text>
        {paginatedTrash.map((user) => (
          <Card key={user._id} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user.username}</Text>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
              <Text style={styles.label}>Deleted At:</Text>
              <Text style={styles.value}>
                {user.deletedAt
                  ? new Date(user.deletedAt).toLocaleString()
                  : "—"}
              </Text>

              <View style={styles.actions}>
                <Button
                  icon="undo"
                  mode="contained"
                  buttonColor="#4caf50"
                  textColor="white"
                  onPress={() => restoreUser(user._id)}
                >
                  Restore
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.paginationFixed}>
        <Button disabled={page === 0} onPress={() => setPage(page - 1)}>
          Previous
        </Button>
        <Text>
          Page {page + 1} of {totalPages}
        </Text>
        <Button
          disabled={page + 1 >= totalPages}
          onPress={() => setPage(page + 1)}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const PendingUsersRoute = ({
  pendingUsers,
  page,
  itemsPerPage,
  setPage,
  approveUser,
  handleDecline,
}) => {
  const paginatedPending = pendingUsers.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(pendingUsers.length / itemsPerPage);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pending Users</Text>
        {paginatedPending.map((user) => (
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
                  onPress={() => handleDecline(user._id)}
                >
                  Decline
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.paginationFixed}>
        <Button disabled={page === 0} onPress={() => setPage(page - 1)}>
          Previous
        </Button>
        <Text>
          Page {page + 1} of {totalPages}
        </Text>
        <Button
          disabled={page + 1 >= totalPages}
          onPress={() => setPage(page + 1)}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

export default function UsersAll() {
  const [users, setUsers] = useState([]);
  const [pagePending, setPagePending] = useState(0); // for pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15]);
  const [itemsPerPage] = useState(numberOfItemsPerPageList[0]);
  const [index, setIndex] = useState(0);
  const [trashUsers, setTrashUsers] = useState([]);
  const [pageTrash, setPageTrash] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);

  const [routes] = useState([
    { key: "users", icon: "users" },
    { key: "pending", icon: "clock-o" },
    { key: "trash", icon: "trash" },
  ]);

  const { token, user } = useSelector((state) => state.auth);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(data.users.filter((u) => u.isApproved && !u.isDeleted));
      setPendingUsers(data.users.filter((u) => !u.isApproved && !u.isDeleted));
      setBadgeCount(
        data.users.filter((u) => !u.isApproved && !u.isDeleted).length
      );

      const trashRes = await axios.get(`${baseURL}/users/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashUsers(trashRes.data.users);
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

      await logActivity({
        userId: user._id,
        action: `Deleted user with ID: ${id}`,
        token,
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

      await logActivity({
        userId: user._id,
        action: `Updated user role to '${role}' for user ID: ${id}`,
        token,
      });

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

      await logActivity({
        userId: user._id,
        action: `${isApproved ? "Approved" : "Declined"} user with ID: ${id}`,
        token,
      });

      Alert.alert(
        "Success",
        `User ${isApproved ? "approved" : "declined"} successfully.`
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update user status.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Move to Trash",
      "Are you sure you want to move this user to trash?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => softDeleteUser(id) },
      ]
    );
  };

  const handleUpdateRole = (id) => {
    Alert.alert("Update Role", "Select the new role for this user:", [
      { text: "Cancel", style: "cancel" },
      { text: "Admin", onPress: () => updateRole(id, "admin") },
      { text: "User", onPress: () => updateRole(id, "user") },
    ]);
  };

  const softDeleteUser = async (id) => {
    try {
      await axios.put(
        `${baseURL}/users/soft-delete/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await logActivity({
        userId: user._id,
        action: `Soft deleted user with ID: ${id}`,
        token,
      });

      Alert.alert("User deleted", "User was moved to trash.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to soft delete user.");
    }
  };

  const restoreUser = async (id) => {
    try {
      await axios.put(
        `${baseURL}/users/restore/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await logActivity({
        userId: user._id,
        action: `Restored user with ID: ${id}`,
        token,
      });

      Alert.alert("User restored", "User has been restored.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to restore user.");
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDecline = (id) => {
    Alert.alert(
      "Decline User",
      "This will remove the account and move it to Trash. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => softDeleteUser(id) }, // reuse existing helper
      ]
    );
  };

  const renderScene = BottomNavigation.SceneMap({
    users: () => (
      <UsersRoute
        users={users}
        page={page}
        itemsPerPage={itemsPerPage}
        handleUpdateRole={handleUpdateRole}
        handleDelete={handleDelete}
        setPage={setPage}
      />
    ),
    pending: () => (
      <PendingUsersRoute
        pendingUsers={pendingUsers}
        page={pagePending}
        itemsPerPage={itemsPerPage}
        setPage={setPagePending}
        approveUser={approveUser}
        handleDecline={handleDecline}
      />
    ),
    trash: () => (
      <TrashUsersRoute
        trashUsers={trashUsers}
        page={pageTrash}
        itemsPerPage={itemsPerPage}
        setPage={setPageTrash}
        restoreUser={restoreUser}
      />
    ),
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      labeled={false}
      shifting={true}
      activeColor="black"
      inactiveColor="white"
      barStyle={{
        backgroundColor: "#121212",
        height: 68,
        elevation: 8,
      }}
      renderIcon={({ route, color }) => {
        if (route.key === "pending") {
          return (
            <View>
              <Icon name={route.icon} size={24} color={color} />
              {badgeCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -3,
                    backgroundColor: "red",
                    borderRadius: 8,
                    width: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 10 }}>
                    {badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        }
        return <Icon name={route.icon} size={24} color={color} />;
      }}
    />
  );
}
