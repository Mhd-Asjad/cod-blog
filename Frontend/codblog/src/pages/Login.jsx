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

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirm_password, setShowconfirm_password] = useState(false);
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
  return (
    <div className=" h-screen relative overflow-hidden bg-black">
      <Squares />
      <motion.div
        transition={{ duration: 1 }}
        className="text-white absolute inset-0 flex justify-center items-center mx-2 md:mx-0 "
      >
        <ToastContainer />
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md max-w-4xl w-lg p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl text-white dark:text-gray-100 font-bold mb-6 uppercase text-center">
        {isLogin ? "Welcome Back" : "Join Us"}
          </h1>
          <Formik
            initialValues={isLogin ? initialLoginData : initialSignupData}
            validationSchema={isLogin ? loginSchema : signUpSchema}
            onSubmit={isLogin ? handleLogin : handleSignup}
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
                      className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
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
                    className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
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
                      className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                      />
                    <div
                      className="absolute top-9 right-3 cursor-pointer text-gray-400"
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
                        className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                      <div
                        className="absolute top-10 right-3 cursor-pointer text-gray-400"
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
                        placeholder="confirm_password"
                        className="w-full p-3 rounded-lg bg-gray-200/20 dark:bg-gray-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                      <div
                        className="absolute top-10 right-3 cursor-pointer text-gray-400"
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
                  className="p-3 text-center w-full bg-gray-800 border-white text-white rounded-lg mt-3 transform transition-all duration-300 
            hover:bg-violet-700 active:scale-95 cursor-pointer"
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

          <p className="mt-6 text-center cursor-pointer text-gray-400 dark:text-gray-300 text-sm">
          {isLogin ? "No account yet?" : "Got an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-300 hover:underline"
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
