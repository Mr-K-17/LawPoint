import React, { useState } from 'react';
import { StarIcon, XCircleIcon } from './icons';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reviewData: { rating: number, comment: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating > 0 && comment.trim()) {
            onSubmit({ rating, comment });
        } else {
            alert("Please provide a rating and a comment.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-up">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center mb-4">Leave a Review</h2>
                    
                    <div className="flex justify-center items-center space-x-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                            >
                                <StarIcon
                                    className="w-8 h-8 cursor-pointer transition-colors"
                                    filled={(hoverRating || rating) >= star}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with the lawyer..."
                        className="w-full h-32 p-3 bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
