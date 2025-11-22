import React, { useState } from 'react';
import type { Client, CaseUrgency, Case } from '../types';
import { UserRole } from '../types';
import { UploadIcon, UserIcon } from './icons';


interface ClientSignupFormProps {
    onRegister: (client: Client, role: UserRole) => void;
}

const ClientSignupForm: React.FC<ClientSignupFormProps> = ({ onRegister }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        dob: '',
        citizenId: '',
        password: '',
        confirmPassword: '',
        needsLawyer: false,
        caseType: '',
        urgency: 'none' as CaseUrgency,
        description: '',
        profilePicUrl: ''
    });
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const newClient: Client = {
            id: `c${Date.now()}`,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            citizenId: formData.citizenId,
            password: formData.password,
            profilePicUrl: formData.profilePicUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.name.replace(/\s/g, "")}`,
            currentCase: formData.needsLawyer ? {
                caseType: formData.caseType,
                description: formData.description,
                urgency: formData.urgency,
                status: 'pending',
                notes: [],
                files: [],
                images: [],
                drafts: [],
                reviewSubmitted: false,
            } : undefined
        };
        
        onRegister(newClient, UserRole.CLIENT);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Personal Information</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="Username" name="username" value={formData.username} onChange={handleChange} required />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                    <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                    <Input label="Citizen ID" name="citizenId" value={formData.citizenId} onChange={handleChange} required />
                </div>
                 <div className="mt-4">
                    <FileInput label="Profile Picture" name="profilePic" onChange={handleFileChange} previewUrl={profilePicPreview} />
                </div>
            </fieldset>

            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Do you need a lawyer now?</legend>
                <div className="flex items-center space-x-4 p-2">
                    <label htmlFor="needsLawyer" className="text-light-text-secondary dark:text-dark-text-secondary">I need a lawyer for an emergency.</label>
                    <input type="checkbox" id="needsLawyer" name="needsLawyer" checked={formData.needsLawyer} onChange={handleChange} className="h-5 w-5 rounded bg-light-primary dark:bg-dark-primary border-light-accent dark:border-dark-accent text-indigo-600 focus:ring-indigo-500"/>
                </div>
                {formData.needsLawyer && (
                    <div className="mt-4 space-y-4">
                        <Select label="Case Urgency" name="urgency" value={formData.urgency} onChange={handleChange}>
                            <option value="none" disabled>Select Urgency</option>
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                            <option value="immediate">Immediate</option>
                        </Select>
                        <Input label="Case Type (e.g., Criminal Defense, Divorce)" name="caseType" value={formData.caseType} onChange={handleChange} />
                        <TextArea label="Case Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
                    </div>
                )}
            </fieldset>
            
            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Account Security</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                    <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
            </fieldset>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                Create Account
            </button>
        </form>
    );
};

const Input = ({ label, ...props }: {label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<any>) => void, [key: string]: any}) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</label>
        <input {...props} id={props.name} className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const Select = ({ label, children, ...props }: {label: string, name: string, value: string, onChange: (e: React.ChangeEvent<any>) => void, children?: React.ReactNode}) => (
     <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</label>
        <select {...props} id={props.name} className="mt-1 block w-full bg-light-primary dark:bg-dark-primary border border-light-accent dark:border-dark-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            {children}
        </select>
    </div>
);

const TextArea = ({ label, ...props }: {label: string, name: string, value: string, onChange: (e: React.ChangeEvent<any>) => void, [key: string]: any}) => (
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

export default ClientSignupForm;