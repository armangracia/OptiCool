import React, { useState } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import {
  Avatar,
  Button,
  Text,
  HelperText,
  TextInput,
} from "react-native-paper";
import * as Yup from "yup";
import { Formik } from "formik";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import mime from "mime";
import baseURL from "../../assets/common/baseUrl";
import axios from "axios";

const getPushToken = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
};

export default function Register({ navigation }) {
  const [avatar, setAvatar] = useState(null);

  const handleAvatarSelection = async () => {
    if (avatar) {
      setAvatar(null);
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const register = async (formData) => {
    try {
      const { data } = await axios.post(`${baseURL}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Account created!", "Login your account");
      navigation.navigate("Login");
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  };

  const submit = async (userData, setSubmitting) => {
    const formData = new FormData();
    const newImageUri = "file:///" + avatar?.split("file:/").join("");

    userData.avatar = {
      uri: newImageUri,
      type: mime.getType(newImageUri),
      name: newImageUri?.split("/").pop(),
    };

    // ✅ Get the Expo push token
    const pushToken = await getPushToken();
    if (pushToken) {
      formData.append("pushToken", pushToken);
    }

    // Append all form fields
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await register(formData);
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.heading}>Create your account</Text> */}

      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          avatar: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => submit(values, setSubmitting)}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          setFieldError,
          setSubmitting,
          isSubmitting,
        }) => (
          <>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Avatar.Icon
                  icon="account"
                  size={100}
                  style={styles.avatarPlaceholder}
                />
              )}
              <Button
                icon={avatar ? "delete" : "camera"}
                mode="outlined"
                onPress={() => {
                  handleAvatarSelection();
                  setFieldError("avatar", null);
                }}
                style={styles.avatarButton}
                labelStyle={{ color: "#000" }}
              >
                {avatar ? "Remove Avatar" : "Select Avatar"}
              </Button>
            </View>

            <TextInput
              placeholder="Username"
              mode="outlined"
              onChangeText={handleChange("username")}
              onBlur={handleBlur("username")}
              value={values.username}
              error={touched.username && !!errors.username}
              style={styles.input}
            />
            <HelperText
              type="error"
              visible={touched.username && errors.username}
            >
              {errors.username}
            </HelperText>

            <TextInput
              placeholder="Email"
              mode="outlined"
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={touched.email && !!errors.email}
              style={styles.input}
            />
            <HelperText type="error" visible={touched.email && errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              placeholder="Password"
              mode="outlined"
              secureTextEntry
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              error={touched.password && !!errors.password}
              style={styles.input}
            />
            <HelperText
              type="error"
              visible={touched.password && errors.password}
            >
              {errors.password}
            </HelperText>

            <TextInput
              placeholder="Confirm Password"
              mode="outlined"
              secureTextEntry
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              value={values.confirmPassword}
              error={touched.confirmPassword && !!errors.confirmPassword}
              style={styles.input}
            />
            <HelperText
              type="error"
              visible={touched.confirmPassword && errors.confirmPassword}
            >
              {errors.confirmPassword}
            </HelperText>

            <Button
              loading={isSubmitting}
              disabled={isSubmitting}
              mode="contained"
              onPress={() => {
                setSubmitting(true);
                setFieldValue("avatar", avatar);
                handleSubmit();
              }}
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
            >
              Register
            </Button>

            <View style={styles.loginRedirect}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                Login
              </Text>
            </View>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    alignSelf: "center",
    color: "#000",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  avatarButton: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#000",
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "#444",
  },
  loginLink: {
    color: "#00bfff",
    marginLeft: 5,
    fontWeight: "600",
  },
});
