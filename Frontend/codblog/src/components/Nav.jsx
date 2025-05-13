import React, { useEffect, useState } from "react";
import { Plus, Search, User } from "lucide-react";
import * as motion from "motion/react-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const { is_login, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-19 py-5 bg-zinc-100 border-b-2 border-gray-300 dark:bg-gray-800 transition-colors duration-300">
      <div>
        <p
          onClick={() => navigate("/")}
          className="text-black dark:text-white font-montserrat-extrabold text-xl md:text-3xl cursor-pointer"
        >
          CODBLOG
        </p>
      </div>

      <div className="relative w-44 md:w-64">
        <input
          type="text"
          className="w-full px-10 py-2 rounded-full border border-gray-400 dark:border-gray-600 dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white focus:outline-none dark:focus:ring-1 dark:focus:ring-purple-400 font-montserrat tracking-wider"
          placeholder="Search"
        />
        <Search
          className="absolute top-2.5 left-3 text-gray-500 dark:text-white"
          size={18}
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className={`flex items-center w-15 h-8 p-[5px] cursor-pointer rounded-full ${
            theme === "light"
              ? "justify-start bg-gray-300"
              : "justify-end bg-purple-800"
          } transition-colors duration-300 cursor-pointer`}
        >
          <motion.div
            className={`w-5 h-5 ${
              theme === "light" ? "bg-gray-500" : "bg-purple-500"
            } rounded-full`}
            layout
            transition={{ type: "spring", visualDuration: 0.2, bounce: 0.2 }}
          />
        </button>

        {is_login ? (
          <div className="flex items-center gap-10">
            <button
              onClick={() => navigate("/write-posts")}
              className="w-9 h-9 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <Plus
                className="text-black dark:text-white group-hover:text-gray-500"
                size={18}
              />
            </button>

            <button
              onClick={() => navigate(`/view-profile/${user.id}`)}
              className="w-12 h-12 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition overflow-hidden"
            >
              {user?.profile_image ? (
                <img
                  src={`http://localhost:8000${user.profile_image}`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User
                  className="text-black dark:text-white group-hover:text-gray-500"
                  size={18}
                />
              )}
            </button>
          </div>
        ) : (
          <div className="ml-5">
            <button
              onClick={() => navigate("/login")}
              className="p-2 w-20 cursor-pointer rounded-lg border border-gray-400 bg-zinc-100 font-montserrat font-bold tracking-wide text-black hover:bg-gray-300  dark:bg-gray-800 dark:text-white dark:hover:text-black hover:text-gray-700 transition-colors duration-300 ease-in-out"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
