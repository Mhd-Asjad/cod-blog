import React, { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import useApi from "../components/useApi";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
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
} from "lucide-react";

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
  const [hasMore, setHasMore] = useState(false);

  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const response = await api.get("posts/author-profile/");
      if (response.status === 200) {
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
        if (response.status === 404) {
          const updatedPosts = user.posts.filter((p) => p.id !== postId);
          setUser((prevUser) => ({
            ...prevUser,
            posts: updatedPosts,
          }));
          setFilteredPosts(
            updatedPosts.filter(
              (post) =>
                post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                post.content.toLowerCase().includes(searchText.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <HashLoader color="#8a2be2" size={60} />
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-6 pt-20">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                {isEditing ? (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
                      <User
                        size={48}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    )}
                    <button
                      onClick={triggerFileInput}
                      className="absolute inset-0 bg-black/50 rounded-full bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {user?.profile_image ? (
                      <img
                        src={`http://localhost:8000${user.profile_image}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={48}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-8 px-8">
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                        <AtSign size={18} />
                      </span>
                      <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="Username"
                        className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                        <Mail size={18} />
                      </span>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Email"
                        className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.username}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Mail size={16} className="mr-2" />
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-300"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                </div>

                <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Bio
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    {user?.bio ||
                      "No bio added yet. Edit your profile to add one!"}
                  </p>
                </div>

                <div className="mt-8 flex gap-6">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.posts?.length || 0}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Posts
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.followers_count || 0}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.following_count || 0}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Following
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Posts
            </h2>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  placeholder="Search your posts..."
                  className="w-full px-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search
                  className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400"
                  size={18}
                />
              </div>

              <button
                onClick={handleCreatePost}
                className="px-4 py-2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300 whitespace-nowrap"
              >
                <Plus size={18} />
                Create Post
              </button>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                  {searchText ? (
                    <Search
                      size={32}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  ) : (
                    <Edit2
                      size={32}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {searchText ? "No posts found" : "No posts yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                  {searchText
                    ? `No posts match your search for "${searchText}". Try a different search term.`
                    : "Share your thoughts with the world. Create your first post now!"}
                </p>
                {!searchText && (
                  <button
                    onClick={handleCreatePost}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Create Your First Post
                  </button>
                )}
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-300"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {displayedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="cursor-pointer flex-1"
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                            {post.title}
                          </h3>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(post.created_at).toLocaleString(
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
                          </div>

                          {post.content && (
                            <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-2">
                              {post.content}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="ml-4 p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                          title="Delete post"
                        >
                          <Trash size={20} />
                        </button>
                      </div>

                      {post.image && (
                        <div
                          className="mt-4 h-48 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          <img
                            src={`http://localhost:8000${post.image}`}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Heart size={16} className="mr-1" />
                            <span>{post.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MessageCircle size={16} className="mr-1" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Eye size={16} className="mr-1" />
                            <span>{post.views_count || 0}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleShowMore}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 font-medium rounded-lg shadow-md transition-colors duration-300"
                  >
                    Show More
                    <ChevronDown size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
