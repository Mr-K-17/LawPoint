
import React, { useState } from 'react';
import type { Lawyer } from '../types';
import { UserRole } from '../types';
import { UploadIcon, UserIcon } from './icons';

interface LawyerSignupFormProps {
    onRegister: (lawyer: Lawyer, role: UserRole) => void;
}

const LawyerSignupForm: React.FC<LawyerSignupFormProps> = ({ onRegister }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', dob: '', gender: 'Male',
        barCouncilId: '', qualification: '', university: '', gradYear: new Date().getFullYear(),
        specialization: '', experienceYears: 0, location: '', avgPrice: 100,
        casesHandled: 0, casesWon: 0, casesLost: 0, casesSettled: 0,
        bio: '', achievements: '', awards: '', profilePicUrl: '',
        password: '', confirmPassword: '', citizenId: ''
    });
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [error, setError] = useState('');

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
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const newLawyer: Lawyer = {
            id: `l${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            password: formData.password,
            gender: formData.gender as 'Male' | 'Female' | 'Other',
            barCouncilId: formData.barCouncilId,
            qualification: formData.qualification,
            university: formData.university,
            gradYear: formData.gradYear,
            specialization: formData.specialization.split(',').map(s => s.trim()),
            experienceYears: formData.experienceYears,
            location: formData.location,
            avgPrice: formData.avgPrice,
            bio: formData.bio,
            achievements: formData.achievements.split('\n').filter(a => a.trim()),
            awards: formData.awards.split('\n').filter(a => a.trim()),
            profilePicUrl: formData.profilePicUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.name.replace(/\s/g, "")}`,
            casesHandled: formData.casesHandled,
            casesWon: formData.casesWon,
            casesLost: formData.casesLost,
            casesSettled: formData.casesSettled,
            domainStrengths: formData.specialization.split(',').map(s => s.trim()),
            citizenId: formData.citizenId,
            reviews: [],
        };
        
        onRegister(newLawyer, UserRole.LAWYER);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Personal Information</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                    <Input label="Citizen ID" name="citizenId" value={formData.citizenId} onChange={handleChange} required />
                    <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </Select>
                </div>
            </fieldset>

             <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Professional Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Bar Council ID" name="barCouncilId" value={formData.barCouncilId} onChange={handleChange} required />
                    <Input label="Qualification (e.g., LL.M.)" name="qualification" value={formData.qualification} onChange={handleChange} required />
                    <Input label="University" name="university" value={formData.university} onChange={handleChange} required />
                    <Input label="Graduation Year" name="gradYear" type="number" value={formData.gradYear} onChange={handleChange} required />
                </div>
            </fieldset>

             <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Practice Information</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Specializations (comma-separated)" name="specialization" value={formData.specialization} onChange={handleChange} required placeholder="e.g., Corporate Law, Criminal Law"/>
                    <Input label="Years of Experience" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} required />
                    <Input label="Location (City, Country)" name="location" value={formData.location} onChange={handleChange} required />
                    <Input label="Average Fee per Case ($)" name="avgPrice" type="number" value={formData.avgPrice} onChange={handleChange} required />
                </div>
            </fieldset>
            
            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Case History Stats</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input label="Total Cases Handled" name="casesHandled" type="number" value={formData.casesHandled} onChange={handleChange} required />
                    <Input label="Cases Won" name="casesWon" type="number" value={formData.casesWon} onChange={handleChange} required />
                    <Input label="Cases Lost" name="casesLost" type="number" value={formData.casesLost} onChange={handleChange} required />
                    <Input label="Cases Settled/Draw" name="casesSettled" type="number" value={formData.casesSettled} onChange={handleChange} required />
                </div>
            </fieldset>

            <fieldset className="p-4 border border-light-accent dark:border-dark-accent rounded-lg">
                <legend className="px-2 font-semibold text-lg">Profile Customization</legend>
                <div className="space-y-4">
                    <FileInput label="Profile Picture" name="profilePic" onChange={handleFileChange} previewUrl={profilePicPreview} />
                    <TextArea label="Bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell clients a bit about yourself..." />
                    <TextArea label="Achievements (one per line)" name="achievements" value={formData.achievements} onChange={handleChange} rows={3} />
                    <TextArea label="Awards (one per line)" name="awards" value={formData.awards} onChange={handleChange} rows={3} />
                </div>
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
                Create Profile
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

export default LawyerSignupForm;
