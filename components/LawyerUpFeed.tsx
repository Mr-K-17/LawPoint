
import React, { useState } from 'react';
import type { Client, Lawyer, LawyerUpPost } from '../types';
import { UserRole } from '../types';
import LawyerUpPostCard from './LawyerUpPost';
import { UploadIcon } from './icons';

interface LawyerUpFeedProps {
    currentUser: (Client | Lawyer) & { role: string };
    posts: LawyerUpPost[];
    onAddPost: (post: LawyerUpPost) => void;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onDeletePost?: (postId: string) => void;
}

const LawyerUpFeed: React.FC<LawyerUpFeedProps> = ({ currentUser, posts, onAddPost, onLikePost, onAddComment, onDeletePost }) => {
    const [newPostText, setNewPostText] = useState('');
    const [newPostImageUrl, setNewPostImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isLawyer = currentUser.role === UserRole.LAWYER;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setNewPostImageUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newPostText.trim() || !isLawyer) return;

        const newPost: LawyerUpPost = {
            id: `p${Date.now()}`,
            lawyerId: currentUser.id,
            lawyerName: currentUser.name,
            lawyerProfilePicUrl: currentUser.profilePicUrl,
            text: newPostText,
            imageUrl: newPostImageUrl || undefined,
            timestamp: new Date(),
            likes: [],
            comments: []
        };

        onAddPost(newPost);
        setNewPostText('');
        setNewPostImageUrl('');
        setImagePreview(null);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">LawyerUp Community Feed</h2>
            
            {isLawyer && (
                <div className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg mb-8 shadow-md">
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                            className="w-full bg-light-primary dark:bg-dark-primary p-3 rounded-md border border-light-accent dark:border-dark-accent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                        />
                        <div className="flex items-center space-x-4 mt-2">
                            <input
                                type="text"
                                value={newPostImageUrl}
                                onChange={(e) => {
                                    setNewPostImageUrl(e.target.value);
                                    setImagePreview(e.target.value);
                                }}
                                placeholder="Image URL (optional)"
                                className="flex-1 bg-light-primary dark:bg-dark-primary p-2 rounded-md border border-light-accent dark:border-dark-accent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <label htmlFor="post-image-upload" className="cursor-pointer text-light-text-secondary dark:text-dark-text-secondary hover:text-indigo-500 p-2 rounded-md transition-colors">
                                <UploadIcon className="w-6 h-6"/>
                            </label>
                            <input id="post-image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </div>

                        {imagePreview && (
                            <div className="mt-3">
                                <img src={imagePreview} alt="Post preview" className="rounded-lg w-full max-h-60 object-cover" />
                            </div>
                        )}

                        <div className="text-right mt-3">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {posts.map(post => (
                    <LawyerUpPostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={currentUser}
                        onLikePost={onLikePost}
                        onAddComment={onAddComment}
                        onDeletePost={onDeletePost}
                    />
                ))}
            </div>
        </div>
    );
};

export default LawyerUpFeed;
