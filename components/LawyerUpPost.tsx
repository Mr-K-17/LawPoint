
import React, { useState } from 'react';
import type { LawyerUpPost, Client, Lawyer } from '../types';
import { HeartIcon, ChatBubbleIcon, SendIcon, TrashIcon } from './icons';

interface LawyerUpPostProps {
    post: LawyerUpPost;
    currentUser: (Client | Lawyer) & { role: string };
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onDeletePost?: (postId: string) => void;
}

const LawyerUpPostCard: React.FC<LawyerUpPostProps> = ({ post, currentUser, onLikePost, onAddComment, onDeletePost }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const isLiked = post.likes.includes(currentUser.id);
    const isAuthor = post.lawyerId === currentUser.id;

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(post.id, newComment);
        setNewComment('');
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDeletePost?.(post.id);
        }
    };

    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-4 relative">
            {isAuthor && onDeletePost && (
                <button 
                    onClick={handleDelete} 
                    className="absolute top-4 right-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
                    title="Delete Post"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}

            <div className="flex items-center mb-3">
                <img src={post.lawyerProfilePicUrl} alt={post.lawyerName} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                    <p className="font-bold">{post.lawyerName}</p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{timeSince(post.timestamp)}</p>
                </div>
            </div>
            
            <p className="mb-4 whitespace-pre-wrap">{post.text}</p>
            
            {post.imageUrl && (
                <div className="mb-4">
                    <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full max-h-96 object-cover" />
                </div>
            )}

            <div className="border-t border-light-accent dark:border-dark-accent pt-2 flex items-center space-x-4 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                <button onClick={() => onLikePost(post.id)} className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                    <HeartIcon className="w-5 h-5" filled={isLiked}/> 
                    <span>{post.likes.length} Likes</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 hover:text-indigo-500">
                    <ChatBubbleIcon className="w-5 h-5"/>
                    <span>{post.comments.length} Comments</span>
                </button>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-light-accent dark:border-dark-accent animate-fade-in-up">
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <img src={comment.commenter.profilePicUrl} alt={comment.commenter.name} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1 bg-light-primary dark:bg-dark-primary p-2 rounded-lg">
                                    <p className="font-semibold text-sm">{comment.commenter.name} 
                                      <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${comment.commenter.role === 'lawyer' ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{comment.commenter.role}</span>
                                    </p>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center space-x-2">
                        <img src={currentUser.profilePicUrl} alt="Your profile" className="w-8 h-8 rounded-full object-cover"/>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LawyerUpPostCard;
