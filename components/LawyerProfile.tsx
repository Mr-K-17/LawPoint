
import React, { useState } from 'react';
import type { Lawyer } from '../types';
import { UploadIcon, UserIcon } from './icons';

interface LawyerProfileProps {
    lawyer: Lawyer;
    onUpdateProfile: (updatedLawyer: Lawyer) => void;
    onDeleteAccount: () => void;
}

const LawyerProfile: React.FC<LawyerProfileProps> = ({ lawyer, onUpdateProfile, onDeleteAccount }) => {
    const [formData, setFormData] = useState({
        ...lawyer,
        specialization: lawyer.specialization.join(', '),
        achievements: lawyer.achievements.join('\n'),
        awards: lawyer.awards.join('\n'),
        casesSettled: lawyer.casesSettled || 0
    });
    const [feedback, setFeedback] = useState('');
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(lawyer.profilePicUrl);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
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
        const updatedLawyer: Lawyer = {
            ...formData,
            specialization: formData.specialization.split(',').map(s => s.trim()),
            achievements: formData.achievements.split('\n').filter(a => a.trim()),
            awards: formData.awards.split('\n').filter(a => a.trim()),
        };
        onUpdateProfile(updatedLawyer);
        setFeedback('Profile updated successfully!');
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            onDeleteAccount();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                <h2 className="text-3xl font-bold mb-6 text-center">Edit Your Professional Profile</h2>
                <fieldset className="p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-md">
                    <legend className="px-2 font-semibold text-xl">Personal Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
                        <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                    </div>
                </fieldset>

                <fieldset className="p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-md">
                    <legend className="px-2 font-semibold text-xl">Practice Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input label="Specializations (comma-separated)" name="specialization" value={formData.specialization} onChange={handleChange} required placeholder="e.g., Corporate Law, Criminal Law"/>
                        <Input label="Years of Experience" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} required />
                        <Input label="Location (City, Country)" name="location" value={formData.location} onChange={handleChange} required />
                        <Input label="Average Fee per Case ($)" name="avgPrice" type="number" value={formData.avgPrice} onChange={handleChange} required />
                        <Input label="Total Cases Handled" name="casesHandled" type="number" value={formData.casesHandled} onChange={handleChange} required />
                        <Input label="Cases Settled/Draw" name="casesSettled" type="number" value={formData.casesSettled} onChange={handleChange} required />
                    </div>
                </fieldset>

                <fieldset className="p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-md">
                    <legend className="px-2 font-semibold text-xl">Profile Customization</legend>
                    <div className="space-y-4 mt-4">
                        <TextArea label="Bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell clients a bit about yourself..." />
                        <TextArea label="Achievements (one per line)" name="achievements" value={formData.achievements} onChange={handleChange} rows={3} />
                        <TextArea label="Awards (one per line)" name="awards" value={formData.awards} onChange={handleChange} rows={3} />
                        <FileInput label="Profile Picture" name="profilePic" onChange={handleFileChange} previewUrl={profilePicPreview} />
                    </div>
                </fieldset>
                {feedback && <p className="text-green-400 text-center font-semibold">{feedback}</p>}
                <div className="text-center">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                        Save All Changes
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

const TextArea = ({ label, ...props }: {label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, [key: string]: any}) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</label>
        <textarea {...props} id={props.name} className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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

export default LawyerProfile;
