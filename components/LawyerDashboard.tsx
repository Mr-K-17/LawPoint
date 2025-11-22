
import React, { useState, useEffect, useMemo } from 'react';
import type { Lawyer, ChatMessage, ClientRequest, Case, Chat, LawyerUpPost, Notification, NewsArticle, Client, DraftFile } from '../types';
import { BriefcaseIcon, MessageIcon, NewspaperIcon, RobotIcon, UserIcon, LogoutIcon, CheckCircleIcon, XCircleIcon, UsersIcon, JusticeScaleIcon, SunIcon, MoonIcon, FolderIcon, ArchiveIcon } from './icons';
import { getAINews, getLawBotResponse } from '../services/geminiService';
import LawyerUpFeed from './LawyerUpFeed';
import LawyerProfile from './LawyerProfile';
import LawyerCases from './LawyerCases';
import ChatComponent from './Chat';
import NotificationBell from './NotificationBell';
import NewsCard from './NewsCard';
import NewsModal from './NewsModal';
import Spinner from './Spinner';
import InvestigationDetails from './InvestigationDetails';
import LawyerCaseHistory from './LawyerCaseHistory';

interface LawyerDashboardProps {
    lawyer: Lawyer;
    onLogout: () => void;
    onUpdateProfile: (updatedLawyer: Lawyer) => void;
    onDeleteAccount: () => void;
    clientRequests: ClientRequest[];
    onAcceptRequest: (request: ClientRequest) => void;
    onRejectRequest: (request: ClientRequest) => void;
    allCases: Case[]; 
    onUpdateCaseStatus: (caseId: string, status: Case['status'], result?: 'win' | 'loss' | 'settled' | 'draw' | 'other', closingNote?: string) => void;
    lawyerChats: Chat[];
    onSendMessage: (chatId: string, message: ChatMessage) => void;
    onDeleteMessage?: (chatId: string, messageId: string, deleteForEveryone: boolean) => void;
    lawyerUpPosts: LawyerUpPost[];
    onAddLawyerUpPost: (post: LawyerUpPost) => void;
    onDeletePost?: (postId: string) => void;
    notifications: Notification[];
    onMarkNotificationsAsRead: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    newsArticles: NewsArticle[];
    setNewsArticles: (articles: NewsArticle[]) => void;
    allClients: Client[];
    currentUser: (Client | Lawyer) & { role: string };
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, text: string) => void;
    onAddNoteToCase: (caseId: string, note: string) => void;
    onAddFileToCase: (caseId: string, fileUrl: string) => void;
    onAddImageToCase: (caseId: string, imageUrl: string) => void;
    onCreateDraft: (caseId: string, title: string) => string;
    onUpdateDraft: (caseId: string, draftId: string, content: string) => void;
    onDeleteDraft: (caseId: string, draftId: string) => void;
    handleCreateNewCase: (title: string, clientId: string) => void;
}

const LawyerDashboard: React.FC<LawyerDashboardProps> = (props) => {
    const { 
        lawyer, onLogout, onUpdateProfile, onDeleteAccount, clientRequests, onAcceptRequest, onRejectRequest, 
        allCases, onUpdateCaseStatus, lawyerChats, onSendMessage, onDeleteMessage, lawyerUpPosts, onAddLawyerUpPost, onDeletePost,
        notifications, onMarkNotificationsAsRead, theme, toggleTheme, newsArticles, 
        setNewsArticles, allClients, currentUser, onLikePost, onAddComment,
        onAddNoteToCase, onAddFileToCase, onAddImageToCase,
        onCreateDraft, onUpdateDraft, onDeleteDraft, handleCreateNewCase
    } = props;
    
    const [activeTab, setActiveTab] = useState('requests');
    
    const activeCases = useMemo(() => allCases.filter(c => c.status === 'active' || c.status === 'on-hold'), [allCases]);
    const closedCases = useMemo(() => allCases.filter(c => c.status === 'closed' || c.status === 'completed' || c.status === 'dropped' || c.status === 'inactive'), [allCases]);
    
    // News state
    const [isLoadingNews, setIsLoadingNews] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
    const [newsCategory, setNewsCategory] = useState('All');

    // LawBot state
    const [lawBotHistory, setLawBotHistory] = useState<{ role: 'user' | 'model', parts: {text: string}[] }[]>([]);
    const [lawBotMessages, setLawBotMessages] = useState<ChatMessage[]>([]);
    const [botInput, setBotInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    
    useEffect(() => {
        if(activeTab === 'news' && newsArticles.length === 0) {
            setIsLoadingNews(true);
            getAINews().then(setNewsArticles).finally(() => setIsLoadingNews(false));
        }
    }, [activeTab, newsArticles, setNewsArticles]);
    
    const newsCategories = useMemo(() => ['All', ...Array.from(new Set(newsArticles.map(a => a.category)))], [newsArticles]);
    const filteredNews = useMemo(() => newsCategory === 'All' ? newsArticles : newsArticles.filter(a => a.category === newsCategory), [newsArticles, newsCategory]);

    const handleSendBotMessage = async () => {
        if (!botInput.trim() || isBotTyping) return;
        const userMessage: ChatMessage = { id: Date.now().toString(), senderId: lawyer.id, receiverId: 'LAWBOT', text: botInput, timestamp: new Date() };
        setLawBotMessages(prev => [...prev, userMessage]);
        
        const currentInput = botInput;
        setBotInput('');
        setIsBotTyping(true);
        
        const newHistory = [...lawBotHistory, { role: 'user' as const, parts: [{text: currentInput}] }];
        const botResponseText = await getLawBotResponse(newHistory);
        
        const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), senderId: 'LAWBOT', receiverId: lawyer.id, text: botResponseText, timestamp: new Date() };
        setLawBotMessages(prev => [...prev, botMessage]);
        setLawBotHistory([...newHistory, {role: 'model' as const, parts: [{text: botResponseText}]}]);
        setIsBotTyping(false);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'requests':
                const pendingRequests = clientRequests.filter(r => r.status === 'pending');
                return (
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">Client Requests</h2>
                        {pendingRequests.length > 0 ? (
                            <div className="space-y-4">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg flex justify-between items-start shadow-md">
                                        <div className="flex items-start space-x-4">
                                            <img src={req.client.profilePicUrl} alt={req.client.name} className="w-16 h-16 rounded-full object-cover"/>
                                            <div>
                                                <h3 className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary">{req.client.name}</h3>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Case Type: <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{req.caseDetails.caseType}</span></p>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Urgency: <span className="font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">{req.caseDetails.urgency}</span></p>
                                                <p className="mt-2 text-light-text-primary dark:text-dark-text-primary">{req.caseDetails.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => onAcceptRequest(req)} className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-transform hover:scale-110" title="Accept"><CheckCircleIcon className="w-6 h-6 text-white"/></button>
                                            <button onClick={() => onRejectRequest(req)} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-transform hover:scale-110" title="Reject"><XCircleIcon className="w-6 h-6 text-white"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                                <BriefcaseIcon className="w-12 h-12 mx-auto text-light-text-secondary dark:text-dark-text-secondary mb-4" />
                                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">All Caught Up!</h3>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary">You have no pending client requests.</p>
                            </div>
                        )}
                    </div>
                );
            case 'cases': return <LawyerCases cases={activeCases} allClients={allClients} onUpdateCaseStatus={onUpdateCaseStatus} />;
            case 'history': return <LawyerCaseHistory cases={closedCases} allClients={allClients} onUpdateCaseStatus={onUpdateCaseStatus} />;
            case 'investigation': return <InvestigationDetails cases={activeCases} allClients={allClients} onAddNote={onAddNoteToCase} onAddFile={onAddFileToCase} onAddImage={onAddImageToCase} onCreateDraft={onCreateDraft} onUpdateDraft={onUpdateDraft} onDeleteDraft={onDeleteDraft} handleCreateNewCase={handleCreateNewCase} />;
            case 'messages': return <ChatComponent currentUser={lawyer} chats={lawyerChats} onSendMessage={onSendMessage} onDeleteMessage={onDeleteMessage} allUsers={[...allClients, lawyer]} />;
            case 'news': return (
                <div>
                     <h2 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">Legal News & Updates</h2>
                     <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
                        {newsCategories.map(cat => (
                            <button key={cat} onClick={() => setNewsCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${newsCategory === cat ? 'bg-indigo-600 text-white' : 'bg-light-secondary dark:bg-dark-secondary text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent dark:hover:bg-dark-accent'}`}>{cat}</button>
                        ))}
                     </div>
                     {isLoadingNews ? <div className="flex justify-center p-8"><Spinner /></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.map((article, index) => <NewsCard key={index} article={article} onClick={() => setSelectedNews(article)} />)}
                        </div>
                     )}
                </div>
            );
            case 'lawyerup': return <LawyerUpFeed currentUser={currentUser} posts={lawyerUpPosts} onAddPost={onAddLawyerUpPost} onLikePost={onLikePost} onAddComment={onAddComment} onDeletePost={onDeletePost} />;
            case 'lawbot': return (
                 <div className="flex flex-col h-[calc(100vh-12rem)] bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold p-4 border-b border-light-accent dark:border-dark-accent text-light-text-primary dark:text-dark-text-primary">LawBot Assistant</h2>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {lawBotMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === 'LAWBOT' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-lg p-3 rounded-lg ${msg.senderId === 'LAWBOT' ? 'bg-light-accent dark:bg-dark-accent text-light-text-primary dark:text-dark-text-primary' : 'bg-indigo-600 text-white'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isBotTyping && <div className="flex justify-start"><div className="bg-light-accent dark:bg-dark-accent p-3 rounded-lg text-light-text-primary dark:text-dark-text-primary"><em>LawBot is typing...</em></div></div>}
                    </div>
                    <div className="p-4 border-t border-light-accent dark:border-dark-accent flex">
                        <input 
                            type="text"
                            value={botInput}
                            onChange={e => setBotInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendBotMessage()}
                            placeholder="Ask me anything about law..."
                            className="flex-1 bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-l-lg p-2 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button onClick={handleSendBotMessage} className="bg-indigo-600 px-4 rounded-r-lg hover:bg-indigo-700 text-white">Send</button>
                    </div>
                </div>
            );
            case 'profile': return <LawyerProfile lawyer={lawyer} onUpdateProfile={onUpdateProfile} onDeleteAccount={onDeleteAccount} />;
            default: return null;
        }
    };
    
    const NavItem = ({ icon, label, tabName, badgeCount }: {icon: React.ReactNode, label: string, tabName: string, badgeCount?: number}) => (
        <button onClick={() => setActiveTab(tabName)} className={`relative flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-secondary dark:hover:bg-dark-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}`}>
            {icon}
            <span className="font-semibold">{label}</span>
            {badgeCount && badgeCount > 0 && (
                <span className="absolute left-6 top-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-light-secondary dark:border-dark-primary">
                    {badgeCount}
                </span>
            )}
        </button>
    )

    return (
        <div className="flex h-screen bg-light-primary dark:bg-dark-primary/80 dark:backdrop-blur-sm">
            {selectedNews && <NewsModal article={selectedNews} onClose={() => setSelectedNews(null)} />}
            <aside className="w-64 bg-light-secondary/80 dark:bg-dark-primary/80 backdrop-blur-md border-r border-light-accent/50 dark:border-dark-accent/50 p-4 flex flex-col">
                <div className="flex items-center space-x-2 mb-8">
                    <JusticeScaleIcon className="h-8 w-8 text-indigo-600"/>
                    <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Law Point</h1>
                </div>
                <nav className="space-y-2 flex-1">
                    <NavItem icon={<BriefcaseIcon/>} label="Client Requests" tabName="requests" badgeCount={clientRequests.filter(r => r.status === 'pending').length} />
                    <NavItem icon={<BriefcaseIcon/>} label="Active Cases" tabName="cases" />
                    <NavItem icon={<ArchiveIcon/>} label="Case History" tabName="history" />
                    <NavItem icon={<FolderIcon/>} label="Investigation" tabName="investigation" />
                    <NavItem icon={<MessageIcon/>} label="Messages" tabName="messages" />
                    <NavItem icon={<NewspaperIcon/>} label="News" tabName="news" />
                    <NavItem icon={<UsersIcon/>} label="LawyerUp" tabName="lawyerup" />
                    <NavItem icon={<RobotIcon/>} label="LawBot" tabName="lawbot" />
                    <NavItem icon={<UserIcon/>} label="Edit Profile" tabName="profile" />
                </nav>
                 <div>
                     <button onClick={onLogout} className="flex items-center space-x-3 p-3 rounded-lg w-full text-left text-light-text-secondary dark:text-dark-text-secondary hover:bg-red-500 hover:text-white transition-colors">
                        <LogoutIcon />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                 <header className="flex justify-between items-start mb-6">
                    <div>
                         <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">Welcome, {lawyer.name}!</h2>
                         <p className="text-light-text-secondary dark:text-dark-text-secondary">Here's your professional dashboard.</p>
                    </div>
                     <div className="flex items-center space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary text-light-text-secondary dark:text-dark-text-secondary hover:text-yellow-500 dark:hover:text-yellow-300">
                            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                        </button>
                        <NotificationBell 
                            notifications={notifications} 
                            onMarkAsRead={onMarkNotificationsAsRead} 
                        />
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default LawyerDashboard;
