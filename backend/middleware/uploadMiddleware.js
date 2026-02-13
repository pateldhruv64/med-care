import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

let cloudinaryConfigured = false;

const ensureCloudinaryConfig = () => {
    if (!cloudinaryConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        cloudinaryConfigured = true;
    }
};

// Multer config - store in memory for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (buffer, folder = 'hospital-profiles') => {
    try {
        ensureCloudinaryConfig();

        // Convert buffer to base64 data URI
        const base64 = buffer.toString('base64');
        const dataURI = `data:image/png;base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder,
            transformation: [
                { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            ],
            resource_type: 'image',
        });

        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export { upload, uploadToCloudinary, cloudinary };
