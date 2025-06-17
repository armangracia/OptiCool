import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import { Button, Text, HelperText, TextInput, IconButton } from "react-native-paper";
import * as Yup from "yup";
import { Formik } from "formik";
import axios from "axios";
import baseURL from "../../assets/common/baseUrl";
import { setAuth } from "../../states/authSlice";
import { useDispatch } from "react-redux";

export default function Login({ navigation }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, setSubmitting) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/users/login`, values);
      dispatch(setAuth({ user: data.user, token: data.token }));
      setLoading(false);
      setSubmitting(false);
      navigation.navigate("Home");
    } catch (err) {
      setLoading(false);
      setSubmitting(false);
      console.info(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome back!{"\n"}Glad to see you, Again!
      </Text>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => handleSubmit(values, setSubmitting)}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          setSubmitting,
        }) => (
          <>
            <TextInput
              placeholder="Enter your email"
              mode="outlined"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={touched.email && !!errors.email}
              style={styles.input}
            />
            <HelperText type="error" visible={touched.email && errors.email}>
              {errors.email}
            </HelperText>

            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Enter your password"
                mode="outlined"
                secureTextEntry={!showPassword}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                error={touched.password && !!errors.password}
                style={styles.input}
              />
              <IconButton
                icon={showPassword ? "eye-off" : "eye"}
                size={20}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              />
            </View>
            <HelperText type="error" visible={touched.password && errors.password}>
              {errors.password}
            </HelperText>

            <TouchableOpacity onPress={() => {/* handle forgot password */}}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={() => {
                setSubmitting(true);
                handleSubmit();
              }}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
            >
              Login
            </Button>

            <Text style={styles.orLoginText}>Or Login with</Text>

            

            <View style={styles.registerRow}>
              <Text>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>

      <Spinner visible={loading} textStyle={styles.spinnerTextStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "left",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  eyeIcon: {
    position: "absolute",
    right: 5,
    top: 10,
  },
  forgotText: {
    alignSelf: "flex-end",
    color: "#888",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  orLoginText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#888",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 30,
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#00bfff",
    fontWeight: "bold",
  },
  spinnerTextStyle: {
    color: '#aed6f2',
  },
});
