
import React, { useState, useRef, useEffect } from 'react';
import type { Case, DraftFile, Client } from '../types';
import { BriefcaseIcon, UploadIcon, PencilIcon, TrashIcon } from './icons';

interface InvestigationDetailsProps {
    cases: Case[];
    allClients: Client[];
    onAddNote: (caseId: string, note: string) => void;
    onAddFile: (caseId: string, fileUrl: string) => void;
    onAddImage: (caseId: string, imageUrl: string) => void;
    onCreateDraft: (caseId: string, title: string) => string;
    onUpdateDraft: (caseId: string, draftId: string, content: string) => void;
    onDeleteDraft: (caseId: string, draftId: string) => void;
    handleCreateNewCase: (title: string, clientId: string) => void;
}

const InvestigationDetails: React.FC<InvestigationDetailsProps> = ({ cases, allClients, onAddNote, onAddFile, onAddImage, onCreateDraft, onUpdateDraft, onDeleteDraft, handleCreateNewCase }) => {
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases.length > 0 ? cases[0].id : null);
    const [newNote, setNewNote] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    const [editingDraft, setEditingDraft] = useState<DraftFile | null>(null);
    const [draftContent, setDraftContent] = useState('');
    const [newDraftTitle, setNewDraftTitle] = useState('');

    const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
    const [newCaseTitle, setNewCaseTitle] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');

    const selectedCase = cases.find(c => c.id === selectedCaseId);

    useEffect(() => { setEditingDraft(null); }, [selectedCaseId]);

    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCaseId && newNote.trim()) {
            onAddNote(selectedCaseId, newNote);
            setNewNote('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
        const file = e.target.files?.[0];
        if (file && selectedCaseId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                isImage ? onAddImage(selectedCaseId, result) : onAddFile(selectedCaseId, file.name);
            };
            isImage ? reader.readAsDataURL(file) : onAddFile(selectedCaseId, file.name);
        }
    };
    
    const handleCreateDraftClick = () => {
        if (selectedCaseId && newDraftTitle.trim()) {
            const newDraftId = onCreateDraft(selectedCaseId, newDraftTitle);
            setNewDraftTitle('');
            // In real sync, we'd wait for update, but here we assume instant local update in App
        }
    };

    const handleEditDraftClick = (draft: DraftFile) => {
        setEditingDraft(draft);
        setDraftContent(draft.content);
    };

    const handleSaveDraft = () => {
        if (selectedCaseId && editingDraft) {
            onUpdateDraft(selectedCaseId, editingDraft.id, draftContent);
            setEditingDraft(null);
        }
    };

    const handleCreateCaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCaseTitle.trim() && selectedClientId) {
            handleCreateNewCase(newCaseTitle, selectedClientId);
            setShowCreateCaseModal(false);
            setNewCaseTitle('');
            setSelectedClientId('');
        }
    };

    if (editingDraft && selectedCase) {
        return (
            <div className="flex flex-col h-[calc(100vh-12rem)] bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center border-b border-light-accent dark:border-dark-accent pb-3 mb-4">
                    <h2 className="text-2xl font-bold">{editingDraft.title}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setEditingDraft(null)} className="px-4 py-2 rounded-lg text-light-text-secondary hover:bg-light-accent">Back</button>
                        <button onClick={handleSaveDraft} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700">Save Draft</button>
                    </div>
                </div>
                <textarea value={draftContent} onChange={e => setDraftContent(e.target.value)} className="flex-1 w-full bg-light-primary dark:bg-dark-primary p-4 rounded-md border border-light-accent focus:ring-2 focus:ring-indigo-500 font-mono" />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6 relative">
            {showCreateCaseModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center rounded-lg">
                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg w-96 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Create New Case File</h3>
                        <form onSubmit={handleCreateCaseSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Case Title</label>
                                <input type="text" value={newCaseTitle} onChange={(e) => setNewCaseTitle(e.target.value)} className="w-full p-2 bg-light-primary dark:bg-dark-primary border border-light-accent rounded-md" required />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Client</label>
                                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full p-2 bg-light-primary dark:bg-dark-primary border border-light-accent rounded-md" required>
                                    <option value="" disabled>Select a client</option>
                                    {allClients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateCaseModal(false)} className="px-4 py-2 text-light-text-secondary">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="w-1/3 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-light-accent pb-2">
                    <h3 className="text-xl font-bold">Case Files</h3>
                    <button onClick={() => setShowCreateCaseModal(true)} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">+ New File</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    {cases.map(c => (
                        <button key={c.id} onClick={() => setSelectedCaseId(c.id)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCaseId === c.id ? 'bg-indigo-600 text-white' : 'hover:bg-light-primary dark:hover:bg-dark-primary'}`}>
                            <p className="font-semibold">{c.caseType}</p>
                            <p className="text-sm opacity-80">ID: {c.id.slice(-6)}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-2/3 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-6 flex flex-col">
                {selectedCase ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 border-b border-light-accent pb-3">{selectedCase.caseType}</h2>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                            <div>
                                <h4 className="font-bold text-lg mb-2">Drafts</h4>
                                <div className="flex gap-2 mb-4">
                                    <input value={newDraftTitle} onChange={e => setNewDraftTitle(e.target.value)} placeholder="New draft title..." className="flex-1 bg-light-primary dark:bg-dark-primary p-2 rounded-md border border-light-accent"/>
                                    <button onClick={handleCreateDraftClick} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Create</button>
                                </div>
                                <div className="space-y-2">
                                    {selectedCase.drafts?.map((draft) => (
                                        <div key={draft.id} className="bg-light-primary dark:bg-dark-primary p-2 rounded-md flex justify-between items-center">
                                            <span>{draft.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditDraftClick(draft)} className="text-indigo-500"><PencilIcon /></button>
                                                <button onClick={() => onDeleteDraft(selectedCaseId!, draft.id)} className="text-red-500"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Notes and Files sections remain similar */}
                            <div>
                                <h4 className="font-bold text-lg mb-2">Notes</h4>
                                <form onSubmit={handleNoteSubmit} className="flex gap-2 mb-4">
                                    <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note..." className="flex-1 bg-light-primary dark:bg-dark-primary p-2 rounded-md border border-light-accent" rows={2}/>
                                    <button type="submit" className="self-start bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Add</button>
                                </form>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedCase.notes.map((note, i) => <div key={i} className="bg-light-primary dark:bg-dark-primary p-2 rounded-md text-sm"><p>{note}</p></div>)}
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-lg mb-2">Photos</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {selectedCase.images?.map((img, i) => ( <img key={i} src={img} className="w-full h-20 object-cover rounded-md"/> ))}
                                    </div>
                                    <button onClick={() => imageInputRef.current?.click()} className="w-full p-2 border-2 border-dashed border-light-accent rounded-lg text-sm"><UploadIcon className="inline w-4 h-4"/> Upload</button>
                                    <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">Files</h4>
                                    <div className="space-y-2 mb-2">
                                        {selectedCase.files.map((file, i) => ( <div key={i} className="bg-light-primary dark:bg-dark-primary p-2 rounded-md text-sm"><span>{file}</span></div> ))}
                                    </div>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-2 border-2 border-dashed border-light-accent rounded-lg text-sm"><UploadIcon className="inline w-4 h-4"/> Upload</button>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <BriefcaseIcon className="w-16 h-16 text-light-text-secondary mb-4" />
                        <h3 className="text-xl font-semibold">Select a Case</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestigationDetails;
