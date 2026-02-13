import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import labReportRoutes from './routes/labReportRoutes.js';
import medicalHistoryRoutes from './routes/medicalHistoryRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// Make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
