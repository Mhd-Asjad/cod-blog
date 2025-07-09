import React, { useEffect, useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import useApi from '@/components/useApi'
import { MoreHorizontal , Edit , Trash2 , PopcornIcon , MessageSquareText , MessageSquareX , Check , X , CircleCheckBig } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
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

function Comments({ postId }) {
  const api = useApi()
  const [comments , setComments] = useState([]);
  const [newComment , setNewComment ] = useState('');
  const [message , setMessage] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const reduxUser = useSelector((state) => state.auth.user)
  const [commentToDelete, setCommentToDelete] = useState(null);

  console.log(postId)
  useEffect(() => {
    fetchComments()
  },[]) 


  const fetchComments = async() => {
    try {
      const res = await api.get(`posts/list-comment/${postId}/`);
      console.log(res.data)
      if (res.status === 200) {
        setComments(res.data) 
      }
    }catch(error){
      console.log('error while featching comments..',error)
    }
  }

  const createComment = async() => {
    if (newComment.trim() === "" ) {
      toast( ' fill up some comments..... ' , {
        icon:  <MessageSquareX/>
      })
      return;
    }
    try {
      const res = await api.post(`posts/create-comment/`, {
        comment_data : {
          comment : newComment,
          post_id : postId,
        }
      })
      console.log(res.data?.message || res.data)
      if (res.status === 201) {
        setNewComment('')
        fetchComments()
      }
    }catch(error) {
      console.log('error while creating newComment..',error)
    }
  }

  const timeAgo = (timeStamp) => {
        const now = new Date()
        const past = new Date(timeStamp)
        const diff = Math.floor((now - past) / 1000 )
        
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        const timeDiff = `${Math.floor(diff / 86400)} days ago`;
        return timeDiff
  }

  const handleEditComment = (commentId , currentText) => {
      setEditingCommentId(commentId);
      setEditedComment(currentText);

  }

  const handleUpdateComment = async (commentId) => {
  try {
    const res = await api.patch(`posts/update-comment/${commentId}/`, {
        comment: editedComment,
      });
      console.log(res.data);
      setEditingCommentId(null);
      setEditedComment('');
      fetchComments();
      toast('comment edited successfully', {
        icon: <CircleCheckBig/>
      })
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment('');
  };

  const handleDeleteComment = async(commentId) => {
    try {
      const res = await api.delete(`posts/delete-comment/${commentId}/`)
      console.log(res.data)
      fetchComments()
      toast.success(' Comment deleted', {
        icon: <CircleCheckBig/>
      })    
    }catch(error){
      console.log('error on comment',error)
    }
    
  }
  console.log(comments)

  return (
  
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-4">

        <h2 className="text-2xl font-bold">Comments ({comments?.length})</h2>
        <div className="grid gap-2 ">
          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none rounded-md border border-input bg-background p-3 text-sm shadow-sm"
          />
          <button 
            className="justify-center mt-2 py-2 rounded-md bg-purple-500 text-white cursor-pointer"
            onClick={createComment}
          >
            Submit
            <MessageSquareText className='inline ml-1' />
          </button>
        </div>
      </div>
        <div className="space-y-6 borderrounded-md border rounded-md group">   
          {comments.length > 0 ? (
          
            comments?.map((comment) => (
              <div key={comment.id} className="relative flex items-start gap-4 p-3  dark:hover:bg-gray-700 hover:bg-gray-50 transition">

                <Avatar className="h-10 w-10 border">
                  <AvatarImage className="object-cover" src={comment.user_profile} alt="@shadcn" />
                  <AvatarFallback>{comment.user_username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                  <div className="grid gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{comment.user_username}</div>
                    <div className="text-xs text-muted-foreground">
                      {timeAgo(comment.created_at)}
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="bottom-6 right-6 w-[700px] gap-2">
                      <Textarea
                        className="w-full text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-end mt-3 gap-2 mr-1">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                          <Check/>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X/>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {comment.comment}
                    </div>
                    
                  )}
                </div>
                {reduxUser?.id === comment.user &&


                    <div className="absolute top-2 right-2">
                    <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4 dark:hover:bg-gray-700 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="cursor-pointer dark:hover:bg-gray-500 focus:bg-blue-50"
                                onClick={() => handleEditComment(comment.id, comment.comment)}
                              >
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                <span className="text-sm">Edit</span>
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="cursor-pointer dark:hover:bg-gray-500 focus:bg-red-50 text-red-600"
                                    onClick={() => setCommentToDelete(comment.id)}
                                  >

                                      <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                      <span className="text-sm">Delete</span>

                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>


                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the comment. You can’t undo this.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              if (commentToDelete) {
                                handleDeleteComment(commentToDelete)
                                setCommentToDelete(null);
                              }
                            }}
                            className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white font-semibold "

                            >
                              Delete
                              
                          </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  }
                </div>
            ))
          
          ):null}
        </div>

      </div>
  )
}

export default Comments