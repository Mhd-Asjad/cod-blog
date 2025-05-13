import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import { User, Calendar, Mail, MapPin } from "lucide-react";

const ShowUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     try {
  //       const userResponse = await api.get(`users/profile/${id}/`);
  //       const postsResponse = await api.get(`posts/user-posts/${id}/`);
        
  //       if (userResponse.status === 200 && postsResponse.status === 200) {
  //         setUser(userResponse.data);
  //         setUserPosts(postsResponse.data);
  //         console.log(`User details: ${JSON.stringify(userResponse.data)}`);
  //         console.log(`User posts: ${JSON.stringify(postsResponse.data)}`);
  //       }
  //     } catch (error) {
  //       console.error(`Error while fetching user details: ${error}`);
  //       setError(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [id]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
        <HashLoader color="#8a2be2" size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-gray-800 text-red-500">
        <p>Error loading user profile. Please try again later.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-gray-800 text-gray-500">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8"
        >
          <div className="flex flex-col items-center mb-8">
            {user.profile_picture ? (
              <img
                className="w-24 h-24 border-4 border-purple-300 dark:border-purple-500 object-cover rounded-full shadow-lg mb-4"
                src={`http://localhost:8000${user.profile_picture}`}
                alt={`${user.username}'s profile`}
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white border-4 border-purple-300 dark:border-purple-500 rounded-full shadow-lg mb-4">
                <User size={48} />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user.full_name || user.username}
            </h1>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300 space-x-4">
              {user.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="text-center text-gray-700 dark:text-gray-300 mb-8">
              <p>{user.bio}</p>
            </div>
          )}

          {/* User Posts */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Posts by {user.username}
            </h2>
            
            {userPosts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No posts yet.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handlePostClick(post.id)}
                    className="bg-gray-100 dark:bg-gray-600 cursor-pointer rounded-xl shadow-md overflow-hidden transform hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                        <Calendar size={16} className="mr-2" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShowUserDetail;