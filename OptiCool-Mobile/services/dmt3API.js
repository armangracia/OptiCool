import axios from "axios"
import dmtUrl from "../assets/common/dmt3Url"
import { Alert } from "react-native";

const getSensorsStatusesAPI = async () => {

    // Sample Data
    // const data = {
    //     "sensor1": "Offline",
    //     "sensor2": "Offline",
    //     "sensor3": "Offline",
    //     "sensor4": "Offline",
    //     "sensor5": "Offline"
    // }

    const { data } = await axios.get(`${dmtUrl}/sensor_status`)
    return data;
};

const getDevicesDataAPI = async () => {

    // Sample Data
    // const data = {
    //     "inside": {
    //         "humidity": 0, "temperature": 0
    //     },
    //     "outside": { "humidity": 0, "temperature": 0 },
    //     "power_consumption": 0
    // }
    const { data } = await axios.get(`${dmtUrl}/devices_data`)
    return data;
};

const getCurrentACTempAPI = async () => {
    // Sample Data
    // const data = 20
    const { data } = await axios.get(`${dmtUrl}/current_ac_temp`)
    return data;
};

const adjustACFunc = async (adjustType = 'up', adjustNumber) => {
    let acTemp = 0;
    for (let index = 0; index < adjustNumber; index++) {

        const { data } = await axios.post(`${dmtUrl}/adjust_temperature`,
            {
                adjustment: adjustType
            }
        )
        acTemp = data.temperature;
    }
    return acTemp;
}

const adjustACTempAPI = async (tempValue = 24) => {

    const currentTempAC = await getCurrentACTempAPI();

    if (tempValue == currentTempAC) {
        console.log("Same temp as current");
        return;
    }

    if (tempValue <= 19) {
        console.log("Should be set to 19 only");

        return;
    }

    if (currentTempAC > tempValue) {
        const reduceTemp = currentTempAC - tempValue;
        console.log("Reduce Temp: " + reduceTemp);
        return await adjustACFunc("down", reduceTemp);
    }

    if (currentTempAC < tempValue) {
        const addedTemp = tempValue - currentTempAC;
        console.log("Added Temp: " + addedTemp);
        return await adjustACFunc("up", addedTemp);
    }

    Alert.alert("Setting AC Temp Error", "Error occured when setting AC temperature to low / high")
    return currentTempAC;
};

const turnOffAllAC = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_off_all_ac`);
    return data;
}

const turnOnAllAC = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_on_ac_all`);
    return data;
}

const turnOffEFans = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_off_all_e_fans`);
    return data;
}

const turnOnEFans = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_on_all_e_fans`);
    return data;
}

const turnOffBlower = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_off_blower`);
    return data;
}

const turnOnBlower = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_on_blower`);
    return data;
}

const turnOffExhaust = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_off_exhaust`);
    return data;
}

const turnOnExhaust = async () => {
    const { data } = await axios.get(`${dmtUrl}/turn_on_exhaust`);
    return data;
}

const getComponentsStatusAPI = async () => {
    const { data } = await axios.get(`${dmtUrl}/components_status`);
    return data;
}

const turnOffDevice = async (device = "none", applianceStatus) => {
    if (device === "AC") {
        if (!applianceStatus.AC.AC) {
            turnOnAllAC()
        } else {
            turnOffAllAC();
        }
        return;
    }

    if (device === "AC 2") {
        if (!applianceStatus.AC["AC 2"]) {
            turnOnAllAC()
        } else {
            turnOffAllAC();
        }
        return;
    }

    if (device === "Fan 1") {
        if (!applianceStatus.Fan["Fan 1"]) {
            turnOnEFans()
        } else {
            turnOffAllAC();
        }
        return;
    }

    if (device === "Exhaust 1") {
        if (!applianceStatus.Exhaust["Exhaust 1"]) {
            turnOnExhaust()
        } else {
            turnOffExhaust();
        }
        return;
    }

    if (device === "Blower 1") {
        console.log("Blower 1")
        console.log(!applianceStatus.Blower["Blower 1"]);
        if (!applianceStatus.Blower["Blower 1"]) {
            turnOnBlower()
        } else {
            turnOffBlower();
        }
        return;
    }

    return "no selected device"
}


const getPowerConsumptionAPI = async (startDate, endDate) => {
    const { data } = await axios.get(`${dmtUrl}/power_consumption_data?start_date=${startDate}&end_date=${endDate}`);
    console.log(data)
    return data;
}

const getWeeklyUsageAPI = async () => {
    try {
        const { data } = await axios.get(`${dmtUrl}/weekly_usage`);
        return data;
    } catch (error) {
        console.error("Error fetching weekly usage data:", error);
        return { labels: [], values: [] };
    }
};

const getMonthlyUsageAPI = async () => {
    try {
        const { data } = await axios.get(`${dmtUrl}/monthly_usage`);
        return data;
    } catch (error) {
        console.error("Error fetching monthly usage data:", error);
        return { labels: [], values: [] };
    }
};

export default {
    getComponentsStatusAPI,
    getSensorsStatusesAPI,
    getDevicesDataAPI,
    getCurrentACTempAPI,
    adjustACTempAPI,

    turnOffAllAC,
    turnOnAllAC,

    turnOnEFans,
    turnOffEFans,

    turnOffBlower,
    turnOnBlower,

    turnOffExhaust,
    turnOnExhaust,

    turnOffDevice,

    getPowerConsumptionAPI,

    getWeeklyUsageAPI,
    getMonthlyUsageAPI,
}