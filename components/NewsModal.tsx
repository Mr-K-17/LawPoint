import React from 'react';
import type { NewsArticle } from '../types';
import { XCircleIcon } from './icons';

interface NewsModalProps {
    article: NewsArticle;
    onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ article, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 z-10">
                    <XCircleIcon className="w-8 h-8" />
                </button>
                <div className="relative h-64">
                     <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover rounded-t-xl" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                     <div className="absolute bottom-0 p-6">
                        <span className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">{article.category}</span>
                        <h2 className="text-2xl font-bold text-white mt-2">{article.headline}</h2>
                     </div>
                </div>
                <div className="p-6">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{article.summary}</p>
                    <div className="mt-6 text-right">
                        <a 
                            href={article.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Read Full Article
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsModal;