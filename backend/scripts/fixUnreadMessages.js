import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from '../models/Message.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await Message.updateMany(
            { read: { $exists: false } }, // Or just {} to mark ALL as read
            { $set: { read: true } }
        );

        // Actually, let's just mark ALL existing messages as read to be safe and start fresh
        const result2 = await Message.updateMany(
            {},
            { $set: { read: true } }
        );

        console.log(`Updated ${result2.modifiedCount} messages to read: true`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

migrate();
