import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@core/context/AuthContext';
import { customerApi } from '../services/customerApi';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        bio: user?.bio || '',
        avatar: user?.avatar || ''
    });

    useEffect(() => {
        const fetchLiveProfile = async () => {
            try {
                setIsFetching(true);
                const res = await customerApi.getProfile();
                const liveData = res.data?.result || res.data?.data || res.data;
                if (liveData) {
                    setFormData({
                        name: liveData.name || '',
                        phone: liveData.phone || '',
                        email: liveData.email || '',
                        bio: liveData.bio || '',
                        avatar: liveData.avatar || user?.avatar || ''
                    });
                    // Also update local auth state to keep everything in sync
                    login({ ...user, ...liveData });
                }
            } catch (err) {
                console.error("Failed to fetch live profile:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchLiveProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const compressImage = (file, maxWidth = 400, quality = 0.8) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxWidth) {
                            width = Math.round((width * maxWidth) / height);
                            height = maxWidth;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
                img.onerror = () => resolve(event.target.result);
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image size must be less than 10MB");
            return;
        }

        try {
            const compressedBase64 = await compressImage(file, 400, 0.8);
            setFormData((prev) => ({ ...prev, avatar: compressedBase64 }));
            toast.success("Photo selected & optimized! Click 'Save Changes' to update.");
        } catch (err) {
            toast.error("Failed to process image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await customerApi.updateProfile(formData);
            const updatedUser = response.data.result || response.data.data || response.data;

            // Update local auth state
            login({ ...user, ...updatedUser });

            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            {/* Hidden File Input for Profile Photo */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <div className="bg-white sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shadow-sm">
                <Link to="/profile" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </Link>
                <h1 className="text-lg font-black text-slate-800">Edit Profile</h1>
            </div>

            <div className="max-w-xl mx-auto p-5">

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative cursor-pointer group" onClick={handlePhotoClick}>
                        <div className="h-28 w-28 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt="Profile Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={48} className="text-slate-400" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handlePhotoClick}
                            className="absolute bottom-0 right-0 p-2 bg-[#123B8E] text-white rounded-full border-2 border-white shadow-sm hover:bg-[#1976D2] active:scale-95 transition-all"
                            aria-label="Upload Photo"
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handlePhotoClick}
                        className="mt-3 text-sm font-bold text-[#123B8E] hover:underline cursor-pointer"
                    >
                        Change Photo
                    </button>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                        {isFetching ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm font-medium text-slate-400">Loading your profile data...</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                                        <User size={20} className="text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-transparent w-full text-slate-800 font-bold outline-none placeholder:font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                                        <Phone size={20} className="text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="bg-transparent w-full text-slate-800 font-bold outline-none placeholder:font-medium"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                                        <Mail size={20} className="text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-transparent w-full text-slate-800 font-bold outline-none placeholder:font-medium"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-800 font-medium resize-none"
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isFetching}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-brand-200 hover:bg-[#0a701a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default EditProfilePage;

