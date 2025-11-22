
import React, { useState } from 'react';
import type { Client, Lawyer } from '../types';
import { UserRole, AuthMode } from '../types';
import { BriefcaseIcon, UserIcon, JusticeScaleIcon, SunIcon, MoonIcon } from './icons';
import ClientSignupForm from './ClientSignupForm';
import LawyerSignupForm from './LawyerSignupForm';


interface AuthScreenProps {
    onLogin: (user: Client | Lawyer, role: UserRole) => void;
    onRegister: (user: Client | Lawyer, role: UserRole) => void;
    clients: Client[];
    lawyers: Lawyer[];
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, clients, lawyers, theme, toggleTheme }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.NONE);
    const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
    const [error, setError] = useState<string>('');
    
    // Login form state
    const [loginId, setLoginId] = useState(''); // username for client, barCouncilId for lawyer
    const [loginPassword, setLoginPassword] = useState('');

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setAuthMode(AuthMode.LOGIN);
        setError('');
        setLoginId('');
        setLoginPassword('');
    };
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (selectedRole === UserRole.CLIENT) {
            const client = clients.find(c => c.username === loginId && c.password === loginPassword);
            if(client) {
                onLogin(client, UserRole.CLIENT);
            } else {
                setError('Invalid username or password.');
            }
        } else if (selectedRole === UserRole.LAWYER) {
            const lawyer = lawyers.find(l => l.barCouncilId === loginId && l.password === loginPassword);
            if (lawyer) {
                onLogin(lawyer, UserRole.LAWYER);
            } else {
                setError('Invalid Bar Council ID or password.');
            }
        }
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label htmlFor="loginId" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    {selectedRole === UserRole.CLIENT ? 'Username' : 'Bar Council ID'}
                </label>
                <input
                    type="text"
                    id="loginId"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                Sign In
            </button>
        </form>
    );

    const renderSignupForm = () => {
        if (selectedRole === UserRole.CLIENT) {
            return <ClientSignupForm onRegister={onRegister} />;
        }
        if (selectedRole === UserRole.LAWYER) {
            return <LawyerSignupForm onRegister={onRegister} />;
        }
        return null;
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-start md:justify-center bg-transparent p-4 md:py-8 relative">
            <div className="absolute top-4 right-4">
                 <button onClick={toggleTheme} className="p-2 rounded-full bg-light-secondary/50 dark:bg-dark-secondary/50 text-light-text-secondary dark:text-dark-text-secondary hover:text-yellow-500 dark:hover:text-yellow-300">
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
            </div>
            <div className="max-w-4xl w-full mx-auto"> {/* Widened container */}
                 <div className="text-center mb-8">
                    <JusticeScaleIcon className="h-16 w-16 mx-auto text-light-text-secondary dark:text-dark-text-secondary"/>
                    <h1 className="text-4xl font-bold mt-2 text-light-text-primary dark:text-dark-text-primary">Law Point</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Connecting Justice with Expertise</p>
                </div>

                {selectedRole === UserRole.NONE ? (
                     <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center mb-6 text-light-text-primary dark:text-dark-text-primary">Who are you?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => handleRoleSelect(UserRole.CLIENT)} className="group flex flex-col items-center justify-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg border-2 border-transparent hover:border-indigo-500 transition-all duration-300 shadow-lg">
                                <UserIcon className="h-20 w-20 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-indigo-500 transition-colors"/>
                                <span className="mt-4 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Client</span>
                            </button>
                            <button onClick={() => handleRoleSelect(UserRole.LAWYER)} className="group flex flex-col items-center justify-center p-10 bg-light-secondary dark:bg-dark-secondary rounded-lg border-2 border-transparent hover:border-indigo-500 transition-all duration-300 shadow-lg">
                                <BriefcaseIcon className="h-20 w-20 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-indigo-500 transition-colors"/>
                                <span className="mt-4 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Lawyer</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-10 rounded-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            {selectedRole === UserRole.CLIENT ? 'Client Portal' : 'Lawyer Portal'}
                           </h2>
                           <button onClick={() => setSelectedRole(UserRole.NONE)} className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary">Change Role</button>
                        </div>
                       
                        <div className="flex border-b border-light-accent dark:border-dark-accent mb-6">
                            <button onClick={() => setAuthMode(AuthMode.LOGIN)} className={`py-2 px-4 text-lg font-medium transition-colors ${authMode === AuthMode.LOGIN ? 'border-b-2 border-indigo-500 text-light-text-primary dark:text-dark-text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                                Sign In
                            </button>
                            <button onClick={() => setAuthMode(AuthMode.SIGNUP)} className={`py-2 px-4 text-lg font-medium transition-colors ${authMode === AuthMode.SIGNUP ? 'border-b-2 border-indigo-500 text-light-text-primary dark:text-dark-text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                                Register
                            </button>
                        </div>

                        {authMode === AuthMode.LOGIN ? renderLoginForm() : renderSignupForm()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;
