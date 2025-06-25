import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import baseURL from '../../assets/common/baseUrl';

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users/all`);
      setUsers(response.data.users);
    } catch (err) {
      console.error(err);
      setError('Failed to load active users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveUsers();
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          item.isActive ? styles.onlineBadge : styles.offlineBadge,
        ]}
      >
        <Text style={styles.badgeText}>
          {item.isActive ? 'Online' : 'Offline'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading active users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Users</Text>
      <FlatList showsVerticalScrollIndicator={false}
        data={users}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
    marginTop: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  onlineBadge: {
    backgroundColor: '#d1fae5',
  },
  offlineBadge: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});

export default ActiveUsers;
