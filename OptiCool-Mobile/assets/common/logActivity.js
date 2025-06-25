import axios from "axios";
import baseUrl from "./baseUrl"; 
import moment from "moment-timezone";

const logActivity = async ({ userId, action, token }) => {
  try {
    const timestamp = moment().tz("Asia/Manila").format();
    await axios.post(
      `${baseUrl}/activity-log`,
      {
        userId,
        action,
        timestamp,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export default logActivity;
