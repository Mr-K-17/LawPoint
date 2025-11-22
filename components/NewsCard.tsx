import React from 'react';
import type { NewsArticle } from '../types';

interface NewsCardProps {
    article: NewsArticle;
    onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
        >
            <div className="relative h-48">
                <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{article.category}</span>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold line-clamp-2 text-light-text-primary dark:text-dark-text-primary group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{article.headline}</h3>
            </div>
        </div>
    );
};

export default NewsCard;