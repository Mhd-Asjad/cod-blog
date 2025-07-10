import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import {
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  Heart,
  HeartOff,
  Share2,
  User,
  Copy,
  Check,
  Quote,
} from "lucide-react";
import Nav from "../components/Nav";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import Comments from "./Comments";
import ActionButton from "@/components/ActionButton";
import { useSelector } from "react-redux";

const CodeBlock = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.data.code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="relative group my-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm font-medium">Code</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        
        {/* Code Content */}
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm leading-relaxed">
            <code className="text-gray-100 whitespace-pre-wrap break-words font-mono">
              {block.data.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const QuoteBlock = ({ block }) => {
  return (
    <div className="my-8">
      <div className="relative">
        {/* Quote Icon */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <Quote size={16} className="text-white" />
        </div>
        
        {/* Quote Content */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 ml-4 border-l-4 border-purple-500 shadow-md">
          <blockquote className="relative">
            <p className="text-lg italic text-gray-700 dark:text-gray-200 leading-relaxed font-medium break-words whitespace-pre-wrap">
              "{block.data.text}"
            </p>
            {block.data.caption && (
              <footer className="mt-4 pt-2 border-t border-purple-200 dark:border-purple-700">
                <cite className="text-sm text-purple-600 dark:text-purple-400 font-semibold not-italic">
                  — {block.data.caption}
                </cite>
              </footer>
            )}
          </blockquote>
        </div>
      </div>
    </div>
  );
};

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
      return <CodeBlock key={block.id} block={block} />;

    case "quote":
      return <QuoteBlock key={block.id} block={block} />;

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
  const isAuthenticated = useSelector((state) => state.auth.is_login);

  const [savedPostIds, setSavedPostIds] = useState(new Set());

  useEffect(() => {
    const fetchSavedPostIds = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get("posts/save-post/");
          const savedIds = new Set(res.data.map((post) => post.id));
          setSavedPostIds(savedIds);
        } catch (error) {
          console.error("Error fetching saved post ids");
        }
      }
    };
    fetchSavedPostIds();
  }, [api, isAuthenticated]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`posts/show-post/${id}/`);
        if (response.status === 200) {
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
      <div className="h-screen flex items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <HashLoader color="#8B5CF6" size={60} />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Loading your Post...
          </p>
        </div>
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
    <div className="min-h-screen h-screen overflow-y-auto bg-zinc-100 dark:bg-gray-800">
      <div className="sticky top-0 z-50">
        <Nav />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 ">
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <ActionButton
                  postId={Number(id)}
                  isSave={true}
                  isSaved={savedPostIds.has(Number(id))}
                  icon={
                    savedPostIds.has(Number(id)) ? BookmarkCheck : BookmarkPlus
                  }
                  savePostIds={savedPostIds}
                  setSavedPostIds={setSavedPostIds}
                  className={`w-7 h-7 mb-4 text-gray-400 ${
                    savedPostIds.has(Number(id)) && "text-purple-400"
                  }`}
                />
              </div>

              <div>
                <ActionButton
                  postId={id}
                  icon={Share2}
                  isShare={true}
                  className="w-7 h-7 mb-4 text-gray-400"
                />
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
          </div>

          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none break-words">
            {post.content && post.content.blocks ? (
              post.content.blocks.map(renderBlock)
            ) : (
              <p className="text-gray-500">No content available.</p>
            )}
          </div>
        </motion.div>

        <Comments postId={id} />
      </div>
    </div>
  );
};

export default ShowPost;