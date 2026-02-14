import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/axiosConfig';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messageCount, setMessageCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    // Initial fetch of unread count
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setMessageCount(data.messageCount || 0);
            setNotificationCount(data.notificationCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        let newSocket;
        if (user) {
            try {
                newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                    withCredentials: true,
                });
                setSocket(newSocket);

                newSocket.emit('join_room', user._id);

                newSocket.on('receive_message', (message) => {
                    // If the message is NOT from the user themselves, increment message count
                    if (message.sender !== user._id) {
                        setMessageCount(prev => prev + 1);
                    }
                });

                // Listen for new notifications (system)
                newSocket.on('new_notification', () => {
                    setNotificationCount(prev => prev + 1);
                });

            } catch (error) {
                console.error("Socket connection failed:", error);
            }

            // Cleanup
            return () => {
                if (newSocket) newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    // Value to expose
    const value = {
        socket,
        messageCount,
        notificationCount,
        setMessageCount,
        setNotificationCount,
        fetchUnreadCount
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
