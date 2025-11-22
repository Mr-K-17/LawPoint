
import React, { useState } from 'react';
import type { Case, Client } from '../types';
import { BriefcaseIcon } from './icons';

interface LawyerCasesProps {
    cases: Case[];
    allClients: Client[];
    onUpdateCaseStatus?: (caseId: string, status: Case['status'], result?: 'win' | 'loss' | 'settled' | 'draw' | 'other', closingNote?: string) => void;
}

const LawyerCases: React.FC<LawyerCasesProps> = ({ cases, allClients, onUpdateCaseStatus }) => {
    const [showResultModal, setShowResultModal] = useState<{ visible: boolean, caseId: string | null }>({ visible: false, caseId: null });
    const [closingNote, setClosingNote] = useState('');
    
    const getClientName = (clientId: string) => {
        return allClients.find(c => c.id === clientId)?.name || 'Unknown Client';
    };

    const handleStatusChange = (caseId: string, newStatus: Case['status']) => {
        if (newStatus === 'completed') {
            setShowResultModal({ visible: true, caseId });
            setClosingNote('');
        } else {
            onUpdateCaseStatus?.(caseId, newStatus);
        }
    };

    const handleResultSubmit = (result: 'win' | 'loss' | 'settled' | 'draw' | 'other') => {
        if (showResultModal.caseId) {
            if (!closingNote.trim()) {
                alert("Please provide a closing note before completing the case.");
                return;
            }
            onUpdateCaseStatus?.(showResultModal.caseId, 'completed', result, closingNote);
            setShowResultModal({ visible: false, caseId: null });
            setClosingNote('');
        }
    };

    return (
        <div>
             {/* Result Modal */}
             {showResultModal.visible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Complete Case</h3>
                        <p className="mb-2 text-gray-600 dark:text-gray-300">Select the result of the case:</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={() => handleResultSubmit('win')} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors">Win</button>
                            <button onClick={() => handleResultSubmit('loss')} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors">Loss</button>
                            <button onClick={() => handleResultSubmit('settled')} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">Settled</button>
                            <button onClick={() => handleResultSubmit('draw')} className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium transition-colors">Draw</button>
                            <button onClick={() => handleResultSubmit('other')} className="col-span-2 p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors">Other/Dropped</button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Closing Note (Required)</label>
                            <textarea 
                                value={closingNote}
                                onChange={(e) => setClosingNote(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                placeholder="Summarize the outcome..."
                            />
                        </div>

                        <button onClick={() => setShowResultModal({ visible: false, caseId: null })} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-bold mb-6">Active Cases</h2>
            {cases.length > 0 ? (
                <div className="space-y-4">
                    {cases.map(caseItem => (
                        <div key={caseItem.id} className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-md">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl">{caseItem.caseType}</h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Client: {getClientName(caseItem.clientId)}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                     <span className={`px-3 py-1 text-sm font-semibold rounded-full 
                                        ${caseItem.status === 'active' ? 'bg-green-500 text-white' : 
                                          caseItem.status === 'on-hold' ? 'bg-yellow-500 text-black' : 
                                          caseItem.status === 'inactive' ? 'bg-gray-400 text-white' :
                                          caseItem.status === 'dropped' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                                        {caseItem.status.toUpperCase()}
                                    </span>
                                    {onUpdateCaseStatus && (
                                        <select 
                                            value={caseItem.status} 
                                            onChange={(e) => handleStatusChange(caseItem.id, e.target.value as Case['status'])}
                                            className="text-sm bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="on-hold">On Hold</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="completed">Completed</option>
                                            <option value="dropped">Dropped</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <p className="mt-4">{caseItem.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                    <BriefcaseIcon className="w-12 h-12 mx-auto text-light-text-secondary dark:text-dark-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold">No Active Cases</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Accepted client cases will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default LawyerCases;
