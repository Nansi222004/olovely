import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, MapPin, Package, CreditCard, Wallet, ChevronRight,
    LogOut, ShieldCheck, Heart, HelpCircle, Info, Edit2, ChevronLeft, Bell
} from 'lucide-react';
import { useAuth } from '@core/context/AuthContext';
import { useSettings } from '@core/context/SettingsContext';
import { customerApi } from '../services/customerApi';
import { toast } from 'sonner';
import {
    describePushSupport,
    ensureFcmTokenRegistered,
    startForegroundPushListener
} from '@core/firebase/pushClient';
import LottieLoader from '@/shared/components/ui/LottieLoader';

const TEST_PUSH_STATUS_POLL_INTERVAL_MS = 1500;
const TEST_PUSH_STATUS_MAX_ATTEMPTS = 20;

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, role, logout, isLoading: isAuthLoading } = useAuth();
    const { settings } = useSettings();
    const appName = settings?.appName || 'App';
    const [isTestingPush, setIsTestingPush] = React.useState(false);
    const [isPageLoading, setIsPageLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const formatIndiaPhone = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (raw.startsWith('+91')) return raw.replace(/^\+91[\s-]*/, '');
        if (raw.startsWith('91') && raw.length >= 12) return raw.replace(/^91[\s-]*/, '');
        return raw;
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForTestPushResult = async (orderId) => {
        for (let attempt = 0; attempt < TEST_PUSH_STATUS_MAX_ATTEMPTS; attempt += 1) {
            const statusRes = await customerApi.getTestPushNotificationStatus(orderId);
            const result = statusRes?.data?.result || {};
            const status = String(result.status || '').trim().toLowerCase();

            if (status === 'sent' || status === 'failed') {
                return result;
            }

            if (attempt < TEST_PUSH_STATUS_MAX_ATTEMPTS - 1) {
                await wait(TEST_PUSH_STATUS_POLL_INTERVAL_MS);
            }
        }
        return null;
    };

    const handleTestPush = async () => {
        if (isTestingPush) return;
        setIsTestingPush(true);
        try {
            const support = describePushSupport();
            if (!support.supported) {
                throw new Error(support.message || 'Push notifications are not supported on this device/browser setup.');
            }

            await ensureFcmTokenRegistered({ role, platform: 'web' });
            await startForegroundPushListener();
            const res = await customerApi.testPushNotification();
            const orderId = res?.data?.result?.orderId || '';
            if (!orderId) {
                toast.success('Test push triggered');
                return;
            }

            const statusResult = await waitForTestPushResult(orderId);
            if (!statusResult) {
                toast.message(`Test push processing (${orderId})`, {
                    description: 'Notification delivery is taking longer than expected.',
                });
                return;
            }

            if (statusResult.status === 'sent') {
                toast.success(`Test push sent (${orderId})`, {
                    description: 'MongoDB status is marked as sent.',
                });
                return;
            }

            toast.error(`Test push failed (${orderId})`, {
                description: String(statusResult.failureReason || 'Notification delivery failed.'),
            });
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unknown error';
            toast.error('Failed to trigger test push', {
                description: message,
            });
        } finally {
            setIsTestingPush(false);
        }
    };

    if (isAuthLoading || isPageLoading) {
        return <LottieLoader fullScreen />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-8 font-sans">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm px-4 pt-3.5 pb-3.5 border-b border-[#E2E8F0] mb-4 flex items-center shadow-2xs">
                <h1 className="text-lg font-bold text-[#172033] tracking-tight">My Profile</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-1 relative z-20 space-y-4">

                {/* User Identity Card */}
                <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#EFF6FF] text-[#123B8E] flex items-center justify-center border border-blue-100 overflow-hidden shadow-2xs shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#172033]">{user?.name || 'Customer'}</h2>
                            <p className="text-[#64748B] text-xs font-semibold flex items-center gap-1 mt-0.5">
                                <span className="bg-[#EFF6FF] text-[#123B8E] px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase">India</span> +91 {formatIndiaPhone(user?.phone)}
                            </p>
                        </div>
                    </div>
                    <Link to="/profile/edit" className="p-2.5 rounded-xl bg-[#F8FAFC] text-[#123B8E] hover:bg-[#EFF6FF] border border-[#E2E8F0] transition-colors">
                        <Edit2 size={16} />
                    </Link>
                </div>

                {/* Menu Sections */}
                <div className="space-y-4">
                    {/* Account Section */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-2xs">
                        <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Personal Account</p>
                        </div>
                        <div className="divide-y divide-[#E2E8F0]">
                            <MenuItem
                                icon={Package}
                                label="Your Orders"
                                sub="Track, return or buy items again"
                                path="/orders"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                            <MenuItem
                                icon={CreditCard}
                                label="Order Transactions"
                                sub="View all payments & refunds"
                                path="/transactions"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                            <MenuItem
                                icon={Wallet}
                                label="Wallet"
                                sub="Balance & return refunds"
                                path="/wallet"
                                color="#16A34A"
                                bg="#F0FDF4"
                            />
                            <MenuItem
                                icon={Heart}
                                label="Your Wishlist"
                                sub="Your saved items"
                                path="/wishlist"
                                color="#E53935"
                                bg="#FEF2F2"
                            />
                            <MenuItem
                                icon={MapPin}
                                label="Saved Addresses"
                                sub="Manage your delivery locations"
                                path="/addresses"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-2xs">
                        <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Help & Settings</p>
                        </div>
                        <div className="divide-y divide-[#E2E8F0]">
                            <MenuItem
                                icon={HelpCircle}
                                label="Help & Support"
                                path="/support"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                            <MenuItem
                                icon={ShieldCheck}
                                label="Privacy Policy"
                                path="/privacy"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                            <MenuItem
                                icon={Info}
                                label="About Us"
                                path="/about"
                                color="#123B8E"
                                bg="#EFF6FF"
                            />
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full py-3 rounded-2xl border border-red-200 text-[#E53935] font-bold bg-white hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2 mt-2 shadow-2xs active:scale-98"
                >
                    <LogOut size={18} />
                    Sign out
                </button>

                <div className="text-center pb-8 pt-2">
                    <p className="text-[10px] text-[#64748B] font-semibold">Version 2.4.0 • {appName}</p>
                </div>

            </div>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, sub, path, color = '#334155', bg = 'rgba(148,163,184,0.12)' }) => (
    <Link to={path || '#'} className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
        <div className="flex items-center gap-3">
            <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bg }}
            >
                <Icon
                    size={20}
                    className="transition-colors"
                    style={{ color }}
                />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
                {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
        <div className="p-1.5 rounded-md group-hover:bg-slate-100 transition-colors">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-all group-hover:translate-x-0.5" />
        </div>
    </Link>
);

export default ProfilePage;


