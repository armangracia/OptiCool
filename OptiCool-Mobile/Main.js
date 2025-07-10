import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import BottomTabs from "./navigators/BottomTabs";
import AuthNavigation from "./navigators/AuthNavigation";
import DrawerNavigation from "./navigators/DrawerNavigation"; // Updated import
import { StatusBar } from "react-native";
import UsageNavigations from "./navigators/UsageNavigations"; // Stack for usage-related screens
import MenuNavigation from "./navigators/MenuNavigations"; // Stack for menu-related screens
import MockupDashboard from "./screens/UserScreens/MockupDashboard"; // Import the mock-up dashboard screen
import HumidityUsage from "./screens/PowerManagement/HumidityUsage";
import TemperatureUsage from "./screens/PowerManagement/TemperatureUsage";

// Other individual screens
import NotifScreen from "./screens/MenuScreens/NotifScreen";
import UpdateProfile from "./screens/UserScreens/UpdateProfile";
import AdminDashboard from "./screens/AdminScreens/AdminDashboard";
import ActiveUsers from "./screens/AdminScreens/ActiveUsers";
import ActivityLog from "./screens/AdminScreens/ActivityLog";
import HelpCenter from "./screens/AdminScreens/HelpCenter";
import UsersAll from "./screens/AdminScreens/UsersAll";
import UsageTracking from "./screens/PowerManagement/UsageTracking";
import CreatePosts from "./screens/AdminScreens/CreatePosts";
import EditPosts from "./screens/AdminScreens/EditPosts"; // Ensure correct import
import HelpDetails from "./screens/AdminScreens/HelpDetails";
import ReportDetails from "./screens/AdminScreens/ReportDetails"; // Ensure correct import
import PostList from "./screens/AdminScreens/PostList"; // Ensure correct import
import NotificationScreen from "./screens//MenuScreens/NotificationScreen";
import DataExtraction from "./screens/AdminScreens/DataExtraction";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";

const Stack = createStackNavigator();

export default function Main() {
  const { isLogin, role, user } = useSelector((state) => state.auth); // make sure user._id or user.id exists
  const inSessionPrevRole = useRef(role); // catches changes while mounted
  const notifiedThisSession = useRef(false); // avoids double-fires in same run

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status !== "granted") Notifications.requestPermissionsAsync();
    });
  }, []);

  useEffect(() => {
    if (!isLogin || !user) return; // wait for a logged-in user

    const storageKey = `lastRole_${user._id}`; // or user.id

    const checkRoleChange = async () => {
      const storedRole = (await AsyncStorage.getItem(storageKey)) || "pending";
      const currentRole = role?.toLowerCase() ?? "pending";

      const promotedToSuperadmin =
        storedRole !== currentRole && currentRole === "superadmin";

      const approvedFromPending =
        storedRole === "pending" && currentRole !== "pending";

      if (promotedToSuperadmin) {
        await notify("Access Granted", "You are now a Superadmin.");
      } else if (approvedFromPending) {
        await notify("Account Approved", "Your account is now approved.");
      }

      //  ➜ always store the latest role so we don't re-notify next time
      await AsyncStorage.setItem(storageKey, currentRole);
    };

    checkRoleChange();
  }, [isLogin, role, user]);


    useEffect(() => {
    if (notifiedThisSession.current) return;

    const becameSuperadmin =
      inSessionPrevRole.current !== role &&
      role?.toLowerCase() === "superadmin";

    const approvedFromPending =
      inSessionPrevRole.current === "pending" &&
      role?.toLowerCase() !== "pending";

    if (becameSuperadmin) {
      notify("Access Granted", "You are now a Superadmin.");
      notifiedThisSession.current = true;
    } else if (approvedFromPending) {
      notify("Account Approved", "Your account is now approved.");
      notifiedThisSession.current = true;
    }

    inSessionPrevRole.current = role;
  }, [role]);

  const notify = (title, body) =>
    Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });

  return (
    <NavigationContainer>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      {isLogin ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* BottomTabs as the main entry point */}
          <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />

          <Stack.Screen name="BottomTabs" component={BottomTabs} />

          {/* Other stack navigators */}
          <Stack.Screen name="UsageNavigations" component={UsageNavigations} />
          <Stack.Screen name="MenuNavigation" component={MenuNavigation} />
          <Stack.Screen name="NotifScreen" component={NotifScreen} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          <Stack.Screen name="ActiveUsers" component={ActiveUsers} />
          <Stack.Screen name="ActivityLog" component={ActivityLog} />
          <Stack.Screen name="UsersAll" component={UsersAll} />
          <Stack.Screen name="HelpCenter" component={HelpCenter} />
          <Stack.Screen name="CreatePosts" component={CreatePosts} />
          <Stack.Screen name="EditPosts" component={EditPosts} />
          <Stack.Screen name="PostList" component={PostList} />
          <Stack.Screen name="HumidityUsage" component={HumidityUsage} />
          <Stack.Screen name="TemperatureUsage" component={TemperatureUsage} />
          <Stack.Screen name="DataExtraction" component={DataExtraction} />

          <Stack.Screen
            name="HelpDetails"
            component={HelpDetails}
            options={{ title: "Help Details" }}
          />

          {/* Role-based screens */}
          {role === "SuperAdmin" && (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />

              <Stack.Screen
                name="ReportDetails"
                component={ReportDetails}
                options={{ title: "Report Details", headerShown: true }}
              />
              <Stack.Screen
                name="HelpDetails"
                component={HelpDetails}
                options={{ title: "Help Details" }}
              />
              <Stack.Screen
                name="NotificationScreen"
                component={NotificationScreen}
              />
            </>
          )}
          {role === "Admin" && (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
              <Stack.Screen name="ActiveUsers" component={ActiveUsers} />
              <Stack.Screen name="ActivityLog" component={ActivityLog} />
              <Stack.Screen name="UsersAll" component={UsersAll} />
              <Stack.Screen name="HelpCenter" component={HelpCenter} />
              <Stack.Screen name="CreatePosts" component={CreatePosts} />
              <Stack.Screen name="EditPosts" component={EditPosts} />
              <Stack.Screen name="PostList" component={PostList} />
              <Stack.Screen
                name="ReportDetails"
                component={ReportDetails}
                options={{ title: "Report Details", headerShown: true }}
              />
              <Stack.Screen
                name="HelpDetails"
                component={HelpDetails}
                options={{ title: "Help Details" }}
              />
              <Stack.Screen
                name="NotificationScreen"
                component={NotificationScreen}
              />
            </>
          )}
          {role === "User" && (
            <>
              <Stack.Screen
                name="MockupDashboard"
                component={MockupDashboard}
              />
              <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
            </>
          )}
        </Stack.Navigator>
      ) : (
        <AuthNavigation />
      )}
    </NavigationContainer>
  );
}
