import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import useApi from "../components/useApi";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { saveLogin } from "../store/slice";
import Squares from "../components/Squares";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import DotGrid from "../components/DotGrid";
import LetterGlitch from "../components/LetterGlitch";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirm_password, setShowconfirm_password] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, []);

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid Email")
      .required("Email is required")
      .trim()
      .matches(/^[\w.-]+@[\w.-]+\.\w+$/, "Email format is wrong"),
    password: Yup.string()
      .min(6, "Password is too short.")
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/,
        "Password is too weak.."
      ),
  });

  const signUpSchema = Yup.object({
    username: Yup.string()
      .trim()
      .required()
      .matches(/^\w{3,}$/, "Username must only contain letters, numbers, or _"),

    email: Yup.string()
      .email("Invalid Email")
      .trim("Email should not be empty")
      .required("Email is required")
      .matches(/^[\w.-]+@[\w.-]+\.\w+$/, "Email format is wrong"),

    password: Yup.string()
      .min(6, "Password is too short.")
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/,
        "Password is too weak.."
      ),

    confirm_password: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("confirm_password your password"),
  });

  const initialLoginData = { email: "", password: "" };
  const initialSignupData = {
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  const handleLogin = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await api.post(`accounts/login/`, values);
      if (response.status === 200) {
        toast.success("Login successful");
        dispatch(
          saveLogin({
            access_token: response.data.access,
            refresh_token: response.data.refresh,
            user: response.data.user,
          })
        );
      }
    } catch (error) {
      console.error(`login error : ${error}`);
      toast.error("Invalid Credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await api.post(`accounts/register/`, values);
      if (response.status === 201) {
        toast.success("New User Registered");
        resetForm();
        setIsLogin(true);
      }
    } catch (error) {
      console.error(`register error : ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {

      const response = await api.post("accounts/google/", {
        access_token: credentialResponse.credential,
      });

      dispatch(
        saveLogin({
          access_token: response.data.access,
          refresh_token: response.data.refresh,
          user: response.data.user,
        })
      );

      console.log("Logged in successfully:", response.data);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="h-screen relative overflow-hidden bg-black">
      <LetterGlitch
        glitchSpeed={1}
        centerVignette={false}
        outerVignette={true}
        smooth={true}
      />
      <motion.div
        transition={{ duration: 1 }}
        className="text-white absolute inset-0 flex justify-center items-center mx-2 md:mx-0"
      >
        <ToastContainer />
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md max-w-4xl w-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <h1 className="text-2xl text-white dark:text-gray-100 font-bold mb-6 uppercase text-center">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h1>

          <Formik
            initialValues={isLogin ? initialLoginData : initialSignupData}
            validationSchema={isLogin ? loginSchema : signUpSchema}
            onSubmit={isLogin ? handleLogin : handleSignup}
            enableReinitialize={true}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm text-gray-200 mb-1"
                    >
                      Username
                    </label>
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      placeholder="username_123"
                      className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition border border-gray-600/30 focus:border-purple-400"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-400 text-xs mt-1"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-200 mb-1"
                  >
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition border border-gray-600/30 focus:border-purple-400"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>

                {isLogin ? (
                  <div className="relative">
                    <label
                      htmlFor="password"
                      className="block text-sm text-gray-200 mb-1"
                    >
                      Password
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your secret spell..."
                      className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition border border-gray-600/30 focus:border-purple-400"
                    />
                    <div
                      className="absolute top-9 right-3 cursor-pointer text-gray-400 hover:text-gray-200 transition"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-400 text-xs mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <label
                        htmlFor="password"
                        className="block text-sm text-gray-200 mb-1"
                      >
                        Password
                      </label>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition border border-gray-600/30 focus:border-purple-400"
                      />
                      <div
                        className="absolute top-10 right-3 cursor-pointer text-gray-400 hover:text-gray-200 transition"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    <div className="relative flex-1">
                      <label
                        htmlFor="confirm_password"
                        className="block text-sm text-gray-200 mb-1"
                      >
                        Confirm Password
                      </label>
                      <Field
                        id="confirm_password"
                        name="confirm_password"
                        type={showconfirm_password ? "text" : "password"}
                        placeholder="Confirm password"
                        className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition border border-gray-600/30 focus:border-purple-400"
                      />
                      <div
                        className="absolute top-10 right-3 cursor-pointer text-gray-400 hover:text-gray-200 transition"
                        onClick={() =>
                          setShowconfirm_password(!showconfirm_password)
                        }
                      >
                        {showconfirm_password ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </div>
                      <ErrorMessage
                        name="confirm_password"
                        component="div"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="p-3 text-center w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg mt-6 transform transition-all duration-300 hover:from-purple-700 hover:to-blue-700 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {isLogin
                    ? isSubmitting
                      ? "Logging in..."
                      : "Login"
                    : isSubmitting
                    ? "Signing up..."
                    : "Sign Up"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 space-y-4 ">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/30"></div>
              </div>
              <div className="relative flex justify-center text-sm ">
                <span className="px-2 bg-transparent text-gray-400">
                  or continue with
                </span>
              </div>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed");
              }}
            />
            {/* 
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex cursor-pointer items-center justify-center gap-3 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              ) : (
                <GoogleIcon />
              )}
              <span>
                {isGoogleLoading ? "Connecting..." : `Continue with Google`}
              </span>
            </button> */}
          </div>

          <p className="mt-6 text-center cursor-pointer text-gray-400 dark:text-gray-300 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-purple-300 hover:text-purple-200 hover:underline transition-colors"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
