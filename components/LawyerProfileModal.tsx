import React from 'react';
import type { Lawyer, ClientRequest } from '../types';
import { XCircleIcon, StarIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LawyerProfileModalProps {
  lawyer: Lawyer;
  onClose: () => void;
  onSendRequest: (lawyer: Lawyer) => void;
  existingRequest?: ClientRequest | null;
}

const LawyerProfileModal: React.FC<LawyerProfileModalProps> = ({ lawyer, onClose, onSendRequest, existingRequest }) => {
  const successRate = lawyer.casesWon + lawyer.casesLost > 0 ? (lawyer.casesWon / (lawyer.casesWon + lawyer.casesLost)) * 100 : 0;
  const chartData = [
    { name: 'Cases Won', count: lawyer.casesWon },
    { name: 'Cases Lost', count: lawyer.casesLost },
  ];

  const reviewCount = lawyer.reviews?.length || 0;
  const avgRating = reviewCount > 0
      ? lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary z-10">
          <XCircleIcon className="w-8 h-8" />
        </button>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8">
            <img src={lawyer.profilePicUrl} alt={lawyer.name} className="w-32 h-32 rounded-full object-cover border-4 border-light-accent dark:border-dark-accent flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{lawyer.name}</h2>
              <p className="text-md text-light-text-secondary dark:text-dark-text-secondary">{lawyer.specialization.join(' | ')}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <StatBox label="Experience" value={`${lawyer.experienceYears} yrs`} />
                <StatBox label="Success Rate" value={`${successRate.toFixed(0)}%`} />
                <StatBox label="Avg. Fee per Case" value={`$${lawyer.avgPrice}`} />
                <StatBox label="Rating" value={reviewCount > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A'} subtext={reviewCount > 0 ? `(${reviewCount} reviews)` : ''} />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">About</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">{lawyer.bio}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">Case History</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} />
                    <YAxis tick={{ fill: 'var(--color-text-secondary)' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-accent)' }} />
                    <Bar dataKey="count" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.specialization.map(spec => (
                  <span key={spec} className="bg-indigo-600/20 text-indigo-800 dark:text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">{spec}</span>
                ))}
              </div>
            </div>
          </div>
          
           {reviewCount > 0 && (
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Client Reviews</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {lawyer.reviews.map((review, index) => (
                        <div key={index} className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {/* FIX: The StarIcon component's props type does not allow the `key` prop.
                                    Wrapping it in a div with the `key` resolves the TypeScript error. */}
                                    {[...Array(5)].map((_, i) => <div key={i}><StarIcon filled={i < review.rating} /></div>)}
                                </div>
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{new Date(review.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-2 text-sm italic">"{review.comment}"</p>
                            <p className="text-right text-sm font-semibold mt-1">- {review.clientName}</p>
                        </div>
                    ))}
                </div>
            </div>
           )}

        </div>

        <div className="sticky bottom-0 bg-light-secondary/80 dark:bg-dark-secondary/80 backdrop-blur-sm p-4 text-right border-t border-light-accent dark:border-dark-accent">
          <button
            onClick={() => onSendRequest(lawyer)}
            disabled={!!existingRequest}
            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {existingRequest ? `Request ${existingRequest.status}` : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
    <div className="bg-light-primary dark:bg-dark-primary p-2 rounded-lg">
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {subtext && <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{subtext}</p>}
    </div>
)

export default LawyerProfileModal;