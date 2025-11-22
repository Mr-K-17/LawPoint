
import React, { useState, useEffect, useMemo } from 'react';
import type { Client, Lawyer, User, Case, Chat, ChatMessage, ClientRequest, LawyerUpPost, Notification, NewsArticle, LawyerUpComment, Review, DraftFile } from './types';
import { UserRole } from './types';
import { DUMMY_CLIENTS, DUMMY_LAWYERS, DUMMY_CASES, DUMMY_CHATS, DUMMY_CLIENT_REQUESTS, DUMMY_LAWYERUP_POSTS } from './constants';
import AuthScreen from './components/AuthScreen';
import ClientDashboard from './components/ClientDashboard';
import LawyerDashboard from './components/LawyerDashboard';
import { api } from './services/api';

const App: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
    const [lawyers, setLawyers] = useState<Lawyer[]>(DUMMY_LAWYERS);
    const [cases, setCases] = useState<Case[]>(DUMMY_CASES);
    const [chats, setChats] = useState<Chat[]>(DUMMY_CHATS);
    const [clientRequests, setClientRequests] = useState<ClientRequest[]>(DUMMY_CLIENT_REQUESTS);
    const [lawyerUpPosts, setLawyerUpPosts] = useState<LawyerUpPost[]>(DUMMY_LAWYERUP_POSTS);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.NONE);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // --- Database Integration ---
    useEffect(() => {
        const loadData = async () => {
            const data = await api.fetchInitialData();
            if (data) {
                if(data.clients && data.clients.length) setClients(data.clients);
                if(data.lawyers && data.lawyers.length) setLawyers(data.lawyers);
                if(data.cases && data.cases.length) setCases(data.cases);
                if(data.chats && data.chats.length) setChats(data.chats);
                if(data.requests && data.requests.length) setClientRequests(data.requests);
                if(data.posts && data.posts.length) setLawyerUpPosts(data.posts);
            }
        };
        loadData();
    }, []);

    // Persist auth across refreshes
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('lp_currentUser');
            const savedRole = localStorage.getItem('lp_userRole');
            if (savedUser) setCurrentUser(JSON.parse(savedUser));
            if (savedRole) setUserRole(savedRole as UserRole);
        } catch (e) {
            console.warn('Failed to read auth from localStorage', e);
        }
    }, []);

    const currentUserWithRole = useMemo(() => {
        if (!currentUser || userRole === UserRole.NONE) return null;
        return { ...currentUser, role: userRole };
    }, [currentUser, userRole]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const addNotification = (userId: string, message: string) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            userId,
            message,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const handleLogin = (user: User, role: UserRole) => {
        setCurrentUser(user);
        setUserRole(role);
        try { localStorage.setItem('lp_currentUser', JSON.stringify(user)); localStorage.setItem('lp_userRole', role); } catch(e) {}
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setUserRole(UserRole.NONE);
        try { localStorage.removeItem('lp_currentUser'); localStorage.removeItem('lp_userRole'); } catch(e) {}
    };

    const handleDeleteAccount = () => {
        if (!currentUser) return;
        api.deleteUser(currentUser.id, userRole);
        if (userRole === UserRole.CLIENT) {
            setClients(prev => prev.filter(c => c.id !== currentUser.id));
        } else {
            setLawyers(prev => prev.filter(l => l.id !== currentUser.id));
        }
        handleLogout();
    };

    const handleRegister = (user: Client | Lawyer, role: UserRole) => {
        // Attempt server registration; fall back to local-only if server not reachable.
        (async () => {
            const resp = await api.registerUser(user as any, role as any);
            const ok = resp === null || resp?.success;
            if (role === UserRole.CLIENT) {
                setClients(prev => [...prev, user as Client]);
            } else {
                setLawyers(prev => [...prev, user as Lawyer]);
            }
            setCurrentUser(user);
            setUserRole(role);
            try { localStorage.setItem('lp_currentUser', JSON.stringify(user)); localStorage.setItem('lp_userRole', role); } catch(e) {}
            if (!ok) console.warn('Registration API did not succeed; running in offline/local-only mode');
        })();
    };

    const handleUpdateProfile = (updatedUser: User) => {
        const { id, name, profilePicUrl } = updatedUser;
        if (userRole === UserRole.CLIENT) {
            setClients(prev => prev.map(c => c.id === id ? updatedUser as Client : c));
        } else {
            setLawyers(prev => prev.map(l => l.id === id ? updatedUser as Lawyer : l));
        }
        setCurrentUser(updatedUser);
        (async () => {
            const resp = await api.updateUser(updatedUser as Client | Lawyer, userRole);
            if (resp && !resp.success) console.warn('Update user failed on server');
        })();
    };
    
    const handleSendRequest = (lawyer: Lawyer, client: Client) => {
        let caseDetails = client.currentCase;
        if (!caseDetails) {
            caseDetails = {
                caseType: 'General Inquiry',
                description: 'Client is interested in your services.',
                urgency: 'moderate',
                status: 'pending',
                notes: [], files: [], images: [], drafts: [], reviewSubmitted: false,
            };
        }
        const newRequest: ClientRequest = {
            id: `req-${Date.now()}`,
            client: { id: client.id, name: client.name, profilePicUrl: client.profilePicUrl },
            lawyer: { id: lawyer.id, name: lawyer.name, profilePicUrl: lawyer.profilePicUrl },
            caseDetails: caseDetails,
            status: 'pending',
        };
        setClientRequests(prev => [newRequest, ...prev]);
        addNotification(lawyer.id, `New request from ${client.name}.`);
        api.createRequest(newRequest);
    };

    const handleAcceptRequest = (request: ClientRequest) => {
        setClientRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'accepted' } : r));
        api.updateRequestStatus(request.id, 'accepted');

        const newCase: Case = {
            id: `case-${Date.now()}`, clientId: request.client.id, lawyerId: request.lawyer.id, ...request.caseDetails, status: 'active', reviewSubmitted: false, notes: [], files: [], images: [], drafts: [],
        };
        setCases(prev => [...prev, newCase]);
        api.createCase(newCase);

        const newChat: Chat = {
            id: `chat-${request.id}`, participantIds: [request.client.id, request.lawyer.id],
            participants: {
                [request.client.id]: { name: request.client.name, profilePicUrl: request.client.profilePicUrl },
                [request.lawyer.id]: { name: request.lawyer.name, profilePicUrl: request.lawyer.profilePicUrl }
            },
            messages: [],
        };
        setChats(prev => [...prev, newChat]);
        api.createChat(newChat);
        addNotification(request.client.id, `Request accepted by ${request.lawyer.name}.`);
    };

    const handleRejectRequest = (request: ClientRequest) => {
        setClientRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r));
        api.updateRequestStatus(request.id, 'rejected');
    };

    const handleCancelRequest = (request: ClientRequest) => {
        setClientRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'cancelled' } : r));
        api.updateRequestStatus(request.id, 'cancelled');
    };
    
    const handleSendMessage = (chatId: string, message: ChatMessage) => {
        setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat));
        api.sendMessage(chatId, message);
    };

    const handleDeleteMessage = (chatId: string, messageId: string, deleteForEveryone: boolean) => {
        // UI only for demo, backend impl depends on complexity
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = chat.messages.map(msg => {
                    if (msg.id === messageId) {
                        return deleteForEveryone ? { ...msg, deletedForEveryone: true } : { ...msg, deletedFor: [...(msg.deletedFor || []), currentUser!.id] };
                    }
                    return msg;
                });
                return { ...chat, messages: updatedMessages };
            }
            return chat;
        }));
    };

    // --- Post Handlers ---
    const handleAddLawyerUpPost = (post: LawyerUpPost) => {
        setLawyerUpPosts(prev => [post, ...prev]);
        api.createPost(post);
    };

    const handleDeletePost = (postId: string) => {
        setLawyerUpPosts(prev => prev.filter(p => p.id !== postId));
        api.deletePost(postId); // Calls DELETE /api/posts/:id
    }

    const handleLikePost = (postId: string) => {
        if (!currentUser) return;
        setLawyerUpPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const isLiked = post.likes.includes(currentUser.id);
                const newLikes = isLiked ? post.likes.filter(id => id !== currentUser.id) : [...post.likes, currentUser.id];
                api.updatePost(postId, { likes: newLikes });
                return { ...post, likes: newLikes };
            }
            return post;
        }));
    };

    const handleAddComment = (postId: string, text: string) => {
        if (!currentUserWithRole) return;
        const newComment: LawyerUpComment = {
            id: `c-${Date.now()}`, text, timestamp: new Date(),
            commenter: { id: currentUserWithRole.id, name: currentUserWithRole.name, profilePicUrl: currentUserWithRole.profilePicUrl, role: currentUserWithRole.role },
        };
        setLawyerUpPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const newComments = [...post.comments, newComment];
                api.updatePost(postId, { comments: newComments });
                return { ...post, comments: newComments };
            }
            return post;
        }));
    };

    // --- Review Handler ---
    const handleAddReview = (lawyerId: string, caseId: string, reviewData: { rating: number, comment: string }) => {
        if (!currentUser) return;
        const newReview: Review = { ...reviewData, clientName: currentUser.name, timestamp: new Date() };

        setLawyers(prev => prev.map(lawyer => {
            if (lawyer.id === lawyerId) {
                const updatedReviews = [...(lawyer.reviews || []), newReview];
                api.updateUser({ ...lawyer, reviews: updatedReviews }, 'lawyer');
                return { ...lawyer, reviews: updatedReviews };
            }
            return lawyer;
        }));

        setCases(prev => prev.map(c => c.id === caseId ? { ...c, reviewSubmitted: true } : c));
        api.updateCase(caseId, { reviewSubmitted: true });
        addNotification(lawyerId, `New review from ${currentUser.name}.`);
    };
    
    // --- Investigation Handlers ---
    const handleAddNoteToCase = (caseId: string, note: string) => {
        const timestampedNote = `${new Date().toLocaleString()}: ${note}`;
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                const updatedNotes = [timestampedNote, ...c.notes];
                api.updateCase(caseId, { notes: updatedNotes });
                return { ...c, notes: updatedNotes };
            }
            return c;
        }));
    };

    const handleAddFileToCase = (caseId: string, fileUrl: string) => {
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                const updatedFiles = [...c.files, fileUrl];
                api.updateCase(caseId, { files: updatedFiles });
                return { ...c, files: updatedFiles };
            }
            return c;
        }));
    };

    const handleAddImageToCase = (caseId: string, imageUrl: string) => {
        setCases(prev => prev.map(c => {
             if (c.id === caseId) {
                const updatedImages = [...c.images, imageUrl];
                api.updateCase(caseId, { images: updatedImages });
                return { ...c, images: updatedImages };
            }
            return c;
        }));
    };

    const handleCreateDraft = (caseId: string, title: string) => {
        const newDraft: DraftFile = { id: `draft-${Date.now()}`, title, content: '', lastModified: new Date() };
        setCases(prev => prev.map(c => {
             if (c.id === caseId) {
                const updatedDrafts = [...c.drafts, newDraft];
                api.updateCase(caseId, { drafts: updatedDrafts });
                return { ...c, drafts: updatedDrafts };
            }
            return c;
        }));
        return newDraft.id;
    };

    const handleUpdateDraft = (caseId: string, draftId: string, content: string) => {
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                const updatedDrafts = c.drafts.map(d => d.id === draftId ? { ...d, content, lastModified: new Date() } : d);
                api.updateCase(caseId, { drafts: updatedDrafts });
                return { ...c, drafts: updatedDrafts };
            }
            return c;
        }));
    };

    const handleDeleteDraft = (caseId: string, draftId: string) => {
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                const updatedDrafts = c.drafts.filter(d => d.id !== draftId);
                api.updateCase(caseId, { drafts: updatedDrafts });
                return { ...c, drafts: updatedDrafts };
            }
            return c;
        }));
    };

    // --- ROBUST REOPEN & COMPLETE LOGIC ---
    const handleUpdateCaseStatus = (caseId: string, status: Case['status'], result?: 'win' | 'loss' | 'settled' | 'draw' | 'other', closingNote?: string) => {
        const oldCase = cases.find(c => c.id === caseId);
        if (!oldCase) return;

        // Detect Reopen: Transitioning from a closed state to 'active'
        const isReopening = status === 'active' && ['completed', 'closed', 'dropped', 'inactive'].includes(oldCase.status);
        const isClosing = status === 'completed' && oldCase.status !== 'completed';

        // 1. Update Local State
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                return { 
                    ...c, 
                    status, 
                    result: isReopening ? undefined : result, // Clear locally
                    closingNote: isReopening ? undefined : closingNote // Clear locally
                };
            }
            return c;
        }));

        // 2. Update API - Send NULL for cleared fields so server $unset them
        api.updateCase(caseId, { 
            status, 
            result: isReopening ? null : result, 
            closingNote: isReopening ? null : closingNote 
        } as any); 

        // 3. Update Lawyer Stats
        if (currentUser && userRole === UserRole.LAWYER) {
            const lawyer = currentUser as Lawyer;
            const updatedLawyer = { ...lawyer };

            if (isClosing) {
                updatedLawyer.casesHandled = (updatedLawyer.casesHandled || 0) + 1;
                if (result === 'win') updatedLawyer.casesWon = (updatedLawyer.casesWon || 0) + 1;
                if (result === 'loss') updatedLawyer.casesLost = (updatedLawyer.casesLost || 0) + 1;
                if (result === 'settled') updatedLawyer.casesSettled = (updatedLawyer.casesSettled || 0) + 1;
            } else if (isReopening) {
                // Decrement Stats
                updatedLawyer.casesHandled = Math.max(0, (updatedLawyer.casesHandled || 0) - 1);
                if (oldCase.result === 'win') updatedLawyer.casesWon = Math.max(0, updatedLawyer.casesWon - 1);
                if (oldCase.result === 'loss') updatedLawyer.casesLost = Math.max(0, updatedLawyer.casesLost - 1);
                if (oldCase.result === 'settled') updatedLawyer.casesSettled = Math.max(0, (updatedLawyer.casesSettled || 0) - 1);
            }

            setLawyers(prev => prev.map(l => l.id === lawyer.id ? updatedLawyer : l));
            setCurrentUser(updatedLawyer);
            api.updateUser(updatedLawyer, 'lawyer');
        }
    };

    const handleCreateNewCase = (title: string, clientId: string) => {
        if (!currentUser || userRole !== UserRole.LAWYER) return;
        const newCase: Case = {
            id: `case-${Date.now()}`, clientId: clientId, lawyerId: currentUser.id, caseType: title, description: 'Manually created case file.', urgency: 'none', status: 'active', notes: [], files: [], images: [], drafts: [], reviewSubmitted: false,
        };
        setCases(prev => [...prev, newCase]);
        api.createCase(newCase);
        addNotification(currentUser.id, `Created case "${title}".`);
    };

    const handleMarkNotificationsAsRead = (userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
    };

    // Rendering logic
    const renderContent = () => {
        if (!currentUserWithRole) {
            return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} clients={clients} lawyers={lawyers} theme={theme} toggleTheme={toggleTheme} />;
        }
        const userNotifications = notifications.filter(n => n.userId === currentUser.id);

        if (userRole === UserRole.CLIENT) {
            return (
                <ClientDashboard 
                    client={currentUser as Client} 
                    onLogout={handleLogout}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteAccount={handleDeleteAccount}
                    allLawyers={lawyers}
                    clientCases={cases.filter(c => c.clientId === currentUser.id)}
                    clientChats={chats.filter(c => c.participantIds.includes(currentUser.id))}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onSendRequest={(lawyer) => handleSendRequest(lawyer, currentUser as Client)}
                    notifications={userNotifications}
                    onMarkNotificationsAsRead={() => handleMarkNotificationsAsRead(currentUser.id)}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    newsArticles={news}
                    setNewsArticles={setNews}
                    clientRequests={clientRequests.filter(r => r.client.id === currentUser.id)}
                    onCancelRequest={handleCancelRequest}
                    lawyerUpPosts={lawyerUpPosts}
                    currentUser={currentUserWithRole}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onDeletePost={handleDeletePost}
                    onAddReview={handleAddReview}
                />
            );
        }

        if (userRole === UserRole.LAWYER) {
            return (
                <LawyerDashboard
                    lawyer={currentUser as Lawyer}
                    onLogout={handleLogout}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteAccount={handleDeleteAccount}
                    clientRequests={clientRequests.filter(r => r.lawyer.id === currentUser.id)}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                    allCases={cases.filter(c => c.lawyerId === currentUser.id)}
                    onUpdateCaseStatus={handleUpdateCaseStatus}
                    lawyerChats={chats.filter(c => c.participantIds.includes(currentUser.id))}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    lawyerUpPosts={lawyerUpPosts}
                    onAddLawyerUpPost={handleAddLawyerUpPost}
                    onDeletePost={handleDeletePost}
                    notifications={userNotifications}
                    onMarkNotificationsAsRead={() => handleMarkNotificationsAsRead(currentUser.id)}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    newsArticles={news}
                    setNewsArticles={setNews}
                    allClients={clients}
                    currentUser={currentUserWithRole}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onAddNoteToCase={handleAddNoteToCase}
                    onAddFileToCase={handleAddFileToCase}
                    onAddImageToCase={handleAddImageToCase}
                    onCreateDraft={handleCreateDraft}
                    onUpdateDraft={handleUpdateDraft}
                    onDeleteDraft={handleDeleteDraft}
                    handleCreateNewCase={handleCreateNewCase}
                />
            );
        }
        return <div>Error</div>;
    };

    return (
        <div className="min-h-screen font-sans">
            {renderContent()}
        </div>
    );
};

export default App;
