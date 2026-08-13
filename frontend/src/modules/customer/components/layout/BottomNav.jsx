import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Category', icon: LayoutGrid, path: '/categories' },
    { label: 'Orders', icon: ShoppingBag, path: '/orders' },
    { label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav = () => {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-[#E2E8F0] flex flex-col md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-[62px] px-2 relative w-full">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex-1 flex flex-col items-center justify-center h-full relative group transition-all"
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center w-16 h-12 rounded-2xl relative transition-all duration-200",
                                isActive ? "bg-[#EFF6FF] text-[#123B8E] font-bold" : "bg-transparent text-[#64748B]"
                            )}>
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "transition-colors duration-200 mb-0.5",
                                        isActive ? "text-[#123B8E]" : "text-[#64748B]"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] tracking-tight transition-colors duration-200",
                                        isActive ? "text-[#123B8E] font-bold" : "text-[#64748B] font-medium"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;

