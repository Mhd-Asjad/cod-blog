import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const api = useApi();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("posts/list-posts/");
        if (response.status === 200) {
          setPosts(response.data);
          console.log(`This is the posts === ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.error(`Error while fetching the posts : ${error}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        straggerChildren: 0.2,
      },
    },
  };

  const postVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      duration : 0.5,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        duration : 0.5
      },
    },
  };

  const lineVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  const handleUsernameClick = (e, id) => {
    e.stopPropagation();
    navigate(`/user/${id}`);
  };

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

  return (
    <div className="h-screen overflow-auto bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
      <Nav />
      <motion.div className="px-4  max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mt-20 mx-20">
          {posts.map((post, index) => (
            <>
              <motion.div
                key={index}
                variants={postVariants}
                onClick={() => handlePostClick(post.id)}
                className="bg-white dark:bg-gray-700 cursor-pointer rounded-xl shadow-md overflow-hidden transform hover:bg-zinc-100 dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    {post.user_profile ? (
                      <img
                        className="w-12 h-12 border-2 border-purple-300 dark:border-purple-500 object-cover rounded-full shadow-sm"
                        src={`http://localhost:8000${post.user_profile}`}
                        alt="user-profile"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white border rounded-full shadow-sm">
                        <User size={20} />
                      </div>
                    )}
                    <span
                      onClick={(e) => handleUsernameClick(e, post.user_id)}
                      className="font-bold tracking-wide text-gray-800 dark:text-white hover:underline"
                    >
                      {post.username}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-montserrat mb-2 text-gray-900 dark:text-white">
                    {post.title}
                  </h2>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className=" relative h-[1px] bg-transparent overflow-hidden"
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="absolute top-0 left-0 h-full bg-black/20 dark:bg-purple-400"
                  variants={lineVariants}
                />
              </motion.div>
            </>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
