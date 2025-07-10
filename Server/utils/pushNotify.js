const axios = require("axios");

exports.sendPushNotification = async ({ expoPushToken, title, body, data }) => {
  try {
    if (!expoPushToken) return;

    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    });
  } catch (err) {
    console.error("Push notification error:", err.message);
  }
};
