import React, { useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

// Set top-level handler (MUST be outside the component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotifScreen() {
  const TEMPERATURE_THRESHOLD = 30;
  const HUMIDITY_THRESHOLD = 70;

  useEffect(() => {
    // Ask permission
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Permission to receive notifications is required!');
      }
    };

    requestPermissions();

    // Background notification listener
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in background:', notification);
    });

    // Cleanup listeners on unmount
    return () => {
      receivedListener.remove();
    };
  }, []);

  // Simulate every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      simulateAndCheckConditions();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateMockSensorData = () => {
    return {
      temperature: Math.floor(Math.random() * 50),
      humidity: Math.floor(Math.random() * 100),
    };
  };

  const sendNotification = async (title, body) => {
    console.log(`Sending notification: ${title} - ${body}`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { additionalData: 'Simulated sensor alert' },
      },
      trigger: { seconds: 1 },
    });
  };

  const simulateAndCheckConditions = () => {
    const { temperature, humidity } = generateMockSensorData();
    console.log(`Temperature: ${temperature}°C, Humidity: ${humidity}%`);

    if (temperature > TEMPERATURE_THRESHOLD) {
      sendNotification('Temperature Alert 🚨', `Temperature exceeded: ${temperature}°C!`);
    }

    if (humidity > HUMIDITY_THRESHOLD) {
      sendNotification('Humidity Alert 💧', `Humidity exceeded: ${humidity}%!`);
    }
  };

  const manualNotification = () => {
    sendNotification('Manual Notification', 'This is a manually triggered notification.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mock Testing Notifications</Text>
      <Button title="Trigger Manual Notification" onPress={manualNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});
