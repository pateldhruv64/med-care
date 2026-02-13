import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare, Search, Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext'; // Import useSocket

const Chat = () => {
    const { user } = useAuth();
    const { socket, fetchUnreadCount } = useSocket(); // Use global socket and refetcher
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Removed local socket initialization effect

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get(`/chat/users?t=${new Date().getTime()}`);
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chat/${selectedUser._id}`);
                setMessages(data);
                scrollToBottom();

                // Mark messages as read when opening chat
                await api.put(`/chat/read/${selectedUser._id}`);
                fetchUnreadCount(); // Update global unread count

                // Also clear local unread status
                setUsers(prevUsers => prevUsers.map(u =>
                    u._id === selectedUser._id ? { ...u, hasUnread: false } : u
                ));

            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchMessages();
    }, [selectedUser]); // Removed fetchUnreadCount dependency to avoid loops

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            const senderId = message.sender?._id || message.sender;

            // Reorder users and set unread status
            setUsers(prevUsers => {
                const senderIndex = prevUsers.findIndex(u => u._id === senderId);
                if (senderIndex === -1) return prevUsers;

                const updatedUsers = [...prevUsers];
                const sender = { ...updatedUsers[senderIndex] };

                // If not currently chatting with this user, mark as unread
                if (!selectedUser || selectedUser._id !== senderId) {
                    sender.unreadCount = (sender.unreadCount || 0) + 1;
                    // sender.hasUnread = true; // Removed
                } else {
                    // If chatting, it's read
                    sender.unreadCount = 0;
                }

                updatedUsers.splice(senderIndex, 1);
                updatedUsers.unshift(sender);
                return updatedUsers;
            });

            // If chatting with this user, append message
            if (
                selectedUser &&
                (senderId === selectedUser._id || senderId === user._id)
            ) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // If the message is from the selected user, mark it as read immediately
                if (senderId === selectedUser._id) {
                    api.put(`/chat/read/${senderId}`).then(() => fetchUnreadCount());
                }
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => socket.off('receive_message', handleReceiveMessage);
    }, [socket, selectedUser, user._id]); // removed fetchUnreadCount to act safely

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const { data } = await api.post('/chat/send', {
                receiverId: selectedUser._id,
                message: newMessage,
            });

            setMessages((prev) => [...prev, data]);
            setNewMessage('');

            // Move receiver to top
            setUsers(prevUsers => {
                const receiverIndex = prevUsers.findIndex(u => u._id === selectedUser._id);
                if (receiverIndex === -1) return prevUsers;

                const updatedUsers = [...prevUsers];
                const receiver = updatedUsers[receiverIndex];
                updatedUsers.splice(receiverIndex, 1);
                updatedUsers.unshift(receiver);
                return updatedUsers;
            });

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleUserSelect = (u) => {
        setSelectedUser(u);
        // Clear unread status locally
        setUsers(prevUsers => prevUsers.map(user =>
            user._id === u._id ? { ...user, unreadCount: 0 } : user
        ));
    };

    const filteredUsers = users.filter(u =>
        (u.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6">
            {/* Users Sidebar */}
            <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="text-cyan-500" /> Messages
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500">Loading users...</div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => handleUserSelect(u)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50 ${selectedUser?._id === u._id ? 'bg-cyan-50 hover:bg-cyan-50' : ''
                                    }`}
                            >
                                <div className="relative">
                                    {u.profileImage ? (
                                        <img src={u.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                            {getInitials(u.firstName, u.lastName)}
                                        </div>
                                    )}
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.activityStatus === 'Online' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold truncate ${u.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                                            {u.firstName} {u.lastName}
                                        </h3>
                                        {u.unreadCount > 0 && (
                                            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                {u.unreadCount > 9 ? '9+' : u.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate ${u.unreadCount > 0 ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                                        {u.unreadCount > 0 ? 'New message' : u.role}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-500">No users found</div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center gap-3">
                                {selectedUser.profileImage ? (
                                    <img src={selectedUser.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                                        {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors">
                                    <Video size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {messages.map((msg, index) => {
                                const isMe = String(msg.sender?._id || msg.sender) === String(user._id);
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={index}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe
                                                ? 'bg-cyan-500 text-white rounded-br-none'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">Select a user to start chatting</h3>
                        <p className="text-sm">Choose from the list on the left to send a message.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
