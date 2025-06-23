import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import { User, Calendar, Mail, MapPin, Users, FileText, Heart, MessageCircle, Share2, ArrowLeft, Clock, Pen } from "lucide-react";
import Nav from "../components/Nav";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ShowUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followCount, setFollowCount] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reduxUser = useSelector((state) => state.auth.user)

  useEffect(() => {
    fetchUserDetails();
    checkFollowStatus();
    getFollowCount()
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const userResponse = await api.get(`posts/public-profile/${id}/`);

      if (userResponse.status === 200) {
        const fetchedUser = userResponse.data[0];
        setUser(fetchedUser);
        setUserPosts(fetchedUser.posts);
        console.log(`User details: ${JSON.stringify(fetchedUser)}`);
        console.log(`User Posts: ${JSON.stringify(fetchedUser.posts)}`);
      }
    } catch (error) {
      console.error(`Error while fetching user details: ${error}`);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await api.get(`posts/follow/status/${id}/`);
      setIsFollowing(res.data.is_following);
    } catch (error) {
      console.error("Follow status check failed", error);
    }
  };

  const getFollowCount = async () => {
    try {
      const response = await api.get("posts/get-follow-count/")
      setFollowCount(response.data)

    } catch ( error ) {
      console.error("failed to fetch follow count")
    }
  }

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleFollowToggle = async () => {
    setFollowingLoading(true);
    try {
      if (parseInt(id) === reduxUser.id) {
        toast.warning("You cannot follow yourself.");
        setFollowingLoading(false);
        return;
      }
      if (isFollowing) {
        await api.post("posts/unfollow/", { following: id });
        setIsFollowing(false);
      } else {
        await api.post("posts/follow/", { following: id });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Follow/Unfollow failed : ", error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-end">
          <HashLoader color="#8b5cf6" size={60} />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-center font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading user profile. Please try again later.</p>
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
     <div className="sticky top-0 z-50">
      <Nav />
     </div>
      
      {/* Hero Section with Cover */}
      <div className="relative">
        <div className="h-100 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-800"></div>
        
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute top-6 z-40 cursor-pointer left-6 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute -bottom-20 inset-x-0 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8"
          >
            <div className="flex flex-col items-center relative">
              <div className="relative mb-6">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
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
                  {user.username}
                </h1>
                
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {user.email && (
                  <div className="flex items-center justify-center mt-4 text-gray-500 dark:text-gray-400">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userPosts.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {followCount?.follower_count || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {followCount?.following_count || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                </div>
              </div>

              {/* Follow Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollowToggle}
                disabled={followingLoading}
                className={`px-8 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 ${
                  isFollowing
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {followingLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </div>
                )}
              </motion.button>
            </div>
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
            <div className="flex items-center justify-center mb-8">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Posts by {user.username}
              </h2>
            </div>

            {userPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {user.username} hasn't shared any posts yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post, index) => (
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
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ShowUserDetail;