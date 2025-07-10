import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useApi from "./useApi";

const ActionButton = ({
    icon: Icon,
    count,
    postId,
    isShare = false,
    isSave = false,
    isSaved = false,
    className="",
    savePostIds,
    setSavedPostIds
  }) => {
    const api = useApi()
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const isAuthenticated = useSelector((state) => state.auth.is_login);


    const handleSaveToggle = async (e, postId) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error("Please login to save posts");
        return;
      }

      setSaving(true);
      try {
        const res = await api.post(`posts/save-post/${postId}/`);
        if (res.status === 200 || res.status === 201) {
          const wasSaved = savePostIds.has(postId);

          if (wasSaved) {
            setSavedPostIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(postId);
              return newSet;
            });
            toast.success("Post removed from saved posts!");
          } else {
            setSavedPostIds((prev) => new Set([...prev, postId]));
            toast.success("Post saved successfully!");
          }
        }
      } catch (error) {
        console.error("Error toggling save status:", error);
        toast.error("Failed to save/unsave post. Please try again.");
      } finally {
        setSaving(false);
      }
    };

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
      } else if (isSave && postId) {
        handleSaveToggle(e, postId);
      }
    };
    return (
      <button
        onClick={handleClick}
        disabled={saving}
        className={`flex items-center gap-2 transition-colors duration-300 group/btn ${
          saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${
          isSaved
            ? "text-purple-600 dark:text-purple-400"
            : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
        }`}
        title={
          isSave
            ? isSaved
              ? "Remove from saved"
              : "Save post"
            : isShare
            ? "Share post"
            : ""
        }
      >
        {copied ? (
          <CheckCircle
            size={18}
            className={`text-purple-500 transition-transform duration-200 ${className}`}
          />
        ) : (
          <Icon
            size={18}
            className={`transition-transform ${className} duration-200 ${
              saving ? "animate-pulse" : "group-hover/btn:scale-110 "
            }`}
          />
        )}
        {count !== undefined && (
          <span className="text-sm font-medium">{count}</span>
        )}
      </button>
    );
  };


export default ActionButton