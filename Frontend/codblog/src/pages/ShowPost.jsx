import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import { Calendar, Heart, HeartOff, User } from "lucide-react";
import Nav from "../components/Nav";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const renderBlock = (block) => {
  switch (block.type) {
    case "header":
      const Tag = `h${block.data.level || 1}`;
      return React.createElement(
        Tag,
        {
          key: block.id,
          className: `break-words ${
            block.data.level === 1
              ? "text-3xl font-montserrat-extrabold"
              : block.data.level === 2
              ? "text-2xl font-bold font-montserrat"
              : "text-xl font-semibold font-montserrat-extrabold"
          } mb-6 dark:text-white`,
        },
        block.data.text
      );

    case "paragraph":
      return (
        <p
          key={block.id}
          className="text-base text-black dark:text-white leading-relaxed pb-4 break-words whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );

    case "image":
      return (
        <div
          key={block.id}
          className="my-6 rounded-lg overflow-hidden shadow-md"
        >
          <img
            src={block.data.file.url}
            alt={block.data.caption || "post-image"}
            className="w-full max-h-[600px] object-cover"
          />
          {block.data.caption && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic break-words">
              {block.data.caption}
            </p>
          )}
        </div>
      );

    case "code":
      return (
        <pre
          key={block.id}
          className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm break-words whitespace-pre-wrap overflow-x-auto"
        >
          <code className="block text-black dark:text-white">
            {block.data.code}
          </code>
        </pre>
      );

    case "quote":
      return (
        <blockquote
          key={block.id}
          className="border-l-4 border-purple-500 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap"
        >
          <p>{block.data.text}</p>
          {block.data.caption && (
            <footer className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              — {block.data.caption}
            </footer>
          )}
        </blockquote>
      );

    case "embed":
      return (
        <div key={block.id} className="my-6 w-full aspect-video">
          <iframe
            src={block.data.embed}
            title="Embedded content"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg shadow"
          />
        </div>
      );

    default:
      return null;
  }
};

const ShowPost = () => {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`posts/show-post/${id}/`);
        if (response.status === 200) {
          console.log(JSON.stringify(response.data))
          setPost(response.data);
          setIsLiked(response.data.is_liked);
          setLikes(response.data.like);

        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, api]);

  const handleLikeToggle = async () => {
    const optimisticLiked = !isLiked;
    const optimisticLikes = isLiked ? likes - 1 : likes + 1;

    setIsLiked(optimisticLiked);
    setLikes(optimisticLikes);
    try {
      const response = await api.post(`posts/post-like/${id}/`);

      if (response.status === 200 && response.data) {
        setIsLiked(response.data.is_liked);
        setLikes(response.data.likes);
      }
    } catch (error) {
      setIsLiked(isLiked);
      setLikes(likes);

      if (error.response && error?.response?.status === 401) {
        toast.warning("You need to be logged in to like a post.");
      } else {
        toast.error("An error occurred while processing your request.");
        console.error("Like toggle error:", error);
      }
    }
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
        <p>Error loading post. Please try again later.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-100 dark:bg-gray-800 text-gray-500">
        <p>No post found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-zinc-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="sticky top-0 z-50">
      <Nav />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {post.author.profile_image ? (
                <img
                  src={post.author.profile_image}
                  alt="User"
                  className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover shadow"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center text-purple-800 dark:text-white">
                  <User size={20} />
                </div>
              )}

              <div>
                <p
                  onClick={() => navigate(`/user/${post.author.id}`)}
                  className="text-lg font-semibold cursor-pointer text-gray-800 dark:text-white hover:underline"
                >
                  {post.author.username}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-1" />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer transition-transform ease-in-out"
              onClick={handleLikeToggle}
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                className="flex flex-col items-center"
              >
                {isLiked ? (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <HeartSolid className="w-7 h-7 text-purple-600" />
                  </motion.div>
                ) : (
                  <HeartOutline className="w-7 h-7 text-gray-400" />
                )}
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {likes} {likes === 1 ? "Like" : "Likes"}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none break-words">
            {post.content && post.content.blocks ? (
              post.content.blocks.map(renderBlock)
            ) : (
              <p className="text-gray-500">No content available.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShowPost;
