import React from 'react';
import type { ClientRequest } from '../types';
import { BriefcaseIcon, CheckCircleIcon, XCircleIcon, MessageIcon } from './icons';

interface ClientRequestsProps {
    requests: ClientRequest[];
    onCancelRequest: (request: ClientRequest) => void;
    onGoToChat: (chatId: string) => void;
}

const ClientRequests: React.FC<ClientRequestsProps> = ({ requests, onCancelRequest, onGoToChat }) => {

    const getStatusChip = (status: ClientRequest['status']) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-500 text-black">Pending</span>;
            case 'accepted':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-500 text-white">Accepted</span>;
            case 'rejected':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-500 text-white">Rejected</span>;
            case 'cancelled':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-500 text-white">Cancelled</span>;
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">My Sent Requests</h2>
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg shadow-md flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <img src={req.lawyer.profilePicUrl} alt={req.lawyer.name} className="w-16 h-16 rounded-full object-cover"/>
                                <div>
                                    <h3 className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary">{req.lawyer.name}</h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Case: <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{req.caseDetails.caseType}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {getStatusChip(req.status)}
                                {req.status === 'pending' && (
                                    <button onClick={() => onCancelRequest(req)} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-transform hover:scale-110" title="Cancel Request">
                                        <XCircleIcon className="w-6 h-6 text-white"/>
                                    </button>
                                )}
                                {req.status === 'accepted' && (
                                     <button onClick={() => onGoToChat(`chat-${req.id}`)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-transform hover:scale-110" title="Go to Chat">
                                        <MessageIcon className="w-6 h-6 text-white"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                    <BriefcaseIcon className="w-12 h-12 mx-auto text-light-text-secondary dark:text-dark-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">No Requests Sent</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Your requests to lawyers will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default ClientRequests;