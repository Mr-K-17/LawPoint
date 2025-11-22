
import type { Client, Lawyer, Case, Chat, ClientRequest, LawyerUpPost } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper to handle fetch safely (returns null if server is unreachable)
const safeFetch = async (endpoint: string, options?: RequestInit) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options?.headers },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.warn(`API Call failed to ${endpoint}. Using local/dummy data fallback.`, error);
        return null;
    }
};

export const api = {
    fetchInitialData: async () => {
        return await safeFetch('/initial-data');
    },
    
    registerUser: async (user: Client | Lawyer, role: string) => {
        return await safeFetch('/register', { method: 'POST', body: JSON.stringify({ user, role }) });
    },

    deleteUser: async (id: string, role: string) => {
        return await safeFetch('/users', { method: 'DELETE', body: JSON.stringify({ id, role }) });
    },

    updateUser: async (user: Client | Lawyer, role: string) => {
        return await safeFetch('/update-user', { method: 'POST', body: JSON.stringify({ user, role }) });
    },

    createRequest: async (request: ClientRequest) => {
        return await safeFetch('/requests', { method: 'POST', body: JSON.stringify(request) });
    },

    updateRequestStatus: async (id: string, status: string) => {
        return await safeFetch(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    },

    createCase: async (newCase: Case) => {
        return await safeFetch('/cases', { method: 'POST', body: JSON.stringify(newCase) });
    },

    updateCase: async (id: string, data: Partial<Case>) => {
        return await safeFetch(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },

    createChat: async (chat: Chat) => {
        return await safeFetch('/chats', { method: 'POST', body: JSON.stringify(chat) });
    },

    sendMessage: async (chatId: string, message: any) => {
        return await safeFetch('/messages', { method: 'POST', body: JSON.stringify({ chatId, message }) });
    },

    createPost: async (post: LawyerUpPost) => {
        return await safeFetch('/posts', { method: 'POST', body: JSON.stringify(post) });
    },

    deletePost: async (id: string) => {
        return await safeFetch(`/posts/${id}`, { method: 'DELETE' });
    },

    updatePost: async (id: string, data: Partial<LawyerUpPost>) => {
        return await safeFetch(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
};
