import React, { useEffect, useState } from "react";
import {
  LogOut,
  Menu as LucideMenu,
  Plus,
  Search,
  MessageCircle,
  User,
  X,
  Bell,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUnreadCount } from "../store/notificationsSlice";
import GlitchText from "./Glitch";
import useApi from "./useApi";
import { removeLogin } from "../store/slice";
import DynamicSearch from "./DynamicSearch";
import { toast } from "sonner";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8000";

const Nav = () => {
  const { is_login, refresh_token } = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.auth.user);
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unread_count = useSelector((state) => state.notifications.unread_count);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    if (is_login) {
      fetchUser();
    }
  }, [api, is_login]);

  useEffect(() => {
    if (!reduxUser?.id) return;

    const socket = new WebSocket(
      `${import.meta.VITE_WEBSOCKET_URL}/ws/notifications/${reduxUser.id}/`
    );
    setSocket(socket);

    socket.onopen = () => {
      console.log("✅ Websocket connected");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📨 Incoming Notification:", data);
      if (data.type === "count_update") {
        console.log("coming.....");
        dispatch(setUnreadCount(data.unread_count));
      } else if (
        [
          "comment_notification",
          "follow_notification",
          "like_notification",
        ].includes(data.type)
      ) {
        dispatch(setUnreadCount(data.unread_count));
        toast(data.message, {
          icon: <MessageCircle />,
        });
      } else {
        dispatch(setUnreadCount(data.unread_count));
        toast(data?.notification);
      }
    };

    socket.error = (error) => {
      console.error("websocket error : ", error);
    };
    socket.onclose = () => {
      console.log("🔌 Disconnected, retrying...");
    };
    return () => {
      socket.close();
    };
  }, [reduxUser?.id]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await api.get(`posts/list-notifications/${reduxUser.id}`);
        dispatch(setUnreadCount(res.data.count));
      } catch (error) {
        console.log("Error while fetching notification count", error);
      }
    };
    if (reduxUser?.id) fetchNotificationCount();
  }, [reduxUser]);

  const handleLogout = async () => {
    try {
      const response = await api.post("accounts/logout/", {
        refresh: refresh_token,
      });
      if (response.status === 200) {
        dispatch(removeLogin());
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
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

        <div className="hidden md:block relative w-64 md:w-90">
          <DynamicSearch className="w-full" />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            className={`flex items-center w-15 h-8 p-[5px] rounded-full ${
              theme === "light"
                ? "justify-start bg-gray-300"
                : "justify-end bg-purple-800"
            } transition-colors duration-300`}
          >
            <motion.div
              className={`w-5 h-5 ${
                theme === "light" ? "bg-gray-500" : "bg-purple-500"
              } rounded-full`}
              layout
              transition={{ type: "spring", duration: 0.2, bounce: 0.2 }}
            />
          </button>

          {is_login && user ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigateTo("/write-posts")}
                className="w-9 h-9 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <Plus
                  className="text-black dark:text-white group-hover:text-gray-500"
                  size={18}
                />
              </button>

              <button
                onClick={() => navigateTo("/notifications")}
                className="relative cursor-pointer"
              >
                <Bell className="text-black dark:text-white" size={30} />
                {unread_count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-300  dark:bg-purple-500 dark:text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unread_count}
                  </span>
                )}
              </button>

              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="w-12 h-12 rounded-full border group cursor-pointer border-gray-400 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition overflow-hidden">
                  {user?.profile_image ? (
                    <img
                      src={`${BASE_URL}${user.profile_image}`}
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
                          onClick={() => navigateTo(`/view-profile/${user.id}`)}
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
                          onClick={() => navigateTo(`/saved-posts`)}
                          className={`${
                            active
                              ? "bg-purple-100 dark:bg-purple-600 text-purple-800 dark:text-white"
                              : "text-gray-900 dark:text-gray-200"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <BookmarkCheck className="mr-2 h-4 w-4" />
                          Saved Post
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
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
            <button
              onClick={() => navigateTo("/login")}
              className="p-2 w-20 cursor-pointer rounded-lg border border-gray-400 bg-zinc-100 font-montserrat font-bold tracking-wide text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:text-black hover:text-gray-700 transition-colors duration-300 ease-in-out"
            >
              Login
            </button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            className={`flex items-center w-12 h-6 p-1 rounded-full ${
              theme === "light"
                ? "justify-start bg-gray-300"
                : "justify-end bg-purple-800"
            } transition-colors duration-300`}
          >
            <motion.div
              className={`w-4 h-4 ${
                theme === "light" ? "bg-gray-500" : "bg-purple-500"
              } rounded-full`}
              layout
              transition={{ type: "spring", duration: 0.2, bounce: 0.2 }}
            />
          </button>

          <button
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="text-black dark:text-white p-1 cursor-pointer"
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
              <DynamicSearch
                notification={
                  is_login && (
                    <button
                      onClick={() => navigateTo("/notifications")}
                      className="relative cursor-pointer"
                    >
                      <Bell className="text-black dark:text-white" size={30} />
                      {unread_count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gray-500 dark:bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {unread_count}
                        </span>
                      )}
                    </button>
                  )
                }
              />
            </div>

            {is_login && user ? (
              <div className="flex flex-col space-y-2">
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => navigateTo(`/view-profile/${user.id}`)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-400 dark:border-gray-600 flex items-center justify-center">
                    {user.profile_image ? (
                      <img
                        src={`${BASE_URL}${user.profile_image}`}
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
                  onClick={() => navigateTo("/write-posts")}
                >
                  <Plus size={16} className="text-black dark:text-white" />
                  <span className="text-black dark:text-white font-montserrat">
                    Add Post
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="text-black dark:text-white" />
                  <span className="text-black dark:text-white font-montserrat">
                    Logout
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigateTo("/login")}
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
