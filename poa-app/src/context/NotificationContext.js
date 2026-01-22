import React, { createContext, useState, useContext, useCallback, useRef, useEffect, useMemo } from 'react';

const NotificationContext = createContext();

export const useNotificationContext = () => {
    return useContext(NotificationContext);
};

// Alias for cleaner imports
export const useNotification = useNotificationContext;

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Track all active timers for cleanup
    const timersRef = useRef(new Map());

    // Cleanup all timers on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    // Function to add a notification and return the notification id
    const addNotification = useCallback((message, status) => {
        console.log("notif", message, status);
        const id = Date.now();

        setNotifications(prev => [...prev, { id, message, status }]);

        return id; // Return the id of the notification so it can be referenced later
    }, []);

    // Function to update the status of an existing notification (e.g., from loading to success/error)
    const updateNotification = useCallback((id, newMessage = null, newStatus) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id
                    ? { ...notif, status: newStatus, message: newMessage || notif.message }
                    : notif
            )
        );

        // Automatically remove success notifications after 6 seconds
        if (newStatus === 'success') {
            // Clear any existing timer for this notification
            if (timersRef.current.has(id)) {
                clearTimeout(timersRef.current.get(id));
            }

            // Set new timer and track it
            const timer = setTimeout(() => {
                setNotifications(prev => prev.filter(notif => notif.id !== id));
                timersRef.current.delete(id);
            }, 6000);

            timersRef.current.set(id, timer);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        console.log("notif remove", id);

        // Clear timer if it exists for this notification
        if (timersRef.current.has(id)) {
            clearTimeout(timersRef.current.get(id));
            timersRef.current.delete(id);
        }

        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        notifications,
        addNotification,
        updateNotification,
        removeNotification,
    }), [notifications, addNotification, updateNotification, removeNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
