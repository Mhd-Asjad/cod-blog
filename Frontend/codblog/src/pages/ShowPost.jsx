import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../components/useApi";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";
import { Calendar, User } from "lucide-react";
import Nav from "../components/Nav";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`posts/show-post/${id}/`);
        if (response.status === 200) {
          setPost(response.data);
          console.log(`Fetched post data: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.error(`Error while fetching the post: ${error}`);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8"
        >
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {post.author.profile_image ? (
                <img
                  className="w-12 h-12 border-2 border-purple-300 dark:border-purple-500 object-cover rounded-full shadow-sm"
                  src={`http://localhost:8000${post.author.profile_image}`}
                  alt="user-profile"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white border rounded-full shadow-sm">
                  <User size={20} />
                </div>
              )}
              <div>
                <span
                  onClick={() => navigate(`/user/${post.author.id}`)}
                  className="font-bold cursor-pointer text-gray-800 dark:text-white block hover:underline"
                >
                  {post.author.username}
                </span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  {new Date(post.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
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
      </div>
    </div>
  );
};

export default ShowPost;
