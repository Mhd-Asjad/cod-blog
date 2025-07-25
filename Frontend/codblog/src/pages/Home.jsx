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
  BookmarkPlus,
  CheckCircle,
  BookmarkCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Tab } from "@headlessui/react";
import { useSelector } from "react-redux";
import ActionButton from "@/components/ActionButton";

const Home = () => {
  const api = useApi();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.is_login);
  const sortBy = useSelector((state) => state.filter.sortBy);

  const [savedPostIds, setSavedPostIds] = useState(new Set());

  const [explorePosts, setExplorePosts] = useState([]);
  const [exploreNext, setExploreNext] = useState(null);
  const [explorePrev, setExplorePrev] = useState(null);
  const [explorePage, setExplorePage] = useState(1);

  const [followingPosts, setFollowingPosts] = useState([]);
  const [followingNext, setFollowingNext] = useState(null);
  const [followingPrev, setFollowingPrev] = useState(null);
  const [followingPage, setFollowingPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchSavedPostIds = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get("posts/save-post/");
          if (res.status === 200) {
            const savedIds = new Set(res.data.map((post) => post.id));
            setSavedPostIds(savedIds);
          }
        } catch (error) {
          console.error("Error fetching saved post ids");
        }
      }
    };
    fetchSavedPostIds();
  }, [api, isAuthenticated]);

  useEffect(() => {
    if (selectedTab === 0) {
      fetchExplorePosts(`posts/list-posts/?sort=${sortBy}&page=${explorePage}`);
    } else if (isAuthenticated && selectedTab === 1) {
      fetchFollowingPosts(
        `posts/following-posts/?sort=${sortBy}&page=${followingPage}`
      );
    }
    setLoading(false);
  }, [sortBy, selectedTab, explorePage, followingPage, isAuthenticated]);

  const fetchExplorePosts = async (
    url = `posts/list-posts/?sort=${sortBy}`
  ) => {
    try {
      const relativeUrl = url.startsWith("http")
        ? url.replace("http://localhost:8000/", "")
        : url;
      const response = await api.get(relativeUrl);
      if (response.status === 200) {
        setExplorePosts(response.data.results);
        setExploreNext(response.data.next);
        setExplorePrev(response.data.previous);
        const page = relativeUrl.match(/page=(\d+)/);
        setExplorePage(page ? parseInt(page[1]) : 1);
      }
    } catch (error) {
      toast.error("Couldn't load Explore posts");
    }
  };

  const fetchFollowingPosts = async (
    url = `posts/following-posts/?sort=${sortBy}`
  ) => {
    try {
      const relativeUrl = url.startsWith("http")
        ? url.replace("http://localhost:8000/", "")
        : url;
      const response = await api.get(relativeUrl);
      if (response.status === 200) {
        setFollowingPosts(response.data.results);
        setFollowingNext(response.data.next);
        setFollowingPrev(response.data.previous);
        const page = relativeUrl.match(/page=(\d+)/);
        setFollowingPage(page ? parseInt(page[1]) : 1);
      }
    } catch (error) {
      toast.error("Couldn't load Following posts");
    }
  };

  const handleUsernameClick = (e, id) => {
    e.stopPropagation();
    navigate(`/user/${id}`);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const renderPosts = (posts) =>
    posts.map((post, index) => (
      <motion.div
        key={post.id || `post-${index}`}
        variants={postVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        onClick={() => handlePostClick(post.id)}
        className="group relative bg-white dark:bg-gray-800 cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 mb-8 border border-gray-100 dark:border-gray-700"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-p`urple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Main content */}
        <div className="relative p-8">
          {/* Author section */}
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

          {/* Post title */}
          <h2 className="text-3xl font-bold font-montserrat mb-4 text-gray-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
            {post.title}
          </h2>

          {/* Post preview/excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
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
              {/* <ActionButton icon={Eye} count={post.views || 0} /> */}
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                postId={post.id}
                isSave={true}
                savePostIds={savedPostIds}
                setSavedPostIds={setSavedPostIds}
                isSaved={savedPostIds.has(post.id)}
                icon={savedPostIds.has(post.id) ? BookmarkCheck : BookmarkPlus}
              />
              <ActionButton postId={post.id} icon={Share2} isShare={true} />
            </div>
          </div>
        </div>

        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </motion.div>
    ));

  
  const postVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95,
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        type: "spring",
        damping: 25,
        stiffness: 120,
      },
    }),
  };

  const tabVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <HashLoader color="#8B5CF6" size={60} />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Loading Post Contents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-blue-500/60 via-white to-purple-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="sticky top-0 z-50">
        <Nav />
      </div>


      {/* Hero section */}
      <div className="absolute h-screen z-0 inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20" />
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative px-4 max-w-6xl mx-auto pt-24 pb-12"
        >
          <motion.div variants={tabVariants} initial="hidden" animate="visible">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20 dark:border-gray-700/50 mb-12 max-w-md mx-auto">
                <Tab
                  className={({ selected }) =>
                    `flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      selected
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-600"
                    }`
                  }
                >
                  Explore
                </Tab>
                {isAuthenticated && (
                  <Tab
                    className={({ selected }) =>
                      `flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        selected
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                          : "text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-600"
                      }`
                    }
                  >
                    Following
                  </Tab>
                )}
              </Tab.List>

              <Tab.Panels>
                <AnimatePresence>
                  <Tab.Panel key="explore-panel">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      {explorePosts.length > 0 ? (
                        renderPosts(explorePosts)
                      ) : (
                        <EmptyState
                          title="No posts to explore"
                          description="Check back later for new content"
                        />
                      )}
                      <Pagination
                        next={exploreNext}
                        prev={explorePrev}
                        page={explorePage}
                        fetchNext={() => fetchExplorePosts(exploreNext)}
                        fetchPrev={() => fetchExplorePosts(explorePrev)}
                      />
                    </motion.div>
                  </Tab.Panel >
                  {isAuthenticated && (
                    <Tab.Panel>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {followingPosts?.length > 0 ? (
                          renderPosts(followingPosts)
                        ) : (
                          <EmptyState
                            title="No posts from people you follow"
                            description="Start following creators to see their latest posts here"
                          />
                        )}
                        <Pagination
                          next={followingNext}
                          prev={followingPrev}
                          page={followingPage}
                          fetchNext={() => fetchFollowingPosts(followingNext)}
                          fetchPrev={() => fetchFollowingPosts(followingPrev)}
                        />
                      </motion.div>
                    </Tab.Panel>
                  )}
                </AnimatePresence>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
      <Eye size={40} className="text-purple-600 dark:text-purple-400" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

const Pagination = ({ next, prev, page, fetchNext, fetchPrev }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-center items-center mt-16 gap-4"
  >
    {prev && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchPrev}
        className="px-8 py-3 rounded-xl text-sm font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 backdrop-blur-sm"
      >
        ← Previous
      </motion.button>
    )}

    {prev && next && (
      <div className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Page {page}
        </span>
      </div>
    )}

    {next && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchNext}
        className="px-8 py-3 rounded-xl text-sm font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 backdrop-blur-sm"
      >
        Next →
      </motion.button>
    )}
  </motion.div>
);

export default Home;
