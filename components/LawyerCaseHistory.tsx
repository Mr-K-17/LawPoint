
import React, { useState } from 'react';
import type { Case, Client } from '../types';
import { ArchiveIcon, BriefcaseIcon, PencilIcon } from './icons';

interface LawyerCaseHistoryProps {
    cases: Case[];
    allClients: Client[];
    onUpdateCaseStatus: (caseId: string, status: Case['status'], result?: 'win' | 'loss' | 'settled' | 'draw' | 'other', closingNote?: string) => void;
}

const LawyerCaseHistory: React.FC<LawyerCaseHistoryProps> = ({ cases, allClients, onUpdateCaseStatus }) => {
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [editNote, setEditNote] = useState('');
    const [editResult, setEditResult] = useState<'win' | 'loss' | 'settled' | 'draw' | 'other' | undefined>(undefined);

    const getClientName = (clientId: string) => allClients.find(c => c.id === clientId)?.name || 'Unknown Client';

    const getResultBadge = (result?: string) => {
        if (!result) return null;
        const colors = {
            win: 'green', loss: 'red', settled: 'blue', draw: 'yellow', other: 'gray'
        };
        const color = colors[result as keyof typeof colors] || 'gray';
        return <span className={`px-2 py-1 text-xs font-bold rounded bg-${color}-500/20 text-${color}-600 dark:text-${color}-400 border border-${color}-500/50 capitalize`}>{result}</span>;
    }

    const handleReopen = (caseItem: Case) => {
        if (window.confirm("Are you sure you want to reopen this case? It will move to Active Cases and statistics (Wins/Losses) will be reversed.")) {
            onUpdateCaseStatus(caseItem.id, 'active');
        }
    };

    const handleEditClick = (caseItem: Case) => {
        setEditingCase(caseItem);
        setEditNote(caseItem.closingNote || '');
        setEditResult(caseItem.result);
    };

    const handleSaveEdit = () => {
        if (editingCase) {
            onUpdateCaseStatus(editingCase.id, editingCase.status, editResult, editNote);
            setEditingCase(null);
        }
    };

    return (
        <div>
            {editingCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Case</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Result</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['win', 'loss', 'settled', 'draw'].map(r => (
                                    <button key={r} onClick={() => setEditResult(r as any)} className={`p-2 rounded text-sm capitalize ${editResult === r ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-black'}`}>{r}</button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Closing Note</label>
                            <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" rows={4} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingCase(null)} className="px-4 py-2 text-sm">Cancel</button>
                            <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Save</button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-bold mb-6">Case History</h2>
            {cases.length > 0 ? (
                <div className="space-y-4">
                    {cases.map(caseItem => (
                        <div key={caseItem.id} className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-md border-l-4 border-gray-500">
                             <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-bold text-xl">{caseItem.caseType}</h3>
                                        {getResultBadge(caseItem.result)}
                                    </div>
                                    <p className="text-light-text-secondary mt-1">Client: {getClientName(caseItem.clientId)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-500 text-white">{caseItem.status.toUpperCase()}</span>
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={() => handleEditClick(caseItem)} className="text-xs flex items-center gap-1 text-indigo-500 hover:underline"><PencilIcon className="w-3 h-3"/> Edit</button>
                                        <button onClick={() => handleReopen(caseItem)} className="text-xs flex items-center gap-1 text-green-600 border border-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"><BriefcaseIcon className="w-3 h-3"/> Reopen Case</button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-semibold text-sm text-light-text-secondary">Description:</p>
                                <p className="text-sm">{caseItem.description}</p>
                            </div>
                            {caseItem.closingNote && (
                                <div className="mt-4 pt-3 border-t border-light-accent">
                                    <p className="font-semibold text-sm text-light-text-secondary">Closing Note:</p>
                                    <p className="italic text-sm">"{caseItem.closingNote}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                    <ArchiveIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold">No Closed Cases</h3>
                </div>
            )}
        </div>
    );
};

export default LawyerCaseHistory;
