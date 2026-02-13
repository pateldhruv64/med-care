import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import logActivity from '../utils/logActivity.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // console.log(`Login attempt for: ${email}`);
    if (user) {
        // console.log('User found');
        const match = await user.matchPassword(password);
        // console.log(`Password Match: ${match}`);
        if (match) {
            const token = generateToken(res, user._id, user.role);

            await logActivity({
                userId: user._id,
                action: 'LOGIN',
                entity: 'User',
                entityId: user._id,
                details: `User ${user.firstName} ${user.lastName} logged in`,
                ipAddress: req.ip,
            });

            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                token,
            });
            return;
        }
    } else {
        // console.log('User not found');
    }

    res.status(401);
    throw new Error('Invalid email or password');
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, gender, phone, dateOfBirth, adminSecret, doctorDepartment } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Check for admin secret if role is not Patient
    if (role && role !== 'Patient') {
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            res.status(401);
            throw new Error('Invalid Admin Secret Key');
        }
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: role || 'Patient',
        gender,
        phone,
        dateOfBirth,
        doctorDepartment: role === 'Doctor' ? doctorDepartment : undefined,
    });

    if (user) {
        const token = generateToken(res, user._id, user.role);

        await logActivity({
            userId: user._id,
            action: 'CREATE',
            entity: 'User',
            entityId: user._id,
            details: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
            ipAddress: req.ip,
        });

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
    if (req.cookies.jwt) {
        try {
            const jwt = await import('jsonwebtoken');
            const decoded = jwt.default.verify(req.cookies.jwt, process.env.JWT_SECRET);
            await logActivity({
                userId: decoded.userId,
                action: 'LOGOUT',
                entity: 'User',
                entityId: decoded.userId,
                details: 'User logged out',
                ipAddress: req.ip,
            });
        } catch (e) { /* ignore */ }
    }

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            profileImage: user.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    await logActivity({
        userId: req.user._id,
        action: 'UPDATE',
        entity: 'Profile',
        entityId: req.user._id,
        details: `Profile updated by ${updatedUser.firstName} ${updatedUser.lastName}`,
        ipAddress: req.ip,
    });

    res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
    });
};

export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile };
