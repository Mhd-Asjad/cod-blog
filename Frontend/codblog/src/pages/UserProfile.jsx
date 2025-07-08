import React, { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import useApi from "../components/useApi";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import {
  User,
  Calendar,
  Trash,
  Upload,
  Edit2,
  Mail,
  AtSign,
  Clock,
  Eye,
  MessageCircle,
  Heart,
  Plus,
  Search,
  ChevronDown,
  Pen,
  FileText,
  Share2,
  Settings,
  Save,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profile_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postsToShow, setPostsToShow] = useState(10);
  const [followCount, setFollowCount] = useState(null);

  const [hasMore, setHasMore] = useState(false);
  const reduxUser = useSelector((state) => state.auth.user);


  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    fetchUserProfile();
    getFollowCount();
  }, []);

  async function fetchUserProfile() {
    try {
      const response = await api.get("posts/author-profile/");
      if (response.status === 200) {
        console.log(JSON.stringify(response.data));
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          bio: response.data.bio || "",
          profile_image: null,
        });

        setFilteredPosts(response.data.posts || []);
        setDisplayedPosts(response.data.posts?.slice(0, postsToShow) || []);
        setHasMore((response.data.posts?.length || 0) > postsToShow);
      }
    } catch (error) {
      toast.error("Failed to load user profile.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } finally {
      setLoading(false);
    }
  }

  const getFollowCount = async () => {
    try {
      const response = await api.get(`posts/get-follow-count/${reduxUser.id}`);
      setFollowCount(response.data);
    } catch (error) {
      console.error("failed to fetch follow count");
    }
  };

  useEffect(() => {
    if (user?.posts) {
      const filteredPosts = user.posts.filter(
        (post) =>
          (post?.title || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (post?.description || "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );

      setFilteredPosts(filteredPosts);
      setDisplayedPosts(filteredPosts.slice(0, postsToShow));
      setHasMore(filteredPosts.length > postsToShow);
    }
  }, [searchText, user?.posts, postsToShow]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPostsToShow(10);
  };

  const handleShowMore = () => {
    const newPostsToShow = postsToShow + 10;
    setPostsToShow(newPostsToShow);
    setDisplayedPosts(filteredPosts.slice(0, newPostsToShow));
    setHasMore(filteredPosts.length > newPostsToShow);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await api.delete(`/posts/delete-post/${postId}/`);
        if (response.status === 204 || response.status === 200) {
          const updatedPosts = user.posts.filter((p) => p.id !== postId);
          setUser((prevUser) => ({
            ...prevUser,
            posts: updatedPosts,
          }));
          setFilteredPosts(
            updatedPosts.filter(
              (post) =>
                (post.title || "")
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                (post.content || "")
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
            )
          );
          setDisplayedPosts((prev) => prev.filter((p) => p.id !== postId));

          toast.success("Post deleted successfully.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error("Failed to delete post. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const updateData = new FormData();
    updateData.append("username", formData.username);
    updateData.append("email", formData.email);
    updateData.append("bio", formData.bio);

    if (formData.profile_image) {
      updateData.append("profile_image", formData.profile_image);
    }

    try {
      const response = await api.put("posts/author-profile/", updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setUser(response.data);
        setIsEditing(false);
        setPreviewImage(null);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update profile.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profile_image: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCreatePost = () => {
    navigate("/write-posts");
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="sticky top-0 z-50">
        <Nav />
      </div>

      {/* Hero Section with Cover */}
      <div className="relative">
        <div className="h-110 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-800"></div>

        <div className="absolute -bottom-20 inset-x-0 h-130 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8"
          >
            {isEditing ? (
              <motion.form
                onSubmit={handleProfileUpdate}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Image Edit */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-xl">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : user?.profile_image ? (
                        <img
                          src={`http://localhost:8000${user.profile_image}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <User size={48} className="text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Upload size={24} className="text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click on image to change
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                    }}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {user?.profile_image ? (
                    <img
                      src={`http://localhost:8000${user.profile_image}`}
                      alt={user.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {user?.username}
                  </h1>

                  {user?.bio ? (
                    <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-4">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                      No bio added yet. Edit your profile to add one!
                    </p>
                  )}

                  {user?.email && (
                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <Mail size={16} className="mr-2" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.posts?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Posts
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followCount?.follower_count || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Followers
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followCount?.following_count || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Following
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Posts Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Posts
                </h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePost}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={18} />
                Create Post
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  placeholder="Search your posts..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Posts Content */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchText ? (
                    <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchText ? "No posts found" : "No posts yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  {searchText
                    ? `No posts match your search for "${searchText}". Try a different search term.`
                    : "Share your thoughts with the world. Create your first post now!"}
                </p>
                {!searchText ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreatePost}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Create Your First Post
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchText("")}
                    className="px-8 py-3 bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200"
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {displayedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handlePostClick(post.id)}
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {post.title}
                          </h3>

                          {post.content && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                              {post.content.substring(0, 150)}...
                            </p>
                          )}

                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {new Date(post.created_at).toLocaleString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>

                            {post.like !== undefined && (
                              <div className="flex items-center">
                                <Heart size={14} className="mr-1" />
                                {post.like}
                              </div>
                            )}

                            {post.comments_count !== undefined && (
                              <div className="flex items-center">
                                <MessageCircle size={14} className="mr-1" />
                                {post.comments_count}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/edit-post/${post.id}`)}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200"
                            title="Edit post"
                          >
                            <Pen size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                            title="Delete post"
                          >
                            <Trash size={18} />
                          </motion.button>
                        </div>
                      </div>

                      {post.image && (
                        <div
                          className="mt-4 h-48 rounded-xl overflow-hidden cursor-pointer"
                          onClick={() => handlePostClick(post.id)}
                        >
                          <img
                            src={`http://localhost:8000${post.image}`}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex gap-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Heart size={16} className="mr-1" />
                            <span>{post.like || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePostClick(post.id)}
                          className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShowMore}
                      className="flex items-center gap-2 px-8 py-3 bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronDown size={18} />
                      Show More Posts
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;