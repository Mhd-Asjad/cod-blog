import React, { useEffect, useState } from "react";
import {
  LogOut,
  Menu as LucideMenu,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import * as motion from "motion/react-client";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GlitchText from "./Glitch";
import useApi from "./useApi";
import { removeLogin } from "../store/slice";
import DynamicSearch from "./DynamicSearch";

const Nav = () => {
  const { is_login, refresh_token } = useSelector((state) => state.auth);
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("accounts/get-user/");
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleLogoutOut = async () => {
    try {
      const response = await api.post("accounts/logout/", {
        refresh: refresh_token,
      });
      if (response.status === 200) {
        dispatch(removeLogin());
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-19 py-5 bg-zinc-100 border-b-2 border-gray-300 dark:bg-gray-800 transition-colors duration-300">
        <div>
          <GlitchText
            speed={1}
            enableShadows={true}
            enableOnHover={false}
            className="custom-class"
          >
            CODBLOG
          </GlitchText>
        </div>

        <div className="hidden sm:block relative w-64 md:w-90 ">
          <DynamicSearch className="w-full" />
        </div>

        <div className="hidden md:flex items-center gap-6">
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
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/write-posts")}
                className="w-9 h-9 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <Plus
                  className="text-black dark:text-white group-hover:text-gray-500"
                  size={18}
                />
              </button>

              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="w-12 h-12 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition overflow-hidden">
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
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => navigate(`/view-profile/${user?.id}`)}
                          className={`${
                            active
                              ? "bg-purple-100 dark:bg-purple-600 text-purple-800 dark:text-white"
                              : "text-gray-900 dark:text-gray-200"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogoutOut}
                          className={`${
                            active
                              ? "bg-purple-100 dark:bg-purple-600 text-purple-800 dark:text-white"
                              : "text-gray-900 dark:text-gray-200"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          ) : (
            <div>
              <button
                onClick={() => navigate("/login")}
                className="p-2 w-20 cursor-pointer rounded-lg border border-gray-400 bg-zinc-100 font-montserrat font-bold tracking-wide text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:text-black hover:text-gray-700 transition-colors duration-300 ease-in-out"
              >
                Login
              </button>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center w-12 h-6 p-1 cursor-pointer rounded-full ${
              theme === "light"
                ? "justify-start bg-gray-300"
                : "justify-end bg-purple-800"
            } transition-colors duration-300 cursor-pointer`}
          >
            <motion.div
              className={`w-4 h-4 ${
                theme === "light" ? "bg-gray-500" : "bg-purple-500"
              } rounded-full`}
              layout
              transition={{ type: "spring", visualDuration: 0.2, bounce: 0.2 }}
            />
          </button>

          <button
            onClick={toggleMobileMenu}
            className="text-black dark:text-white p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <LucideMenu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden w-full bg-zinc-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700"
        >
          <div className="px-4 py-2">
            <div className="mb-2 relative">
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

            {is_login ? (
              <div className="flex flex-col space-y-2">
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    navigate(`/view-profile/${user?.id}`);
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-400 dark:border-gray-600 flex items-center justify-center">
                    {user?.profile_image ? (
                      <img
                        src={`http://localhost:8000${user.profile_image}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-black dark:text-white" />
                    )}
                  </div>
                  <span className="text-black dark:text-white font-montserrat">
                    Profile
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    navigate("/write-posts");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Plus size={16} className="text-black dark:text-white" />
                  <span className="text-black dark:text-white font-montserrat">
                    Add Post
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={handleLogoutOut}
                >
                  <LogOut size={16} className="text-black dark:text-white" />
                  <span className="text-black dark:text-white font-montserrat">
                    Logout
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2 my-2 cursor-pointer rounded-lg border border-gray-400 bg-zinc-100 font-montserrat font-bold tracking-wide text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:text-black hover:text-gray-700 transition-colors duration-300 ease-in-out"
              >
                Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Nav;
