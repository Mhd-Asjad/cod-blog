import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


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
      .matches(
        /^\w{3,10}$/,
        "Username must be 3-10 characters and only contain letters, numbers, or _"
      ),

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

    confirm: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
  });

  const initialLoginData = { email: "", password: "" };
  const initialSignupData = {
    username: "",
    email: "",
    password: "",
    confirm: "",
  };

  const handleLogin = (values, { setSubmitting }) => {
    alert(JSON.stringify(values, null, 2));
    setSubmitting(false);
  };

  const handleSignup = (values, { setSubmitting }) => {
    alert(JSON.stringify(values, null, 2));
    setSubmitting(false);
  };
  return (
    <div>
      <div className="bg-white/10 backdrop-blur-md max-w-4xl w-lg p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl text-white font-bold mb-6 uppercase text-center">
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
                  <label htmlFor="username" className="block text-sm text-gray-200 mb-1">
                    Username
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    placeholder="username_123"
                    className="w-full p-3 rounded-lg bg-gray-200/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>
              )}
                <div>
                <label htmlFor="email" className="block text-sm text-gray-200 mb-1">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-3 rounded-lg bg-gray-200/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-400 text-xs mt-1"
                />
              </div>

              {isLogin ? (
                <div className="relative">
                  <label htmlFor="password" className="block text-sm text-gray-200 mb-1">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your secret spell..."
                    className="w-full p-3 rounded-lg bg-gray-200/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
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
                    <label htmlFor="password" className="block text-sm text-gray-200 mb-1">
                      Password
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full p-3 rounded-lg bg-gray-200/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    />
                    <div
                      className="absolute top-10 right-3 cursor-pointer text-gray-400"
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

                  {/* Confirm password */}
                  <div className="relative flex-1">
                    <label htmlFor="confirm" className="block text-sm text-gray-200 mb-1">
                      Confirm
                    </label>
                    <Field
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm"
                      className="w-full p-3 rounded-lg bg-gray-200/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    />
                    <div
                      className="absolute top-10 right-3 cursor-pointer text-gray-400"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <ErrorMessage
                      name="confirm"
                      component="div"
                      className="text-red-400 text-xs mt-1"
                    />
                  </div>
                </div>
              )}


              <button
                type="submit"
                className="p-3 text-center w-full bg-violet-500 text-white rounded-lg mt-3 transform transition-all duration-300 
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

        <p className="mt-6 text-center cursor-pointer text-gray-400 text-sm">{isLogin ? "No account yet?" : "Got an account?"}{" "}
          <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-400 hover:underline">
          {isLogin ? "Sign Up" : "Log In"}
          </button>

        </p>
      </div>
    </div>
  );
};

export default Login;
