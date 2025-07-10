import React, { useEffect, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useApi from "@/components/useApi";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquareText,
  MessageSquareX,
  Check,
  X,
  CircleCheckBig,
  Reply,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "motion/react";

const CommentItem = ({
  comment,
  postId,
  onCommentUpdate,
  reduxUser,
  isLogin,
  depth = 0,
  maxDepth = 3,
}) => {
  const api = useApi();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeAgo = useCallback((timeStamp) => {
    const now = new Date();
    const past = new Date(timeStamp);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }, []);

  const handleReplySubmit = async () => {
    if (!isLogin) {
      toast("You need to login to reply", {
        icon: <MessageSquareX />,
      });
      return;
    }

    if (replyText.trim() === "") {
      toast("Please write a reply...", {
        icon: <MessageSquareX />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`posts/create-comment/`, {
        comment_data: {
          comment: replyText,
          post_id: postId,
          parent_id: comment.id,
        },
      });
      if (res.status === 201) {
        setReplyText("");
        setIsReplying(false);
        onCommentUpdate();
        toast("Reply added successfully!", {
          icon: <CircleCheckBig />,
        });
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      toast("Failed to add reply", {
        icon: <MessageSquareX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedComment(currentText);
  };

  const handleUpdateComment = async (commentId) => {
    if (!isLogin) {
      toast("You need to login to edit comments", {
        icon: <MessageSquareX />,
      });
      return;
    }

    if (editedComment.trim() === "") {
      toast("Comment cannot be empty", {
        icon: <MessageSquareX />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`posts/update-comment/${commentId}/`, {
        comment: editedComment,
      });
      setEditingCommentId(null);
      setEditedComment("");
      onCommentUpdate(); // Use the prop instead of undefined fetchComments
      toast("Comment edited successfully", {
        icon: <CircleCheckBig />,
      });
    } catch (err) {
      console.error("Error updating comment:", err);
      toast("Failed to update comment", {
        icon: <MessageSquareX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  const handleDeleteComment = async (commentId) => {
    if (!isLogin) {
      toast("You need to login to delete comments", {
        icon: <MessageSquareX />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.delete(`posts/delete-comment/${commentId}/`);

      if (res.status === 200 || res.status === 204) {
        onCommentUpdate();
        toast("Comment deleted successfully", {
          icon: <CircleCheckBig />,
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast("Failed to delete comment", {
        icon: <MessageSquareX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIndentationClass = (depth) => {
    const indentations = {
      0: "ml-0",
      1: "ml-6",
      2: "ml-12",
      3: "ml-16",
      4: "ml-24",
    };
    return indentations[Math.min(depth, 4)] || "ml-24";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${getIndentationClass(depth)} ${
        depth > 0
          ? "border-l-2 border-purple-200 dark:border-purple-800 pl-4"
          : ""
      }`}
    >
      <div className="relative flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
        <Avatar className="h-10 w-10 border-2 border-purple-200 dark:border-purple-600 flex-shrink-0">
          <AvatarImage
            className="object-cover"
            src={comment.user_profile}
            alt={comment.user_username}
          />
          <AvatarFallback className="bg-purple-500 text-white">
            {comment.user_username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {comment.user_username}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {timeAgo(comment.created_at)}
            </div>
          </div>

          {editingCommentId === comment.id ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Textarea
                className="w-full text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={isSubmitting}
                  className="bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {comment.comment}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            {depth < maxDepth && isLogin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                disabled={isSubmitting}
                className="text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-1 h-auto"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 h-auto"
              >
                {showReplies ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 pt-2"
              >
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={isSubmitting}
                    className="bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                  >
                    <MessageSquareText className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Posting..." : "Reply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText("");
                    }}
                    disabled={isSubmitting}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {reduxUser?.id === comment.user && (
          <div className="absolute top-2 right-2 flex-shrink-0">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                      onClick={() =>
                        handleEditComment(comment.id, comment.comment)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-sm">Edit</span>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600"
                        onClick={() => setCommentToDelete(comment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                        <span className="text-sm">Delete</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-white">
                    Delete Comment
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                    This will permanently delete the comment and all its
                    replies. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-300 dark:border-gray-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (commentToDelete) {
                        handleDeleteComment(commentToDelete);
                        setCommentToDelete(null);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                onCommentUpdate={onCommentUpdate}
                reduxUser={reduxUser}
                isLogin={isLogin}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function Comments({ postId }) {
  const api = useApi();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduxUser = useSelector((state) => state.auth.user);
  const isLogin = useSelector((state) => state.auth.is_login);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`posts/list-comment/${postId}/`);
      if (res.status === 200) {
        setComments(res.data);
      }
    } catch (error) {
      console.error("Error while fetching comments:", error);
      toast("Failed to load comments", {
        icon: <MessageSquareX />,
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async () => {
    if (!isLogin) {
      toast("You need to login to comment", {
        icon: <MessageSquareX />,
      });
      return;
    }

    if (newComment.trim() === "") {
      toast("Please write a comment...", {
        icon: <MessageSquareX />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`posts/create-comment/`, {
        comment_data: {
          comment: newComment,
          post_id: postId,
        },
      });
      if (res.status === 201) {
        setNewComment("");
        fetchComments();
        toast("Comment added successfully!", {
          icon: <CircleCheckBig />,
        });
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast("Failed to add comment", {
        icon: <MessageSquareX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentComments = comments.filter((comment) => !comment.parent);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments ({comments?.length || 0})
        </h2>
        <div className="space-y-3">
          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
            rows={3}
            disabled={isSubmitting}
          />
          <Button
            onClick={createComment}
            disabled={isSubmitting || !isLogin}
            className="bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 items-center"
          >
            <MessageSquareText className="h-4 w-4 mr-2" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
          {!isLogin && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please login to post comments
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Loading comments...
            </p>
          </div>
        ) : parentComments.length > 0 ? (
          <AnimatePresence>
            {parentComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onCommentUpdate={fetchComments}
                reduxUser={reduxUser}
                isLogin={isLogin}
                depth={0}
                maxDepth={4}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquareText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;