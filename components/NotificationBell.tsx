import React, { useState, useEffect, useRef } from 'react';
import type { Notification } from '../types';
import { BellIcon } from './icons';

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            onMarkAsRead();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="relative p-2 text-light-text-secondary dark:text-dark-text-secondary rounded-full hover:bg-light-secondary dark:hover:bg-dark-secondary">
                <BellIcon className="w-7 h-7" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-light-primary dark:border-dark-primary">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-2xl border border-light-accent dark:border-dark-accent z-50 animate-fade-in-down">
                    <div className="p-3 font-bold border-b border-light-accent dark:border-dark-accent">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="p-3 border-b border-light-accent/50 dark:border-dark-accent/50 hover:bg-light-primary dark:hover:bg-dark-primary">
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{timeSince(notif.timestamp)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;