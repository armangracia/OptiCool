import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import dmt3API from "../../services/dmt3API";
import logActivity from "../../assets/common/logActivity";


const TOGGLE_LIMIT = 5; 
const WINDOW_MS = 10_000; 
const COOLDOWN_MS = 30_000; 

export default function AppliancesScreen() {
  const { user, token } = useSelector((state) => state.auth);

  const [isACOn, setIsACOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [isExhInOn, setIsExhInOn] = useState(false);
  const [isExhOutOn, setIsExhOutOn] = useState(false);

  const [lockAC, setLockAC] = useState(false);
  const [lockFan, setLockFan] = useState(false);
  const [lockIn, setLockIn] = useState(false);
  const [lockOut, setLockOut] = useState(false);

  const [loading, setLoading] = useState(false);

  const historyRef = useRef({
    AC: [],
    Fan: [],
    ExhIn: [],
    ExhOut: [],
  });

  const recordToggle = (key, setLock) => {
    const now = Date.now();
    const arr = historyRef.current[key];
    historyRef.current[key] = arr.filter((t) => now - t < WINDOW_MS);
    historyRef.current[key].push(now);

    if (historyRef.current[key].length > TOGGLE_LIMIT && !lockAC) {
      setLock(true);
      setTimeout(() => {
        setLock(false);
        historyRef.current[key] = [];
      }, COOLDOWN_MS);
    }
  };

  const makeHandler =
    (apiOn, apiOff, setState, key, setLock) => async (value) => {
      if (setLock === true) return; 

      recordToggle(key, setLock);
      if (setLock === true) return; 

      setLoading(true);
      try {
        if (value) await apiOn();
        else await apiOff();

        await logActivity({
          userId: user._id,
          action: `Turned ${value ? "on" : "off"} ${key}`,
          token,
        });

        setState(value);
      } catch (err) {
        Alert.alert("No running system", "Not connected to the system");
        console.error(err);
      }
      setLoading(false);
    };

  const onToggleAC = makeHandler(
    dmt3API.turnOnAllAC,
    dmt3API.turnOffAllAC,
    setIsACOn,
    "AC",
    setLockAC
  );
  const onToggleFan = makeHandler(
    dmt3API.turnOnEFans,
    dmt3API.turnOffEFans,
    setIsFanOn,
    "Fan",
    setLockFan
  );
  const onToggleIn = makeHandler(
    dmt3API.turnOnBlower,
    dmt3API.turnOffBlower,
    setIsExhInOn,
    "Exhaust In",
    setLockIn
  );
  const onToggleOut = makeHandler(
    dmt3API.turnOnExhaust,
    dmt3API.turnOffExhaust,
    setIsExhOutOn,
    "Exhaust Out",
    setLockOut
  );

  const cardStyle = (on, locked) => ({
    ...styles.card,
    opacity: locked ? 0.4 : 1,
    backgroundColor: on ? "#000" : "#fff",
  });

  const textStyle = (on) => ({
    ...styles.cardText,
    color: on ? "#fff" : "#000",
  });

  const imgStyle = (on) => ({
    ...styles.cardImage,
    tintColor: on ? "#fff" : "#000",
  });

  const Guard = ({ locked, children }) =>
    locked ? (
      <TouchableWithoutFeedback>{children}</TouchableWithoutFeedback>
    ) : (
      children
    );

  return (
    <View style={styles.container} pointerEvents={loading ? "none" : "auto"}>
      <View style={styles.row}>
        <Guard locked={lockAC}>
          <View style={cardStyle(isACOn, lockAC)}>
            <Image
              source={require("../../assets/air-conditioner.png")}
              style={imgStyle(isACOn)}
            />
            <View style={styles.labelRow}>
              <Text style={textStyle(isACOn)}>Aircon</Text>
              <Switch
                value={isACOn}
                onValueChange={onToggleAC}
                disabled={lockAC}
                style={styles.switch}
              />
            </View>
          </View>
        </Guard>

        <Guard locked={lockFan}>
          <View style={cardStyle(isFanOn, lockFan)}>
            <Image
              source={require("../../assets/fan.png")}
              style={imgStyle(isFanOn)}
            />
            <View style={styles.labelRow}>
              <Text style={textStyle(isFanOn)}>Fan</Text>
              <Switch
                value={isFanOn}
                onValueChange={onToggleFan}
                disabled={lockFan}
                style={styles.switch}
              />
            </View>
          </View>
        </Guard>
      </View>

      <View style={styles.row}>
        <Guard locked={lockIn}>
          <View style={cardStyle(isExhInOn, lockIn)}>
            <Image
              source={require("../../assets/fan.png")}
              style={imgStyle(isExhInOn)}
            />
            <View style={styles.labelRow}>
              <Text style={styles.smallText(isExhInOn)}>
                Exhaust{"\n"}(Inwards)
              </Text>
              <Switch
                value={isExhInOn}
                onValueChange={onToggleIn}
                disabled={lockIn}
                style={styles.switch}
              />
            </View>
          </View>
        </Guard>

        <Guard locked={lockOut}>
          <View style={cardStyle(isExhOutOn, lockOut)}>
            <Image
              source={require("../../assets/fan.png")}
              style={imgStyle(isExhOutOn)}
            />
            <View style={styles.labelRow}>
              <Text style={styles.smallText(isExhOutOn)}>
                Exhaust{"\n"}(Outwards)
              </Text>
              <Switch
                value={isExhOutOn}
                onValueChange={onToggleOut}
                disabled={lockOut}
                style={styles.switch}
              />
            </View>
          </View>
        </Guard>
      </View>

      {loading && (
        <View style={styles.spinnerBox}>
          <ActivityIndicator animating size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ebedf0",
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
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
    shadowColor: "#000",
    shadowOffset: { 
      width: 0, 
      height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImage: {
    width: 50,
    height: 50,
    marginBottom: 30,
    marginTop: 10,
    marginLeft: 20,
    alignSelf: "flex-start",
  },
  cardText: { 
    fontSize: 16, 
    marginTop: 5, 
    marginBottom: 5, 
    marginRight: 15 },
  smallText: (on) => ({
    fontSize: 14,
    color: on ? "#fff" : "#000",
    marginTop: 5,
    marginBottom: 5,
    marginRight: 15,
  }),
  labelRow: { 
    flexDirection: "row", 
    alignItems: "center" },
  switch: { 
    transform: [{ rotate: "90deg" }], 
    marginLeft: 8 },
  spinnerBox: { 
    position: "absolute", 
    top: "50%" },
});
