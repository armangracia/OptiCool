import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  DataTable,
  IconButton,
  Button,
  BottomNavigation,
} from "react-native-paper";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

const UsersRoute = ({ users, page, itemsPerPage, onItemsPerPageChange, numberOfItemsPerPageList, handleUpdateRole, handleDelete, setPage }) => (
  <ScrollView style={{ margin: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Users</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <DataTable style={{ width: 600 }}>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Email</DataTable.Title>
          <DataTable.Title>Role</DataTable.Title>
          <DataTable.Title numeric>Actions</DataTable.Title>
        </DataTable.Header>

        {users
          .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
          .map((user) => (
            <DataTable.Row key={user._id}>
              <DataTable.Cell>{user.username}</DataTable.Cell>
              <DataTable.Cell>{user.email}</DataTable.Cell>
              <DataTable.Cell>{user.role}</DataTable.Cell>
              <DataTable.Cell numeric>
                <IconButton icon="account-edit" onPress={() => handleUpdateRole(user._id)} />
                <IconButton icon="delete" onPress={() => handleDelete(user._id)} />
              </DataTable.Cell>
            </DataTable.Row>
          ))}

        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(users.length / itemsPerPage)}
          onPageChange={(newPage) => setPage(newPage)}
          label={`${page * itemsPerPage + 1}-${Math.min((page + 1) * itemsPerPage, users.length)} of ${users.length}`}
          numberOfItemsPerPageList={numberOfItemsPerPageList}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
        />
      </DataTable>
    </ScrollView>
  </ScrollView>
);

const PendingUsersRoute = ({ pendingUsers, approveUser }) => (
  <ScrollView style={{ margin: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Pending Users</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <DataTable style={{ width: 600 }}>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Email</DataTable.Title>
          <DataTable.Title numeric>Actions</DataTable.Title>
        </DataTable.Header>

        {pendingUsers.map((user) => (
          <DataTable.Row key={user._id}>
            <DataTable.Cell>{user.username}</DataTable.Cell>
            <DataTable.Cell>{user.email}</DataTable.Cell>
            <DataTable.Cell numeric>
              <Button onPress={() => approveUser(user._id, true)}>Approve</Button>
              <Button onPress={() => approveUser(user._id, false)} textColor="red">Decline</Button>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  </ScrollView>
);

export default function UsersAll() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15]);
  const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);

  const [index, setIndex] = useState(0); // Middle tab selected
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
    files: () => <View style={{ flex: 1 }} />,
    work: () => <View style={{ flex: 1 }} />,
    users: () =>
      <UsersRoute
        users={users}
        page={page}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        handleUpdateRole={handleUpdateRole}
        handleDelete={handleDelete}
        setPage={setPage}
      />,
    pending: () =>
      <PendingUsersRoute
        pendingUsers={pendingUsers}
        approveUser={approveUser}
      />,
    search: () => <View style={{ flex: 1 }} />,
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
