import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('users');

        // List indexes to confirm
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        try {
            await collection.dropIndex('username_1');
            console.log('Index "username_1" dropped successfully');
        } catch (error) {
            console.log('Error dropping index (might not exist):', error.message);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
