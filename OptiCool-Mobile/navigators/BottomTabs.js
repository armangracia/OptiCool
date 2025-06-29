import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "react-native-vector-icons";

import Dashboard from "../screens/Dashboard";
import Environment from "../screens/EStatusScreens/EnvironmentStatus";
import ElectricityUsage from "../screens/PowerManagement/ElectricityUsage";
import Report from "../screens/AdminScreens/EReport";
import ReportDetails from "../screens/AdminScreens/ReportDetails";
import AdminDashboard from "../screens/AdminScreens/AdminDashboard";
import ProfileNavigation from "./ProfileNavigation";
import MockupDashboard from "../screens/UserScreens/MockupDashboard";
import { removeAuth } from "../states/authSlice";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch(removeAuth());
    navigation.replace("Login");
  };

  return (
    <Tab.Navigator
      initialRouteName={
        user.role === "superadmin" || user.role === "admin"
          ? "Dashboard"
          : "MockupDashboard"
      }
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: "#ffffff",
          borderRadius: 15,
          height: 60,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#7a7a7a",
      }}
    >
      {user.role === "user" || user.role === "admin" ? (
        <>
          <Tab.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="home"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Status"
            component={Environment}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="widgets"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Usage"
            component={ElectricityUsage}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Reports"
            component={Report}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="alert-decagram"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Accounts"
            component={ProfileNavigation}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="account-circle"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="ReportDetails"
            component={ReportDetails}
            options={{
              tabBarButton: () => null,
            }}
          />
          <Tab.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{
              tabBarButton: () => null,
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="MockupDashboard"
            component={MockupDashboard}
            options={{
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="home"
                  size={30}
                  color={focused ? "#000" : "#7a7a7a"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Logout"
            component={() => null}
            options={{
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...props}
                  onPress={handleLogout}
                  style={[styles.logoutButton, props.style]}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={28}
                    color="#e53935"
                  />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  logoutText: {
    fontSize: 11,
    color: "#e53935",
    fontWeight: "bold",
  },
});
