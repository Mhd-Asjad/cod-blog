import React, { useState, useEffect } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import Nav from "../components/Nav";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { useSelector } from "react-redux";

const ShowNotifications = () => {
  const api = useApi();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const reduxUser = useSelector((state) => state.auth.user);

  const [counts, setCounts] = useState({
    comment_count: 0,
    like_count: 0,
    follow_count: 0,
    unread_count: 0,
  });

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    try {
      const res = await api.get(`posts/list-notifications/${reduxUser.id}`);
      const sampleNotifications = res.data.notification_data;
      console.log(sampleNotifications);
      setNotifications(sampleNotifications);
      setCounts({
        comment_count: sampleNotifications.filter(
          (n) => n.notification_type === "comment"
        ).length,
        like_count: sampleNotifications.filter(
          (n) => n.notification_type === "like"
        ).length,
        follow_count: sampleNotifications.filter(
          (n) => n.notification_type === "follow"
        ).length,
        unread_count: sampleNotifications.filter((n) => !n.is_read).length,
      });
    } catch (error) {
      console.log("error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === "All") return notifications;
    if (activeTab === "General")
      return notifications.filter(
        (n) =>
          n.notification_type === "comment" || n.notification_type === "like"
      );
    if (activeTab === "Followers")
      return notifications.filter((n) => n.notification_type === "follow");
    return notifications;
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      const res = await api.post(
        `posts/notification-actions/${notificationId}/`,
        { action }
      );
      console.log(res.data.message);
      fetchAllNotifications();
    } catch (error) {
      console.log(error, "error while notification actions");
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setCounts((prev) => ({ ...prev, unread_count: 0 }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.notification_type) {
      case "like":
        return `liked your post "${notification.post_title}"`;
      case "comment":
        return `commented on your post "${notification.post_title}"`;
      case "follow":
        return "started following you";
      default:
        return "sent you a notification";
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const tabs = [
    { name: "All", count: notifications.length },
    { name: "General", count: counts.comment_count + counts.like_count },
    { name: "Followers", count: counts.follow_count },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
        <HashLoader color="#8a2be2" size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-white transition-colors duration-300">
      <Nav />
      <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-10">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-2xl mt-4 font-semibold mx-auto">Notifications</h1>
          <div className="flex items-center gap-3">
            {counts.unread_count > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm  dark:hover:text-purple-400 dark:text-purple-500 cursor-pointer transition-colors font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex-1 py-4 text-sm font-medium relative transition-colors ${
                activeTab === tab.name
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {getFilteredNotifications().length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-slate-300 mb-2">
              Nothing to see here — yet
            </h2>
            <p className="text-gray-500 dark:text-slate-500">
              From likes to comment and a whole lot more, this is where all the
              action happens.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {getFilteredNotifications().map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 mt-2 border-b group hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors ${
                  !notification.is_read
                    ? "bg-purple-50 dark:bg-purple-500/5"
                    : ""
                } border-gray-200 dark:border-slate-700`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {notification.sender.username.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {notification.sender.username}
                        </span>
                        <span className="ml-1 text-gray-700 dark:text-slate-300">
                          {getNotificationText(notification)}
                        </span>
                      </p>

                      {notification.comment_content && (
                        <p className="text-sm italic text-gray-600 dark:text-slate-400 mt-1">
                          "{notification.comment_content}"
                        </p>
                      )}

                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          handleNotificationAction(
                            notification.id,
                            notification.is_read ? "mark_unread" : "mark_read"
                          )
                        }
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title={notification.is_read ? "readed" : "Mark as read"}
                      >
                        {notification.is_read ? (
                          <CheckCheck className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                        ) : (
                          <Check className="w-4 h-4 text-purple-500 dark:text-purple-500" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleNotificationAction(notification.id, "delete")
                        }
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-gray-700 dark:bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowNotifications;
