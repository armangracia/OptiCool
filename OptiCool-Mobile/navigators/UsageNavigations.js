// UsageNavigations.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ElectricityUsage from "../screens/PowerManagement/ElectricityUsage";
import UsageTracking from "../screens/PowerManagement/UsageTracking";
import HumidityUsage from "../screens/PowerManagement/HumidityUsage";

const Stack = createStackNavigator();

const UsageNavigations = () => {
  return (
    <Stack.Navigator 
      initialRouteName="ElectricityUsage"
    >

      {/* <Stack.Screen name="ElectricityUsage" component={ElectricityUsage} 
       options={{ headerShown: true }}
      /> */}
       
      <Stack.Screen name="Usage Tracker" component={UsageTracking} 
       options={{ headerShown: true }}
      />
      <Stack.Screen name="Humidity Tracker" component={HumidityUsage} 
       options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default UsageNavigations;
