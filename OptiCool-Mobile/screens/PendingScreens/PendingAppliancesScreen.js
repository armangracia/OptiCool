import React from "react";
import { View, Text, StyleSheet, Image, Switch } from "react-native";

const PendingAppliancesScreen = () => {
  const appliances = [
    {
      id: 1,
      name: "Aircon",
      icon: require("../../assets/air-conditioner.png"),
    },
    {
      id: 2,
      name: "Fan",
      icon: require("../../assets/fan.png"),
    },
    {
      id: 3,
      name: "Exhaust\n(Inwards)",
      icon: require("../../assets/fan.png"),
    },
    {
      id: 4,
      name: "Exhaust\n(Outwards)",
      icon: require("../../assets/fan.png"),
    },
  ];

  return (
    <View style={styles.container}>
      {/** Render appliances in two rows */}
      <View style={styles.row}>
        {appliances.slice(0, 2).map((item) => (
          <View key={item.id} style={[styles.card, styles.disabledCard]}>
            <Image source={item.icon} style={[styles.cardImage, styles.disabledImage]} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.cardText, styles.disabledText]}>{item.name}</Text>
              <Switch disabled={true} value={false} style={styles.switch} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {appliances.slice(2).map((item) => (
          <View key={item.id} style={[styles.card, styles.disabledCard]}>
            <Image source={item.icon} style={[styles.cardImage, styles.disabledImage]} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.smallCardText, styles.disabledText]}>{item.name}</Text>
              <Switch disabled={true} value={false} style={styles.switch} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  card: {
    width: "45%",
    height: 180,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  cardImage: {
    width: 50,
    height: 50,
    marginBottom: 30,
    marginTop: 10,
    marginLeft: 20,
    alignSelf: "flex-start",
  },
  disabledImage: {
    tintColor: "#888",
  },
  cardText: {
    fontSize: 16,
    color: "#000",
    marginTop: 5,
    marginBottom: 5,
    marginRight: 15,
  },
  smallCardText: {
    fontSize: 14,
    color: "#000",
    marginTop: 5,
    marginBottom: 5,
    marginRight: 15,
    marginLeft: 10,
  },
  disabledText: {
    color: "#666",
  },
  switch: {
    transform: [{ rotate: "90deg" }],
    marginLeft: 8,
  },
});

export default PendingAppliancesScreen;
