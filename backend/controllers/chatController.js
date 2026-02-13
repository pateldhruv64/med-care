import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/chat/send
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message,
        });

        // Socket.io functionality will be handled in the frontend context via events
        // OR we can use the req.io instance if we attached it in server.js middleware
        // req.io.to(receiverId).emit('receive_message', newMessage);

        if (req.io) {
            req.io.to(receiverId.toString()).emit('receive_message', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation status between logged in user and another user
// @route   GET /api/chat/:userId
const getMessages = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get list of users to chat with
// @route   GET /api/chat/users
const getUsersForChat = async (req, res) => {
    try {
        let filter = { _id: { $ne: req.user._id } };

        if (req.user.role === 'Patient') {
            filter.role = 'Doctor';
        }

        const users = await User.find(filter)
            .select('firstName lastName role profileImage email activityStatus');

        // Fetch last message for each user to sort by recent activity
        const usersWithLastMessage = await Promise.all(users.map(async (user) => {
            const lastMessage = await Message.findOne({
                $or: [
                    { sender: req.user._id, receiver: user._id },
                    { sender: user._id, receiver: req.user._id }
                ]
            }).sort({ createdAt: -1 });

            // Using epoch 0 for no messages ensures they appear at bottom
            const lastMessageTime = lastMessage ? new Date(lastMessage.createdAt).getTime() : 0;

            // Count unread messages from this user to me
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                receiver: req.user._id,
                read: false
            });

            return {
                ...user.toObject(),
                lastMessageTime,
                unreadCount
            };
        }));

        // Sort: Most recent message first (descending), then alphabetical
        usersWithLastMessage.sort((a, b) => {
            if (b.lastMessageTime !== a.lastMessageTime) {
                return b.lastMessageTime - a.lastMessageTime;
            }
            return a.firstName.localeCompare(b.firstName);
        });

        res.json(usersWithLastMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark messages from a specific user as read
// @route   PUT /api/chat/read/:senderId
const markMessagesRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        await Message.updateMany(
            { sender: senderId, receiver: receiverId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { sendMessage, getMessages, getUsersForChat, markMessagesRead };
