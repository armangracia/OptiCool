import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Badge } from 'react-native-paper';

const mockNotifications = [
  {
    id: '1',
    title: 'System Online',
    message: 'The DMT Room 3 system is now online.',
    time: 'Just now',
    isRead: false,
  },
  {
    id: '2',
    title: 'New Report Submitted',
    message: 'A new issue report has been submitted by John Doe.',
    time: '10 minutes ago',
    isRead: false,
  },
  {
    id: '3',
    title: 'Pending User Request',
    message: 'Maria Cruz has signed up and is pending approval.',
    time: '1 hour ago',
    isRead: true,
  },
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleMarkAsRead(item.id)}>
      <Card style={[styles.card, item.isRead ? styles.read : styles.unread]}>
        <Card.Content>
          <Title>{item.title}</Title>
          <Paragraph>{item.message}</Paragraph>
          <Text style={styles.time}>{item.time}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Nootifications</Title>
        {unreadCount > 0 && (
          <Badge style={styles.badge}>{unreadCount}</Badge>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'red',
    marginLeft: 8,
  },
  card: {
    marginBottom: 12,
  },
  time: {
    marginTop: 6,
    color: 'gray',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: 'gray',
  },
  unread: {
    backgroundColor: '#e6f7ff',
  },
  read: {
    backgroundColor: '#f5f5f5',
  },
});

export default NotificationScreen;
