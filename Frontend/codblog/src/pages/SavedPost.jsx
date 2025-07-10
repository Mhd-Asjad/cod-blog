import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  CheckCircle,
  BookmarkX,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Tab } from "@headlessui/react";
import { useSelector } from "react-redux";

const SavedPost = () => {
  const api = useApi();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.is_login);
  const sortBy = useSelector((state) => state.filter.sortBy);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const postVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  // Fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("posts/save-post/");
        if (res.status === 200) {
          setSavedPosts(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching saved posts:", err);
        setError("Failed to load saved posts. Please try again.");
        toast.error("Failed to load saved posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [api, isAuthenticated, navigate]);

  // Handle post click
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Handle username click
  const handleUsernameClick = (e, userId) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  // Handle unsave post
  const handleUnsavePost = async (e, postId) => {
    e.stopPropagation();
    try {
      const res = await api.post(`posts/save-post/${postId}/`);
      if (res.status === 200 || res.status === 201) {
        // Remove the post from saved posts list
        setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
        toast.success("Post removed from saved posts!");
      }
    } catch (err) {
      console.error("Error unsaving post:", err);
      toast.error("Failed to remove post from saved posts.");
    }
  };

  // Action Button Component
  const ActionButton = ({
    icon: Icon,
    count,
    postId,
    isShare = false,
    isUnsave = false,
  }) => {
    const [copied, setCopied] = useState(false);

    const handleClick = (e) => {
      e.stopPropagation();

      if (isShare && postId) {
        const postLink = `${window.location.origin}/post/${postId}`;
        navigator.clipboard
          .writeText(postLink)
          .then(() => {
            toast.success("Post link copied to clipboard!");
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
          })
          .catch(() => {
            toast.error("Failed to copy the post link.");
          });
      } else if (isUnsave && postId) {
        handleUnsavePost(e, postId);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group/btn"
      >
        {copied ? (
          <CheckCircle
            size={18}
            className="text-purple-500 transition-transform duration-200"
          />
        ) : (
          <Icon
            size={18}
            className="group-hover/btn:scale-110 transition-transform duration-200"
          />
        )}
        {count !== undefined && (
          <span className="text-sm font-medium">{count}</span>
        )}
      </button>
    );
  };

  // Render individual posts
  const renderPosts = (posts) =>
    posts.map((post, index) => (
      <motion.div
        key={post.id}
        variants={postVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        onClick={() => handlePostClick(post.id)}
        className="group relative bg-white dark:bg-gray-800 cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 mb-8 border border-gray-100 dark:border-gray-700"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {post.author.profile_image ? (
                <img
                  className="w-14 h-14 border-3 border-purple-200 dark:border-purple-600 object-cover rounded-full shadow-lg ring-4 ring-purple-100 dark:ring-purple-900 transition-transform duration-300 group-hover:scale-105"
                  src={
                    post.author.profile_image.startsWith("http")
                      ? post.author.profile_image
                      : `http://localhost:8000${post.author.profile_image}`
                  }
                  alt="user-profile"
                />
              ) : (
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 text-white border-3 border-purple-200 dark:border-purple-600 rounded-full shadow-lg ring-4 ring-purple-100 dark:ring-purple-900 transition-transform duration-300 group-hover:scale-105">
                  <User size={22} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <span
                onClick={(e) => handleUsernameClick(e, post.author.id)}
                className="font-bold text-lg tracking-wide text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 cursor-pointer"
              >
                @{post.author.username}
              </span>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                <span>
                  {new Date(post.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold font-montserrat mb-4 text-gray-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full font-medium">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <ActionButton icon={Heart} count={post.like || 0} />
              <ActionButton
                icon={MessageCircle}
                count={post.comment_count || 0}
              />
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                icon={BookmarkX}
                postId={post.id}
                isUnsave={true}
                title="Remove from saved"
              />
              <ActionButton postId={post.id} icon={Share2} isShare={true} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </motion.div>
    ));

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <HashLoader color="#8B5CF6" size={60} />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Loading your saved posts...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen overflow-y-auto bg-gradient-to-br from-blue-500/60 via-white to-purple-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="sticky top-0 z-50">
          <Nav />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-blue-500/60 via-white to-purple-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="sticky top-0 z-50">
        <Nav />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Posts */}
        <AnimatePresence>
          {savedPosts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {renderPosts(savedPosts)}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <Bookmark
                className="mx-auto mb-6 text-gray-400 dark:text-gray-500"
                size={80}
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No saved posts yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start saving posts that you want to read later. Click the
                bookmark icon on any post to save it here.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium"
              >
                Browse Posts
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedPost;
