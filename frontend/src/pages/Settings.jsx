import { useState, useRef } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Camera, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', profile);
            updateUser(data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await api.put('/users/profile', { password: passwords.newPassword });
            toast.success('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const { data } = await api.post('/users/profile/upload-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateUser({ profileImage: data.profileImage });
            toast.success('Profile picture uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload picture');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-7 h-7 text-cyan-500" />
                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Tabs */}
                <div className="w-56 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-cyan-50 text-cyan-700 border-l-4 border-cyan-500'
                                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* User Info Card */}
                    <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                        <div className="flex items-center gap-3">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
                    >
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-6">Profile Settings</h2>

                                {/* Profile Picture Upload */}
                                <div className="mb-8">
                                    <label className="block text-sm text-slate-600 mb-3 font-medium">Profile Picture</label>
                                    <div className="flex items-start gap-6">
                                        {/* Avatar Preview */}
                                        <div className="relative group">
                                            {user?.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-slate-100 shadow-lg">
                                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110"
                                            >
                                                <Camera size={14} />
                                            </button>
                                        </div>

                                        {/* Drag & Drop Zone */}
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`flex-1 max-w-sm border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
                                                ? 'border-cyan-400 bg-cyan-50'
                                                : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {uploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
                                                    <p className="text-sm text-cyan-600 font-medium">Uploading...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {dragActive ? 'Drop image here' : 'Click or drag image to upload'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                                                </>
                                            )}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-100 mb-6" />

                                {/* Profile Form */}
                                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1 font-medium">First Name</label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1 font-medium">Last Name</label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1 font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1 font-medium">Phone</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Security Settings</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1 font-medium">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.currentPassword}
                                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1 font-medium">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1 font-medium">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Notification Preferences</h2>
                                <div className="space-y-4 max-w-lg">
                                    {[
                                        { label: 'Appointment Reminders', desc: 'Get notified about upcoming appointments' },
                                        { label: 'New Patient Alerts', desc: 'Notifications when new patients register' },
                                        { label: 'Billing Updates', desc: 'Updates on invoice and payment status' },
                                        { label: 'System Alerts', desc: 'Important system notifications' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{item.label}</p>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                    <p className="text-xs text-slate-400 mt-2">* Notification preferences are saved automatically</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
