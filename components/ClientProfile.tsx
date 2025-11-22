
import React, { useState } from 'react';
import type { Client } from '../types';
import { UploadIcon, UserIcon } from './icons';

interface ClientProfileProps {
    client: Client;
    onUpdateProfile: (updatedClient: Client) => void;
    onDeleteAccount: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ client, onUpdateProfile, onDeleteAccount }) => {
    const [formData, setFormData] = useState<Client>(client);
    const [feedback, setFeedback] = useState('');
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(client.profilePicUrl);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setProfilePicPreview(result);
                setFormData(prev => ({...prev, profilePicUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
        setFeedback('Profile updated successfully!');
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            onDeleteAccount();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Edit Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-light-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Username" name="username" value={formData.username} onChange={handleChange} />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                    <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                    <Input label="Citizen ID" name="citizenId" value={formData.citizenId} onChange={handleChange} />
                </div>
                <div>
                    <Input label="New Password (optional)" name="password" type="password" value={formData.password || ''} onChange={handleChange} placeholder="Leave blank to keep current password" />
                </div>
                <div className="mt-4">
                    <FileInput label="Profile Picture" name="profilePic" onChange={handleFileChange} previewUrl={profilePicPreview} />
                </div>
                {feedback && <p className="text-green-400 text-center font-semibold">{feedback}</p>}
                <div className="text-right">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>

            <div className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                    onClick={handleDeleteClick}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

const Input = ({ label, ...props }: {label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, [key: string]: any}) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</label>
        <input {...props} id={props.name} className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const FileInput = ({ label, name, onChange, previewUrl }: {label: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, previewUrl: string | null}) => (
    <div>
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
        <div className="flex items-center space-x-4">
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-light-accent dark:border-dark-accent" />
            ) : (
                <div className="w-20 h-20 rounded-full bg-light-primary dark:bg-dark-primary border-2 border-light-accent dark:border-dark-accent flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
            )}
            <label htmlFor={name} className="cursor-pointer bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <UploadIcon />
                <span>Upload Image</span>
            </label>
            <input id={name} name={name} type="file" className="sr-only" onChange={onChange} accept="image/*"/>
        </div>
    </div>
);

export default ClientProfile;
