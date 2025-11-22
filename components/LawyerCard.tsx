import React from 'react';
import type { Lawyer } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircleIcon, StarIcon } from './icons';

interface LawyerCardProps {
  lawyer: Lawyer;
  onViewProfile: (lawyer: Lawyer) => void;
  isRecommended?: boolean;
  recommendationRank?: number;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onViewProfile, isRecommended = false, recommendationRank }) => {
  const successRate = lawyer.casesWon + lawyer.casesLost > 0 ? (lawyer.casesWon / (lawyer.casesWon + lawyer.casesLost)) * 100 : 0;
  const data = [
    { name: 'Won', value: lawyer.casesWon },
    { name: 'Lost', value: lawyer.casesLost },
  ];
  const COLORS = ['#4ade80', '#f87171'];

  const reviewCount = lawyer.reviews?.length || 0;
  const avgRating = reviewCount > 0
      ? lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className={`relative bg-light-secondary dark:bg-dark-secondary rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-103 border-2 ${isRecommended ? 'border-yellow-400' : 'border-transparent'}`}>
      {isRecommended && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
          {recommendationRank ? `#${recommendationRank} AI Recommended` : 'AI Recommended'}
        </div>
      )}
      <div className="flex items-center space-x-4">
        <img src={lawyer.profilePicUrl} alt={lawyer.name} className="w-20 h-20 rounded-full object-cover border-2 border-light-accent dark:border-dark-accent" />
        <div className="flex-1">
          <h3 className="text-xl font-bold">{lawyer.name}</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{lawyer.specialization.slice(0, 2).join(', ')}</p>
           {reviewCount > 0 && (
            <div className="flex items-center space-x-1 mt-1 text-sm">
                <StarIcon filled className="w-5 h-5" />
                <span className="font-bold text-yellow-500">{avgRating.toFixed(1)}</span>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">({reviewCount} reviews)</span>
            </div>
           )}
        </div>
        <div className="w-20 h-20">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={35} innerRadius={20} fill="#8884d8" dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} cases`, name]}/>
            </PieChart>
          </ResponsiveContainer>
           <p className="text-center text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">{successRate.toFixed(0)}% Success</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">{lawyer.bio}</p>
      </div>
       <div className="mt-4 flex items-center text-green-500">
         <CheckCircleIcon className="w-5 h-5 mr-2"/>
         <span className="text-sm font-medium">Bar Council Verified</span>
       </div>
      <button
        onClick={() => onViewProfile(lawyer)}
        className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};

export default LawyerCard;